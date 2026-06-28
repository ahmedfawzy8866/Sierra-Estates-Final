import { NextRequest, NextResponse } from 'next/server';
import { COLLECTIONS } from '@/lib/models/schema';
import { adminDb, isAdminInitialized } from '@/lib/server/firebase-admin';
import type { Query } from 'firebase-admin/firestore';
import { applyRateLimitAsync, publicEndpointLimiter } from '@/lib/server/rate-limit';
import { logger } from '@sierra-estates/config';
import { unstable_cache } from 'next/cache';

export const revalidate = 60;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'sierra-estates';

interface FirestoreValue {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  arrayValue?: { values: FirestoreValue[] };
  mapValue?: { fields: Record<string, FirestoreValue> };
}

interface FirestoreDocument {
  name?: string;
  fields?: { [key: string]: FirestoreValue };
}

/**
 * Extract value from Firestore document field
 */
function extractValue(field: FirestoreValue): any {
  if (!field) return undefined;
  if (field.stringValue) return field.stringValue;
  if (field.integerValue) return parseInt(field.integerValue, 10);
  if (field.doubleValue) return field.doubleValue;
  if (field.booleanValue) return field.booleanValue;
  if (field.arrayValue?.values) {
    return field.arrayValue.values.map(extractValue);
  }
  if (field.mapValue?.fields) {
    const obj: any = {};
    for (const [key, val] of Object.entries(field.mapValue.fields)) {
      obj[key] = extractValue(val as FirestoreValue);
    }
    return obj;
  }
  return undefined;
}

/**
 * Fetch listings using Firebase Admin SDK (preferred) or REST API fallback.
 * The REST API path is only used when Admin SDK is not initialized.
 */
async function fetchListings(
  collectionName: string,
  limit?: number,
  docId?: string
): Promise<{ doc?: any; docs: any[] } | null> {
  // Prefer Admin SDK — uses proper auth and respects security rules
  if (isAdminInitialized) {
    try {
      if (docId) {
        const snap = await adminDb.collection(collectionName).doc(docId).get();
        if (!snap.exists) return null;
        return { doc: { id: snap.id, ...snap.data() }, docs: [] };
      }
      let query: Query = adminDb.collection(collectionName);
      if (limit) query = query.limit(limit);
      const snapshot = await query.get();
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return { docs };
    } catch (error: unknown) {
      console.error('[LISTINGS_ADMIN_SDK] Error:', error instanceof Error ? error.message : 'Unknown');
    }
  }

  // Fallback: REST API (only if Admin SDK is unavailable AND API key is set)
  if (!API_KEY) {
    console.error('[LISTINGS] Cannot fetch: Admin SDK not initialized and NEXT_PUBLIC_FIREBASE_API_KEY not set');
    return null;
  }

  try {
    const url = new URL(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionName}`
    );

    if (docId) {
      url.pathname += `/${docId}`;
    } else if (limit) {
      url.searchParams.append('pageSize', limit.toString());
    }
    url.searchParams.append('key', API_KEY);

    const response = await fetch(url.toString(), { method: 'GET' });

    if (!response.ok) {
      console.error(`[FIRESTORE_REST] ${response.status}: ${await response.text()}`);
      return null;
    }

    const data = await response.json();

    if (docId) {
      return { doc: data, docs: [] };
    } else {
      return { docs: data.documents || [] };
    }
  } catch (error: unknown) {
    console.error('[FIRESTORE_REST_ERROR]', error instanceof Error ? error.message : 'Unknown');
    return null;
  }
}

/**
 * Transform Firestore document to listing object
 */
function transformToListing(doc: FirestoreDocument): Record<string, unknown> | null {
  if (!doc || !doc.fields) return null;

  const fields = doc.fields;
  const id = doc.name?.split('/').pop() || '';

  return {
    id,
    title: extractValue(fields.title) || 'Untitled Property',
    price: extractValue(fields.price) || 0,
    compound: extractValue(fields.compound) || extractValue(fields.location) || extractValue(fields.city) || '',
    beds: extractValue(fields.bedrooms) || 0,
    baths: extractValue(fields.bathrooms) || 0,
    area: extractValue(fields.area) || 0,
    image: (extractValue(fields.images)?.[0]) || undefined,
    images: extractValue(fields.images) || [],
    description: extractValue(fields.description) || undefined,
    propertyType: extractValue(fields.propertyType) || extractValue(fields.type) || 'apartment',
    status: extractValue(fields.status) || 'available',
    pfReferenceNumber: extractValue(fields.pfReferenceNumber) || null,
  };
}

const getCachedListings = unstable_cache(
  async (collectionName: string, limit?: number, docId?: string) => {
    return fetchListings(collectionName, limit, docId);
  },
  ['public-listings'],
  { revalidate: 60, tags: ['listings'] }
);

export async function GET(request: NextRequest) {
  const limited = await applyRateLimitAsync(request, publicEndpointLimiter);
  if (limited) return limited;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const result = await getCachedListings(COLLECTIONS.units, undefined, id);
      if (!result?.doc) {
        return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
      }
      // Admin SDK returns clean objects; REST returns raw Firestore docs needing transform
      const listing = (result.doc as FirestoreDocument).fields ? transformToListing(result.doc as FirestoreDocument) : result.doc;
      return NextResponse.json({ success: true, listing });
    }

    const limitParam = parseInt(searchParams.get('limit') || '12', 10);
    const result = await getCachedListings(COLLECTIONS.units, limitParam);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch listings from database' },
        { status: 500 }
      );
    }

    // Admin SDK returns clean objects; REST API returns raw Firestore documents needing transform
    const listings = (result.docs || []).map(d => (d as FirestoreDocument).fields ? transformToListing(d as FirestoreDocument) : d).filter(Boolean);

    return NextResponse.json({ success: true, listings, count: listings.length });
  } catch (error: unknown) {
    logger.error({ err: error }, '[LISTINGS_ERROR] Failed to fetch listings');
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
