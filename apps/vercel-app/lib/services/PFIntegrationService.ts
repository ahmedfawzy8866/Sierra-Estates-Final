/**
 * Property Finder Integration Service
 *
 * DELEGATION LAYER — all sync operations are now handled by PFSyncEngine
 * (the canonical, paginated, production-grade sync engine).
 *
 * This service exists for backward compatibility with existing callers
 * (cron routes, admin dashboard) and provides a simplified API surface.
 *
 * DO NOT add new sync logic here — add it to PFSyncEngine instead.
 */

import { PFSyncEngine, PFSyncResult } from '../server/pf-sync-engine';
import { adminDb } from '../server/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { COLLECTIONS, Unit } from '../models/schema';
import { pfClient } from '../property-finder-client';
import { PFListingRequest, PFPropertyType } from '../property-finder/types';

export interface PFLeadSyncSummary {
  created: number;
  updated: number;
  skipped: number;
}

export class PFIntegrationService {

  /**
   * Sync incoming leads from Property Finder.
   * Delegates to PFSyncEngine.syncLeadsOnly() for paginated, deduped sync.
   */
  static async syncIncomingLeads(): Promise<PFLeadSyncSummary> {
    const result = await PFSyncEngine.syncLeadsOnly();
    return {
      created: result.leadsSynced,
      updated: 0,    // syncLeadsOnly() does not return updated lead count
      skipped: 0,    // syncLeadsOnly() does not return duplicates-skipped count
    };
  }

  /**
   * Sync incoming listings from Property Finder.
   * Delegates to PFSyncEngine.runFullSync() with leads disabled.
   */
  static async syncIncomingListings() {
    const result = await PFSyncEngine.runFullSync({
      syncLeads: false,
      pageSize: 100,
    });
    return {
      imported: result.newRecords,
      updated: result.updatedRecords,
    };
  }

  /**
   * Publish a local unit listing to Property Finder.
   * This operation is NOT part of PFSyncEngine (which handles inbound sync),
   * so it remains implemented here.
   */
  static async publishListing(unitId: string) {
    const unitSnap = await adminDb.collection(COLLECTIONS.units).doc(unitId).get();
    if (!unitSnap.exists) throw new Error('Unit not found');

    const unit = { id: unitSnap.id, ...unitSnap.data() } as Unit;
    const locationId = await this.resolveLocationId(unit);
    const publicProfileId = await this.resolvePublicProfileId();

    const isRent = unit.status === 'rented';

    const pfListing: PFListingRequest = {
      reference: unit.pfReferenceNumber || `SB-${unitId.slice(0, 8)}`,
      title: { en: unit.title },
      description: { en: unit.description || unit.title },
      price: {
        type: isRent ? 'yearly' : 'sale',
        amounts: isRent ? { yearly: unit.price } : { sale: unit.price }
      },
      type: this.mapPropertyType(unit.propertyType),
      category: 'residential',
      offeringType: isRent ? 'rent' : 'sale',
      bedrooms: String(unit.bedrooms || 0),
      bathrooms: String(unit.bathrooms || 1),
      size: Math.max(unit.area || 0, 1),
      location: { id: locationId },
      media: {
        images: (unit.images || []).map(url => ({ original: { url } })),
      },
    };

    const result = await pfClient.createListing(pfListing);

    await adminDb.collection(COLLECTIONS.units).doc(unitId).update({
      'automation.isPublishedToPF': true,
      pfReferenceNumber: result.reference || String(result.id),
      lastSyncAt: Timestamp.now(),
      syncSource: 'property-finder',
    });

    if (result.id) {
      await pfClient.publishListing(result.id);
    }

    return result;
  }

  private static async resolveLocationId(unit: Unit): Promise<number> {
    const lookup = unit.compound || unit.location || unit.city || 'New Cairo';
    try {
      const result = await pfClient.searchLocations(lookup);
      return result.data[0]?.id || 1;
    } catch {
      return 1;
    }
  }

  private static async resolvePublicProfileId(): Promise<number> {
    try {
      const users = await pfClient.getUsers({ perPage: '1' });
      return users.data[0]?.publicProfile?.id || 1;
    } catch {
      return 1;
    }
  }

  private static mapPropertyType(type: string): PFPropertyType {
    const mapping: Record<string, PFPropertyType> = {
      apartment: 'apartment', villa: 'villa', townhouse: 'townhouse',
      penthouse: 'penthouse', duplex: 'duplex', chalet: 'chalet',
      'twin-house': 'twin-house', palace: 'palace', land: 'land',
    };
    return mapping[type?.toLowerCase()] || 'apartment';
  }
}
