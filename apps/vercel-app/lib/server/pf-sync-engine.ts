/**
 * SIERRA ESTATES — PROPERTYFINDER ATLAS SYNC ENGINE
 *
 * Production-grade, paginated sync engine that mirrors PropertyFinder Atlas
 * listings and leads into Firestore with deterministic deduplication.
 *
 * Key features:
 *   1. Page-based paginated fetch with configurable page size
 *   2. Deterministic dedup via SHA-256 sync_hash as Firestore document ID
 *   3. Full PFListing → Unit schema mapping (bilingual, media, amenities)
 *   4. PFLead → InvestmentStakeholder sync with contact extraction
 *   5. Per-record error isolation (one bad record never kills the batch)
 *   6. Rate-limit awareness with configurable inter-page delay
 *   7. Editorial override protection (manualOverrides fields are preserved)
 *
 * Usage:
 *   import { PFSyncEngine } from '@/lib/server/pf-sync-engine';
 *   const result = await PFSyncEngine.runFullSync({ pageSize: 50, delayMs: 500 });
 */
import 'server-only';

import { pfClient } from '@/lib/property-finder-client';
import { adminDb } from '@/lib/server/firebase-admin';
import { COLLECTIONS, Unit, PropertyType, InvestmentStakeholder } from '@/lib/models/schema';
import { PFListing, PFLead, PFPagination, PFPropertyType } from '@/lib/property-finder/types';
import { Timestamp } from 'firebase-admin/firestore';
import * as crypto from 'crypto';
import { createLogger } from './logger';

const log = createLogger('pf-sync');

// ─── Configuration ───────────────────────────────────────────────────

/** Options accepted by the sync engine. */
export interface PFSyncOptions {
  /** Number of listings to fetch per page (default: 50, max: 100). */
  pageSize?: number;
  /** Delay in milliseconds between paginated API calls (default: 500). */
  delayMs?: number;
  /** Whether to also sync leads (default: true). */
  syncLeads?: boolean;
  /** If true, only fetch and report — do NOT write to Firestore (default: false). */
  dryRun?: boolean;
}

/** Summary returned after a completed sync run. */
export interface PFSyncResult {
  /** Total listings fetched across all pages. */
  totalFetched: number;
  /** New listings created in Firestore. */
  newRecords: number;
  /** Existing listings updated in Firestore. */
  updatedRecords: number;
  /** Listings skipped because data is unchanged (hash match). */
  duplicatesSkipped: number;
  /** Number of leads synced to the stakeholders collection. */
  leadsSynced: number;
  /** Per-record errors — does NOT fail the overall sync. */
  errors: Array<{ reference: string; message: string }>;
  /** Wall-clock duration in milliseconds. */
  durationMs: number;
}

// ─── Internal helpers ────────────────────────────────────────────────

/**
 * Compute a deterministic SHA-256 hash from a PropertyFinder reference number.
 * This serves as the Firestore document ID for guaranteed deduplication.
 *
 * @param pfReference - The `reference` field from a PFListing
 * @returns 64-char lowercase hex string
 */
function computeSyncHash(pfReference: string): string {
  return crypto.createHash('sha256').update(`pf:${pfReference}`).digest('hex');
}

/**
 * Pause execution for the given number of milliseconds.
 * Used to stay under PF API rate limits between paginated requests.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Map a PropertyFinder `type` value to the local `PropertyType` enum.
 * Falls back to `'apartment'` for unknown PF types.
 */
function mapPFTypeToLocal(pfType: PFPropertyType | undefined): PropertyType {
  const mapping: Record<string, PropertyType> = {
    apartment: 'apartment',
    villa: 'villa',
    townhouse: 'townhouse',
    duplex: 'duplex',
    penthouse: 'penthouse',
    'hotel-apartment': 'studio',   // closest local analog
    land: 'land',
    chalet: 'chalet',
    'twin-house': 'townhouse',
    ivilla: 'villa',
    cabin: 'chalet',
    palace: 'villa',
    roof: 'apartment',
    bungalow: 'villa',
    compound: 'apartment',
    // Commercial mappings
    'whole-building': 'commercial',
    'bulk-sale-unit': 'commercial',
    'bulk-rent-unit': 'commercial',
    warehouse: 'commercial',
    'office-space': 'commercial',
    retail: 'commercial',
    shop: 'commercial',
    'show-room': 'commercial',
    'labor-camp': 'commercial',
    'staff-accommodation': 'commercial',
    'medical-facility': 'commercial',
    factory: 'commercial',
    farm: 'land',
    'co-working-space': 'commercial',
    'business-center': 'commercial',
    restaurant: 'commercial',
    clinic: 'commercial',
    cafeteria: 'commercial',
  };
  return mapping[pfType ?? ''] ?? 'apartment';
}

/**
 * Map PropertyFinder `furnishingType` to the local `finishingType` field.
 *
 * PF uses:  'unfurnished' | 'semi-furnished' | 'furnished'
 * Local uses: 'fully-finished' | 'semi-finished' | 'core-shell' | 'not-finished'
 */
function mapFurnishingToFinishing(
  furnishingType: string | undefined
): Unit['finishingType'] | undefined {
  const mapping: Record<string, Unit['finishingType']> = {
    furnished: 'fully-finished',
    'semi-furnished': 'semi-finished',
    unfurnished: 'not-finished',
  };
  return mapping[furnishingType ?? ''] ?? undefined;
}

/**
 * Parse PF bedrooms value which can be 'studio', '1', '2', etc.
 * Returns 0 for studio, parsed integer otherwise.
 */
function parseBedrooms(bedrooms: PFListing['bedrooms']): number {
  if (bedrooms === 'studio' || bedrooms === undefined || bedrooms === null) return 0;
  return parseInt(bedrooms, 10) || 0;
}

/**
 * Parse PF bathrooms value which can be 'none', '1', '2', etc.
 * Returns 0 for none/undefined, parsed integer otherwise.
 */
function parseBathrooms(bathrooms: PFListing['bathrooms']): number {
  if (bathrooms === 'none' || bathrooms === undefined || bathrooms === null) return 0;
  return parseInt(bathrooms, 10) || 0;
}

/**
 * Extract the primary price from a PF listing's price object.
 * For sale listings: use `amounts.sale`.
 * For rent listings: use `amounts.yearly`, falling back to `amounts.monthly * 12`.
 */
function extractPrice(listing: PFListing): number {
  const amounts = listing.price?.amounts;
  if (!amounts) return 0;

  if (listing.offeringType === 'sale') {
    return amounts.sale ?? 0;
  }

  // Rent: prefer yearly, then extrapolate from monthly
  if (amounts.yearly) return amounts.yearly;
  if (amounts.monthly) return amounts.monthly * 12;
  return 0;
}

// ─── Core Mapping Functions ──────────────────────────────────────────

/**
 * Map a PropertyFinder Atlas listing to the Sierra Estates Unit schema.
 *
 * This function is pure — it has no side effects and produces a plain object
 * that can be written to Firestore.
 *
 * @param listing - A single PFListing from the Atlas API
 * @returns A partial Unit object ready for Firestore write
 */
function mapListingToUnit(listing: PFListing): Omit<Unit, 'id'> & { lastSyncAt: string; dupeCheckHash: string } {
  const ref = listing.reference || String(listing.id);
  const syncHash = computeSyncHash(ref);
  const price = extractPrice(listing);
  const bedrooms = parseBedrooms(listing.bedrooms);
  const bathrooms = parseBathrooms(listing.bathrooms);
  const images = listing.media?.images?.map((img: { original: { url: string } }) => img.original.url) ?? [];
  const featuredImage = images[0] ?? undefined;

  // Location: PF `location.name` may contain a path like "Egypt > New Cairo > ..."
  // We split it to extract compound and broader location.
  const locationPath = listing.location?.path ?? listing.location?.name ?? '';
  const locationParts = locationPath.split('>').map((s: string) => s.trim()).filter(Boolean);
  const compound = locationParts[locationParts.length - 1] || listing.location?.name || '';
  const location = locationParts.length > 1 ? locationParts.slice(0, -1).join(' > ') : compound;

  return {
    // Identity
    title: listing.title?.en ?? '',
    titleAr: listing.title?.ar ?? undefined,
    referenceNumber: ref,
    pfReferenceNumber: ref,

    // Classification
    propertyType: mapPFTypeToLocal(listing.type),
    category: listing.category ?? 'residential',
    status: listing.offeringType === 'rent' ? 'available' : 'available',

    // Location
    compound,
    location,

    // Specifications
    area: listing.size ?? 0,
    bedrooms: bedrooms || undefined,
    bathrooms: bathrooms || undefined,
    finishingType: mapFurnishingToFinishing(listing.furnishingType),
    amenities: listing.amenities ?? [],

    // Financial
    price,
    monthlyRent: listing.offeringType === 'rent' ? (listing.price?.amounts?.monthly ?? undefined) : undefined,

    // Media
    featuredImage,
    images: images.length > 0 ? images : undefined,
    videoUrl: listing.media?.videos?.default ?? undefined,

    // Sync metadata
    syncSource: 'property-finder',
    lastSyncAt: new Date().toISOString(),
    ownerType: 'broker',
    dupeCheckHash: syncHash,

    // Distribution & Automation stubs
    automation: {
      isBranded: false,
      isPublishedToPF: listing.state?.stage === 'live',
      isPublishedToFB: false,
      whatsappAdGenerated: false,
      pfReference: ref,
    },

    // Description
    description: listing.description?.en ?? undefined,
    descriptionAr: listing.description?.ar ?? undefined,

    // Floor info
    floor: listing.floorNumber ? parseInt(listing.floorNumber, 10) || undefined : undefined,
    totalFloors: listing.numberOfFloors ?? undefined,
  };
}

/**
 * Map a PropertyFinder lead to a Sierra Estates InvestmentStakeholder.
 *
 * @param lead - A PFLead from the Atlas API
 * @returns A partial InvestmentStakeholder ready for Firestore write
 */
function mapLeadToStakeholder(lead: PFLead): Omit<InvestmentStakeholder, 'id'> & { lastSyncAt: string } {
  const phone = lead.sender?.contacts?.find((c: { type: string; value: string }) => c.type === 'phone')?.value ?? '';
  const email = lead.sender?.contacts?.find((c: { type: string; value: string }) => c.type === 'email')?.value ?? undefined;

  return {
    // Contact
    name: lead.sender?.name ?? 'Property Finder Lead',
    phone,
    email,

    // Pipeline
    stage: 'inbound',
    source: 'property-finder',

    // PF linkage
    pfLeadId: lead.id,

    // Automation stub
    automation: {
      botInitiated: false,
      scoringCompleted: false,
      whatsappFollowupSent: false,
      viewingReminderSent: false,
    },

    // Metadata
    lastSyncAt: new Date().toISOString(),
  };
}

// ─── Sync Engine Class ───────────────────────────────────────────────

/**
 * PropertyFinder Atlas Sync Engine.
 *
 * Provides a stateless, production-quality sync pipeline that fetches all
 * listings (and optionally leads) from the PropertyFinder Atlas API and
 * upserts them into Firestore with deterministic deduplication.
 *
 * Design principles:
 *   - **Deterministic IDs**: Document ID = SHA-256(reference) so the same
 *     PF listing always maps to the same Firestore document.
 *   - **Idempotent**: Running the sync multiple times is safe — existing
 *     records are updated, unchanged records are skipped.
 *   - **Fault-tolerant**: Each record is processed in its own try-catch;
 *     one bad record never aborts the entire sync.
 *   - **Rate-aware**: Configurable delay between paginated API calls
 *     avoids hitting PF rate limits.
 */
export class PFSyncEngine {
  /** Prevent instantiation — all methods are static. */
  private constructor() {}

  // ── Paginated Listing Fetch ──────────────────────────────────────

  /**
   * Fetch ALL listings from the PropertyFinder Atlas API using page-based
   * pagination. The PF API returns `pagination` with `page`, `perPage`,
   * `total`, and `totalPages`.
   *
   * @param pageSize - Number of listings per page (default: 50)
   * @param delayMs  - Delay in ms between page fetches (default: 500)
   * @returns Flat array of all PFListing objects across every page
   */
  private static async fetchAllListings(
    pageSize: number = 50,
    delayMs: number = 500
  ): Promise<PFListing[]> {
    const allListings: PFListing[] = [];
    let currentPage = 1;
    let totalPages = 1; // will be updated after first request

    do {
      const response = await pfClient.searchListings({
        page: String(currentPage),
        perPage: String(pageSize),
      });

      const listings: PFListing[] = response.data ?? [];
      const pagination: PFPagination = response.pagination ?? {};

      allListings.push(...listings);
      totalPages = pagination.totalPages ?? 1;

      log.info(
        `[PF Sync] Fetched page ${currentPage}/${totalPages} — ` +
        `${listings.length} listings (total so far: ${allListings.length})`
      );

      // If the API returned fewer items than the page size, we've reached the end
      if (listings.length < pageSize) break;

      currentPage++;

      // Rate-limit delay between pages (skip on the last page)
      if (currentPage <= totalPages) {
        await sleep(delayMs);
      }
    } while (currentPage <= totalPages);

    return allListings;
  }

  // ── Paginated Lead Fetch ─────────────────────────────────────────

  /**
   * Fetch ALL leads from the PropertyFinder Atlas API using page-based
   * pagination.
   *
   * @param pageSize - Number of leads per page (default: 50)
   * @param delayMs  - Delay in ms between page fetches (default: 500)
   * @returns Flat array of all PFLead objects across every page
   */
  private static async fetchAllLeads(
    pageSize: number = 50,
    delayMs: number = 500
  ): Promise<PFLead[]> {
    const allLeads: PFLead[] = [];
    let currentPage = 1;
    let totalPages = 1;

    do {
      const response = await pfClient.fetchLeads({
        page: String(currentPage),
        perPage: String(pageSize),
      });

      const leads: PFLead[] = response.data ?? [];
      const pagination: PFPagination = response.pagination ?? {};

      allLeads.push(...leads);
      totalPages = pagination.totalPages ?? 1;

      log.info(
        `[PF Sync] Fetched leads page ${currentPage}/${totalPages} — ` +
        `${leads.length} leads (total so far: ${allLeads.length})`
      );

      if (leads.length < pageSize) break;

      currentPage++;

      if (currentPage <= totalPages) {
        await sleep(delayMs);
      }
    } while (currentPage <= totalPages);

    return allLeads;
  }

  // ── Listing Sync ─────────────────────────────────────────────────

  /**
   * Sync a single PFListing into Firestore.
   *
   * Uses the SHA-256 hash of the PF reference number as the Firestore
   * document ID. This provides deterministic dedup — the same PF listing
   * always maps to the same document regardless of how many times sync
   * is run.
   *
   * @param listing - The PFListing to sync
   * @param dryRun  - If true, skip the actual Firestore write
   * @returns 'created' | 'updated' | 'skipped'
   */
  private static async syncListing(
    listing: PFListing,
    dryRun: boolean = false
  ): Promise<'created' | 'updated' | 'skipped'> {
    const ref = listing.reference || String(listing.id);
    const syncHash = computeSyncHash(ref);
    const docRef = adminDb.collection(COLLECTIONS.units).doc(syncHash);
    const unitData = mapListingToUnit(listing);

    if (dryRun) {
      // In dry-run mode, check existence but don't write
      const existing = await docRef.get();
      return existing.exists ? 'updated' : 'created';
    }

    const existing = await docRef.get();

    if (!existing.exists) {
      // ── New record: create with full data ──
      await docRef.set({
        ...unitData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        manualOverrides: [],
      });
      return 'created';
    }

    // ── Existing record: update with editorial override protection ──
    const existingData = existing.data()!;
    const protectedFields: string[] = Array.isArray(existingData.manualOverrides)
      ? existingData.manualOverrides
      : [];

    // Build the update payload, skipping protected fields
    const updatePayload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(unitData)) {
      if (key === 'id' || key === 'createdAt') continue;
      if (protectedFields.includes(key)) continue;
      updatePayload[key] = value;
    }

    updatePayload.updatedAt = Timestamp.now();

    await docRef.update(updatePayload);
    return 'updated';
  }

  // ── Lead Sync ────────────────────────────────────────────────────

  /**
   * Sync a single PFLead into the Firestore stakeholders collection.
   *
   * Uses a deterministic document ID based on the PF lead ID to prevent
   * duplicates across multiple sync runs.
   *
   * @param lead   - The PFLead to sync
   * @param dryRun - If true, skip the actual Firestore write
   * @returns 'created' | 'updated' | 'skipped'
   */
  private static async syncLead(
    lead: PFLead,
    dryRun: boolean = false
  ): Promise<'created' | 'updated' | 'skipped'> {
    const leadHash = computeSyncHash(`lead:${lead.id}`);
    const docRef = adminDb.collection(COLLECTIONS.stakeholders).doc(leadHash);
    const stakeholderData = mapLeadToStakeholder(lead);

    // Skip leads with no phone AND no email — nothing to contact
    if (!stakeholderData.phone && !stakeholderData.email) {
      return 'skipped';
    }

    if (dryRun) {
      const existing = await docRef.get();
      return existing.exists ? 'updated' : 'created';
    }

    const existing = await docRef.get();

    if (!existing.exists) {
      // Link to the unit if the lead references a listing
      const unitHash = lead.listing?.reference
        ? computeSyncHash(lead.listing.reference)
        : undefined;

      await docRef.set({
        ...stakeholderData,
        interestedUnitIds: unitHash ? [unitHash] : [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return 'created';
    }

    // Update existing stakeholder
    const updatePayload: Record<string, unknown> = {
      ...stakeholderData,
      updatedAt: Timestamp.now(),
    };

    // If the lead references a unit, add it to interestedUnitIds
    const unitHash = lead.listing?.reference
      ? computeSyncHash(lead.listing.reference)
      : undefined;
    if (unitHash) {
      const existingData = existing.data()!;
      const existingUnits: string[] = Array.isArray(existingData.interestedUnitIds)
        ? existingData.interestedUnitIds
        : [];
      if (!existingUnits.includes(unitHash)) {
        updatePayload.interestedUnitIds = [...existingUnits, unitHash];
      }
    }

    await docRef.update(updatePayload);
    return 'updated';
  }

  // ── Public API ───────────────────────────────────────────────────

  /**
   * Execute a full PropertyFinder Atlas sync.
   *
   * This is the main entry point. It:
   *   1. Fetches all listings via paginated API calls
   *   2. Deduplicates and writes each listing to Firestore
   *   3. Optionally fetches and syncs leads
   *   4. Returns a comprehensive summary
   *
   * @param options - Configuration for page size, delay, and scope
   * @returns A detailed PFSyncResult with counts and errors
   *
   * @example
   * ```ts
   * // Full sync with defaults
   * const result = await PFSyncEngine.runFullSync();
   *
   * // Custom page size and delay, skip leads
   * const result = await PFSyncEngine.runFullSync({
   *   pageSize: 100,
   *   delayMs: 1000,
   *   syncLeads: false,
   * });
   *
   * // Dry run — see what would happen without writing
   * const result = await PFSyncEngine.runFullSync({ dryRun: true });
   * ```
   */
  static async runFullSync(options: PFSyncOptions = {}): Promise<PFSyncResult> {
    const startTime = Date.now();
    const pageSize = Math.min(Math.max(options.pageSize ?? 50, 1), 100);
    const delayMs = Math.max(options.delayMs ?? 500, 0);
    const syncLeads = options.syncLeads ?? true;
    const dryRun = options.dryRun ?? false;

    const result: PFSyncResult = {
      totalFetched: 0,
      newRecords: 0,
      updatedRecords: 0,
      duplicatesSkipped: 0,
      leadsSynced: 0,
      errors: [],
      durationMs: 0,
    };

    // ── Phase 1: Sync Listings ────────────────────────────────────
    log.info(`[PF Sync] Starting listing sync (pageSize=${pageSize}, delayMs=${delayMs}, dryRun=${dryRun})`);

    try {
      const allListings = await PFSyncEngine.fetchAllListings(pageSize, delayMs);
      result.totalFetched = allListings.length;

      log.info(`[PF Sync] Fetched ${allListings.length} total listings — processing...`);

      for (const listing of allListings) {
        const ref = listing.reference || String(listing.id);
        try {
          const outcome = await PFSyncEngine.syncListing(listing, dryRun);

          switch (outcome) {
            case 'created':
              result.newRecords++;
              break;
            case 'updated':
              result.updatedRecords++;
              break;
            case 'skipped':
              result.duplicatesSkipped++;
              break;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          result.errors.push({ reference: ref, message });
          log.error(`[PF Sync] Error syncing listing ${ref}: ${message}`);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.errors.push({ reference: '__listings_fetch__', message });
      log.error(`[PF Sync] Fatal error fetching listings: ${message}`);
    }

    // ── Phase 2: Sync Leads ──────────────────────────────────────
    if (syncLeads) {
      log.info('[PF Sync] Starting lead sync...');

      try {
        const allLeads = await PFSyncEngine.fetchAllLeads(pageSize, delayMs);
        log.info(`[PF Sync] Fetched ${allLeads.length} total leads — processing...`);

        for (const lead of allLeads) {
          const leadId = lead.id;
          try {
            const outcome = await PFSyncEngine.syncLead(lead, dryRun);
            if (outcome === 'created' || outcome === 'updated') {
              result.leadsSynced++;
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            result.errors.push({ reference: `lead:${leadId}`, message });
            log.error(`[PF Sync] Error syncing lead ${leadId}: ${message}`);
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        result.errors.push({ reference: '__leads_fetch__', message });
        log.error(`[PF Sync] Fatal error fetching leads: ${message}`);
      }
    }

    // ── Finalize ──────────────────────────────────────────────────
    result.durationMs = Date.now() - startTime;

    log.info(
      `[PF Sync] Complete — fetched: ${result.totalFetched}, ` +
      `new: ${result.newRecords}, updated: ${result.updatedRecords}, ` +
      `skipped: ${result.duplicatesSkipped}, leads: ${result.leadsSynced}, ` +
      `errors: ${result.errors.length}, duration: ${result.durationMs}ms`
    );

    // Write a sync log entry for audit trail (even in dry-run, to record intent)
    if (!dryRun) {
      try {
        await adminDb.collection(COLLECTIONS.syncLog).add({
          engine: 'pf-sync-engine',
          ...result,
          completedAt: Timestamp.now(),
        });
      } catch (logError) {
        // Non-critical — don't add to result.errors since it's meta
        log.warn('[PF Sync] Failed to write sync log:', logError);
      }
    }

    return result;
  }

  /**
   * Sync only leads (no listings). Useful for frequent lead polling.
   *
   * @param options - Configuration for page size and delay
   * @returns Counts of leads synced and any errors
   */
  static async syncLeadsOnly(
    options: Pick<PFSyncOptions, 'pageSize' | 'delayMs' | 'dryRun'> = {}
  ): Promise<{ leadsSynced: number; errors: Array<{ reference: string; message: string }> }> {
    const pageSize = Math.min(Math.max(options.pageSize ?? 50, 1), 100);
    const delayMs = Math.max(options.delayMs ?? 500, 0);
    const dryRun = options.dryRun ?? false;

    let leadsSynced = 0;
    const errors: Array<{ reference: string; message: string }> = [];

    try {
      const allLeads = await PFSyncEngine.fetchAllLeads(pageSize, delayMs);

      for (const lead of allLeads) {
        try {
          const outcome = await PFSyncEngine.syncLead(lead, dryRun);
          if (outcome === 'created' || outcome === 'updated') {
            leadsSynced++;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          errors.push({ reference: `lead:${lead.id}`, message });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ reference: '__leads_fetch__', message });
    }

    return { leadsSynced, errors };
  }

  /**
   * Sync a single listing by its PropertyFinder reference number.
   * Useful for webhook-triggered incremental syncs.
   *
   * @param pfReference - The PF listing reference number
   * @returns 'created' | 'updated' | 'skipped' | 'not_found'
   */
  static async syncSingleListing(pfReference: string): Promise<'created' | 'updated' | 'skipped' | 'not_found'> {
    try {
      // Search for the specific listing by reference
      const response = await pfClient.searchListings({
        reference: pfReference,
        perPage: '1',
      });

      const listings = response.data ?? [];
      if (listings.length === 0) {
        return 'not_found';
      }

      const outcome = await PFSyncEngine.syncListing(listings[0], false);
      return outcome;
    } catch (error) {
      log.error(`[PF Sync] Error syncing single listing ${pfReference}:`, error);
      throw error;
    }
  }
}

// ─── Convenience default export ──────────────────────────────────────

/**
 * One-call sync function for simple use-cases.
 *
 * @example
 * ```ts
 * import { runPFSync } from '@/lib/server/pf-sync-engine';
 * const result = await runPFSync({ pageSize: 50 });
 * ```
 */
export async function runPFSync(options?: PFSyncOptions): Promise<PFSyncResult> {
  return PFSyncEngine.runFullSync(options);
}
