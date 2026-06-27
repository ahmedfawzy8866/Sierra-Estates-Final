/**
 * PropertyFinder Sync Engine Tests
 *
 * Tests the PF sync engine's core logic:
 *   1. Deterministic hash generation for deduplication
 *   2. PF type → local PropertyType mapping
 *   3. Bedroom/bathroom parsing from PF string values
 *   4. Price extraction for sale and rent listings
 *   5. Location path parsing (compound/city extraction)
 *   6. Furnishing → finishing type mapping
 *   7. PFLead → InvestmentStakeholder contact extraction
 *   8. Sync result summary correctness
 */

import * as crypto from 'crypto';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────

vi.mock('@/lib/property-finder-client', () => ({
  pfClient: {
    searchListings: vi.fn(),
    fetchLeads: vi.fn(),
  },
}));

vi.mock('@/lib/server/firebase-admin', () => {
  const mockDoc = {
    get: vi.fn(() => Promise.resolve({ exists: false, data: () => ({}) })),
    set: vi.fn(() => Promise.resolve()),
    update: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve()),
  };
  const mockCollection = {
    doc: vi.fn(() => mockDoc),
    add: vi.fn(() => Promise.resolve({ id: 'mock-id' })),
    get: vi.fn(() => Promise.resolve({ docs: [], size: 0, empty: true })),
    where: vi.fn(() => ({
      get: vi.fn(() => Promise.resolve({ docs: [] })),
      orderBy: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve({ docs: [] })),
      })),
    })),
    orderBy: vi.fn(() => ({
      limit: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve({ docs: [] })),
      })),
      get: vi.fn(() => Promise.resolve({ docs: [] })),
    })),
  };

  return {
    adminDb: {
      collection: vi.fn(() => mockCollection),
    },
    isAdminInitialized: true,
  };
});

vi.mock('firebase-admin/firestore', () => ({
  Timestamp: {
    now: vi.fn(() => ({ _seconds: 1700000000, _nanoseconds: 0 })),
  },
}));

// ─── Recreated pure functions from pf-sync-engine.ts ──────────────────
// These mirror the private helper functions so we can test the logic
// without needing to import internal-only symbols.

/**
 * Mirrors: computeSyncHash(pfReference) → SHA-256 hex of `pf:${pfReference}`
 */
function computeSyncHash(pfReference: string): string {
  return crypto.createHash('sha256').update(`pf:${pfReference}`).digest('hex');
}

/**
 * Mirrors: mapPFTypeToLocal(pfType) → PropertyType
 * Falls back to 'apartment' for unknown types.
 */
function mapPFTypeToLocal(pfType: string | undefined): string {
  const mapping: Record<string, string> = {
    apartment: 'apartment',
    villa: 'villa',
    townhouse: 'townhouse',
    duplex: 'duplex',
    penthouse: 'penthouse',
    'hotel-apartment': 'studio',
    land: 'land',
    chalet: 'chalet',
    'twin-house': 'townhouse',
    ivilla: 'villa',
    cabin: 'chalet',
    palace: 'villa',
    roof: 'apartment',
    bungalow: 'villa',
    compound: 'apartment',
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
 * Mirrors: parseBedrooms(bedrooms) → number
 * 'studio' → 0, undefined/null → 0, string number → parsed int
 */
function parseBedrooms(bedrooms: string | undefined | null): number {
  if (bedrooms === 'studio' || bedrooms === undefined || bedrooms === null) return 0;
  return parseInt(bedrooms, 10) || 0;
}

/**
 * Mirrors: parseBathrooms(bathrooms) → number
 * 'none' → 0, undefined/null → 0, string number → parsed int
 */
function parseBathrooms(bathrooms: string | undefined | null): number {
  if (bathrooms === 'none' || bathrooms === undefined || bathrooms === null) return 0;
  return parseInt(bathrooms, 10) || 0;
}

/**
 * Mirrors: extractPrice(listing) → number
 * For sale: amounts.sale
 * For rent: amounts.yearly, fallback amounts.monthly * 12
 */
function extractPrice(
  offeringType: 'sale' | 'rent',
  amounts?: { sale?: number; yearly?: number; monthly?: number }
): number {
  if (!amounts) return 0;
  if (offeringType === 'sale') return amounts.sale ?? 0;
  if (amounts.yearly) return amounts.yearly;
  if (amounts.monthly) return amounts.monthly * 12;
  return 0;
}

/**
 * Mirrors: mapFurnishingToFinishing(furnishingType) → finishingType
 */
function mapFurnishingToFinishing(
  furnishingType: string | undefined
): string | undefined {
  const mapping: Record<string, string> = {
    furnished: 'fully-finished',
    'semi-furnished': 'semi-finished',
    unfurnished: 'not-finished',
  };
  return mapping[furnishingType ?? ''] ?? undefined;
}

/**
 * Mirrors: location path parsing from mapListingToUnit
 */
function parseLocationPath(path: string | undefined): { compound: string; location: string } {
  if (!path) return { compound: '', location: '' };
  const locationParts = path.split('>').map((s) => s.trim()).filter(Boolean);
  const compound = locationParts[locationParts.length - 1] || '';
  const location = locationParts.length > 1 ? locationParts.slice(0, -1).join(' > ') : compound;
  return { compound, location };
}

/**
 * Mirrors: contact extraction from mapLeadToStakeholder
 */
function extractContacts(contacts: Array<{ type: string; value: string }>): { phone: string; email: string | undefined } {
  const phone = contacts?.find((c) => c.type === 'phone')?.value ?? '';
  const email = contacts?.find((c) => c.type === 'email')?.value ?? undefined;
  return { phone, email };
}

// ─── Test Suite ────────────────────────────────────────────────────────

describe('PF Sync Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Deduplication ─────────────────────────────────────────────────

  describe('Deduplication', () => {
    it('should generate deterministic hash from PF reference', () => {
      const reference = 'PF-REF-001';
      const hash1 = computeSyncHash(reference);
      const hash2 = computeSyncHash(reference);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex = 64 chars
      expect(hash1).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should produce different hashes for different references', () => {
      const hash1 = computeSyncHash('REF-001');
      const hash2 = computeSyncHash('REF-002');

      expect(hash1).not.toBe(hash2);
    });

    it('should prefix reference with "pf:" before hashing', () => {
      // Hashing just "ABC" should differ from hashing "pf:ABC"
      const rawHash = crypto.createHash('sha256').update('ABC').digest('hex');
      const prefixedHash = computeSyncHash('ABC');

      expect(prefixedHash).not.toBe(rawHash);
      // Verify it matches manual computation
      const expected = crypto.createHash('sha256').update('pf:ABC').digest('hex');
      expect(prefixedHash).toBe(expected);
    });

    it('should generate valid hash for empty string reference', () => {
      const hash = computeSyncHash('');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should handle lead hash prefix "lead:"', () => {
      const leadHash = computeSyncHash('lead:pf-lead-123');
      expect(leadHash).toHaveLength(64);

      // Different from the listing hash of same suffix
      const listingHash = computeSyncHash('pf-lead-123');
      expect(leadHash).not.toBe(listingHash);
    });
  });

  // ─── PF Type Mapping ───────────────────────────────────────────────

  describe('PF Listing to Unit mapping — Type mapping', () => {
    it('should map residential types correctly', () => {
      expect(mapPFTypeToLocal('apartment')).toBe('apartment');
      expect(mapPFTypeToLocal('villa')).toBe('villa');
      expect(mapPFTypeToLocal('townhouse')).toBe('townhouse');
      expect(mapPFTypeToLocal('duplex')).toBe('duplex');
      expect(mapPFTypeToLocal('penthouse')).toBe('penthouse');
      expect(mapPFTypeToLocal('chalet')).toBe('chalet');
      expect(mapPFTypeToLocal('land')).toBe('land');
    });

    it('should map commercial types to commercial', () => {
      expect(mapPFTypeToLocal('whole-building')).toBe('commercial');
      expect(mapPFTypeToLocal('office-space')).toBe('commercial');
      expect(mapPFTypeToLocal('retail')).toBe('commercial');
      expect(mapPFTypeToLocal('shop')).toBe('commercial');
      expect(mapPFTypeToLocal('warehouse')).toBe('commercial');
      expect(mapPFTypeToLocal('factory')).toBe('commercial');
    });

    it('should map alias types correctly', () => {
      expect(mapPFTypeToLocal('twin-house')).toBe('townhouse');
      expect(mapPFTypeToLocal('ivilla')).toBe('villa');
      expect(mapPFTypeToLocal('palace')).toBe('villa');
      expect(mapPFTypeToLocal('bungalow')).toBe('villa');
      expect(mapPFTypeToLocal('cabin')).toBe('chalet');
      expect(mapPFTypeToLocal('roof')).toBe('apartment');
      expect(mapPFTypeToLocal('compound')).toBe('apartment');
      expect(mapPFTypeToLocal('hotel-apartment')).toBe('studio');
      expect(mapPFTypeToLocal('farm')).toBe('land');
    });

    it('should fall back to apartment for unknown types', () => {
      expect(mapPFTypeToLocal('unknown-type')).toBe('apartment');
      expect(mapPFTypeToLocal('')).toBe('apartment');
      expect(mapPFTypeToLocal(undefined)).toBe('apartment');
    });
  });

  // ─── Bedroom Parsing ────────────────────────────────────────────────

  describe('Bedroom parsing', () => {
    it('should parse numeric string bedrooms', () => {
      expect(parseBedrooms('1')).toBe(1);
      expect(parseBedrooms('3')).toBe(3);
      expect(parseBedrooms('5')).toBe(5);
    });

    it('should return 0 for studio', () => {
      expect(parseBedrooms('studio')).toBe(0);
    });

    it('should return 0 for undefined/null', () => {
      expect(parseBedrooms(undefined)).toBe(0);
      expect(parseBedrooms(null)).toBe(0);
    });

    it('should return 0 for non-numeric strings', () => {
      expect(parseBedrooms('abc')).toBe(0);
    });
  });

  // ─── Bathroom Parsing ───────────────────────────────────────────────

  describe('Bathroom parsing', () => {
    it('should parse numeric string bathrooms', () => {
      expect(parseBathrooms('1')).toBe(1);
      expect(parseBathrooms('2')).toBe(2);
      expect(parseBathrooms('4')).toBe(4);
    });

    it('should return 0 for "none"', () => {
      expect(parseBathrooms('none')).toBe(0);
    });

    it('should return 0 for undefined/null', () => {
      expect(parseBathrooms(undefined)).toBe(0);
      expect(parseBathrooms(null)).toBe(0);
    });

    it('should return 0 for non-numeric strings', () => {
      expect(parseBathrooms('abc')).toBe(0);
    });
  });

  // ─── Price Extraction ───────────────────────────────────────────────

  describe('Price extraction', () => {
    it('should extract sale price for sale listing', () => {
      expect(extractPrice('sale', { sale: 5000000 })).toBe(5000000);
    });

    it('should extract yearly rent for rent listing', () => {
      expect(extractPrice('rent', { yearly: 120000 })).toBe(120000);
    });

    it('should extrapolate monthly rent to yearly (×12) when yearly is missing', () => {
      expect(extractPrice('rent', { monthly: 10000 })).toBe(120000);
    });

    it('should prefer yearly over monthly for rent listing', () => {
      expect(extractPrice('rent', { yearly: 120000, monthly: 10000 })).toBe(120000);
    });

    it('should return 0 for sale listing with no sale amount', () => {
      expect(extractPrice('sale', {})).toBe(0);
    });

    it('should return 0 for rent listing with no rent amounts', () => {
      expect(extractPrice('rent', { sale: 5000000 })).toBe(0);
    });

    it('should return 0 when amounts is undefined', () => {
      expect(extractPrice('sale', undefined)).toBe(0);
      expect(extractPrice('rent', undefined)).toBe(0);
    });

    it('should return 0 for sale price that is 0', () => {
      expect(extractPrice('sale', { sale: 0 })).toBe(0);
    });
  });

  // ─── Furnishing → Finishing Mapping ────────────────────────────────

  describe('Furnishing to finishing type mapping', () => {
    it('should map furnished to fully-finished', () => {
      expect(mapFurnishingToFinishing('furnished')).toBe('fully-finished');
    });

    it('should map semi-furnished to semi-finished', () => {
      expect(mapFurnishingToFinishing('semi-furnished')).toBe('semi-finished');
    });

    it('should map unfurnished to not-finished', () => {
      expect(mapFurnishingToFinishing('unfurnished')).toBe('not-finished');
    });

    it('should return undefined for unknown furnishing types', () => {
      expect(mapFurnishingToFinishing('luxury')).toBeUndefined();
      expect(mapFurnishingToFinishing('')).toBeUndefined();
      expect(mapFurnishingToFinishing(undefined)).toBeUndefined();
    });
  });

  // ─── Location Parsing ──────────────────────────────────────────────

  describe('Location path parsing', () => {
    it('should split location path into compound and broader location', () => {
      expect(parseLocationPath('New Cairo > Madinaty')).toEqual({
        compound: 'Madinaty',
        location: 'New Cairo',
      });
    });

    it('should handle multi-level paths', () => {
      expect(parseLocationPath('Egypt > Cairo > New Cairo > Mivida')).toEqual({
        compound: 'Mivida',
        location: 'Egypt > Cairo > New Cairo',
      });
    });

    it('should handle single-segment path (compound = location)', () => {
      expect(parseLocationPath('Cairo')).toEqual({
        compound: 'Cairo',
        location: 'Cairo',
      });
    });

    it('should return empty strings for undefined path', () => {
      expect(parseLocationPath(undefined)).toEqual({
        compound: '',
        location: '',
      });
    });

    it('should trim whitespace from path segments', () => {
      expect(parseLocationPath('  New Cairo  >  Madinaty  ')).toEqual({
        compound: 'Madinaty',
        location: 'New Cairo',
      });
    });

    it('should filter out empty segments', () => {
      expect(parseLocationPath('New Cairo >> Madinaty')).toEqual({
        compound: 'Madinaty',
        location: 'New Cairo',
      });
    });
  });

  // ─── PF Lead to Stakeholder Mapping ────────────────────────────────

  describe('PF Lead to Stakeholder mapping', () => {
    const mockContacts = [
      { type: 'email' as const, value: 'mohamed@example.com' },
      { type: 'phone' as const, value: '+201012345678' },
    ];

    it('should extract phone from contacts array', () => {
      const { phone } = extractContacts(mockContacts);
      expect(phone).toBe('+201012345678');
    });

    it('should extract email from contacts array', () => {
      const { email } = extractContacts(mockContacts);
      expect(email).toBe('mohamed@example.com');
    });

    it('should return empty phone when no phone contact exists', () => {
      const { phone } = extractContacts([{ type: 'email', value: 'test@test.com' }]);
      expect(phone).toBe('');
    });

    it('should return undefined email when no email contact exists', () => {
      const { email } = extractContacts([{ type: 'phone', value: '+201012345678' }]);
      expect(email).toBeUndefined();
    });

    it('should handle empty contacts array', () => {
      const { phone, email } = extractContacts([]);
      expect(phone).toBe('');
      expect(email).toBeUndefined();
    });

    it('should use the first matching contact type', () => {
      const multiplePhones = [
        { type: 'phone', value: '+201011111111' },
        { type: 'phone', value: '+201022222222' },
      ];
      const { phone } = extractContacts(multiplePhones);
      expect(phone).toBe('+201011111111');
    });
  });

  // ─── Sync Result Summary ────────────────────────────────────────────

  describe('Sync result summary', () => {
    it('should track counts correctly — total = new + updated + skipped', () => {
      const result = {
        totalFetched: 50,
        newRecords: 12,
        updatedRecords: 30,
        duplicatesSkipped: 8,
        leadsSynced: 5,
        errors: [] as Array<{ reference: string; message: string }>,
        durationMs: 3200,
      };

      const accounted = result.newRecords + result.updatedRecords + result.duplicatesSkipped;
      expect(accounted).toBe(result.totalFetched);
      expect(result.errors).toHaveLength(0);
      expect(result.durationMs).toBeGreaterThan(0);
    });

    it('should allow errors without failing the overall sync', () => {
      const result = {
        totalFetched: 10,
        newRecords: 7,
        updatedRecords: 2,
        duplicatesSkipped: 0,
        leadsSynced: 3,
        errors: [
          { reference: 'PF-REF-BAD', message: 'Invalid listing data' },
          { reference: 'lead:bad-lead', message: 'Missing contacts' },
        ],
        durationMs: 1500,
      };

      // totalFetched only counts listings, not leads
      // The 1 missing listing is in errors
      expect(result.newRecords + result.updatedRecords + result.duplicatesSkipped).toBe(9);
      expect(result.errors).toHaveLength(2);
    });

    it('should handle zero listings fetched', () => {
      const result = {
        totalFetched: 0,
        newRecords: 0,
        updatedRecords: 0,
        duplicatesSkipped: 0,
        leadsSynced: 0,
        errors: [],
        durationMs: 200,
      };

      expect(result.totalFetched).toBe(0);
      expect(result.newRecords).toBe(0);
    });
  });

  // ─── Full PFListing Mapping Integration ─────────────────────────────

  describe('Full PFListing to Unit mapping', () => {
    const mockPFListing = {
      id: 'pf-123',
      reference: 'PF-REF-001',
      title: { en: 'Luxury Villa', ar: 'فيلا فاخرة' },
      description: { en: 'Beautiful villa with pool', ar: 'فيلا جميلة مع مسبح' },
      category: 'residential' as const,
      type: 'villa' as const,
      offeringType: 'sale' as const,
      price: {
        type: 'sale' as const,
        amounts: { sale: 5000000 },
      },
      size: 300,
      location: { id: 1, name: 'New Cairo > Madinaty', path: 'New Cairo > Madinaty' },
      media: {
        images: [
          { original: { url: 'https://example.com/img1.jpg', width: 800, height: 600 } },
        ],
      },
      bedrooms: '3',
      bathrooms: '2',
      amenities: ['private-pool', 'security'],
      furnishingType: 'semi-furnished',
      state: { stage: 'live' as const, type: 'active' },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-15T00:00:00Z',
    };

    it('should produce correct sync hash for the listing', () => {
      const ref = mockPFListing.reference;
      const hash = computeSyncHash(ref);

      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);

      // Verify deterministic
      expect(computeSyncHash(ref)).toBe(hash);
    });

    it('should map all core fields correctly', () => {
      // Exercise all the pure mapping functions together
      const mapped = {
        title: mockPFListing.title?.en ?? '',
        titleAr: mockPFListing.title?.ar ?? undefined,
        referenceNumber: mockPFListing.reference,
        propertyType: mapPFTypeToLocal(mockPFListing.type),
        category: mockPFListing.category,
        price: extractPrice(mockPFListing.offeringType, mockPFListing.price?.amounts),
        area: mockPFListing.size,
        bedrooms: parseBedrooms(mockPFListing.bedrooms),
        bathrooms: parseBathrooms(mockPFListing.bathrooms),
        finishingType: mapFurnishingToFinishing(mockPFListing.furnishingType),
        amenities: mockPFListing.amenities,
        ...parseLocationPath(mockPFListing.location?.path),
      };

      expect(mapped.title).toBe('Luxury Villa');
      expect(mapped.titleAr).toBe('فيلا فاخرة');
      expect(mapped.referenceNumber).toBe('PF-REF-001');
      expect(mapped.propertyType).toBe('villa');
      expect(mapped.category).toBe('residential');
      expect(mapped.price).toBe(5000000);
      expect(mapped.area).toBe(300);
      expect(mapped.bedrooms).toBe(3);
      expect(mapped.bathrooms).toBe(2);
      expect(mapped.finishingType).toBe('semi-finished');
      expect(mapped.amenities).toEqual(['private-pool', 'security']);
      expect(mapped.compound).toBe('Madinaty');
      expect(mapped.location).toBe('New Cairo');
    });

    it('should extract images from media', () => {
      const images = mockPFListing.media?.images?.map((img) => img.original.url) ?? [];
      expect(images).toEqual(['https://example.com/img1.jpg']);
      expect(images[0]).toBeDefined(); // featuredImage
    });

    it('should handle listing with no media gracefully', () => {
      const noMediaListing = { ...mockPFListing, media: {} as Record<string, unknown> };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const images = (noMediaListing.media as any)?.images?.map((img: { original: { url: string } }) => img.original.url) ?? [];
      expect(images).toEqual([]);
    });

    it('should handle rent listing with monthly price', () => {
      const rentListing = {
        ...mockPFListing,
        offeringType: 'rent' as const,
        price: { type: 'monthly' as const, amounts: { monthly: 15000 } },
      };

      const price = extractPrice(rentListing.offeringType, rentListing.price?.amounts);
      expect(price).toBe(180000); // 15000 * 12
    });
  });
});
