import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/server/auth-guard';
import { adminDb } from '@/lib/server/firebase-admin';
import { COLLECTIONS } from '@/lib/models/schema';
import { mapListingToSpa, mapSpaToListingPatch } from '@/lib/server/admin-spa-mappers';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '@/lib/logger';

/** Admin-scoped listings CRUD via the Admin SDK — unlike the public /api/listings (read-only REST key). */
export async function GET(req: NextRequest) {
  const authResult = await verifyAdminRequest(req);
  if (!authResult.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const limit = parseInt(new URL(req.url).searchParams.get('limit') || '500', 10);
    const snap = await adminDb.collection(COLLECTIONS.units).limit(limit).get();
    const listings = snap.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => mapListingToSpa(doc.id, doc.data()));

    return NextResponse.json({ success: true, listings });
  } catch (err) {
    logger.error('Error fetching admin listings:', err);
    return NextResponse.json(
      { error: 'Failed to fetch listings', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authResult = await verifyAdminRequest(req);
  if (!authResult.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const patch = mapSpaToListingPatch(body);

    if (!patch.compound || !patch.propertyType) {
      return NextResponse.json({ error: 'cmp and type are required' }, { status: 400 });
    }

    const ref = await adminDb.collection(COLLECTIONS.units).add({
      ...patch,
      status: patch.status || 'available',
      category: 'residential',
      ownerType: 'internal',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    const created = await ref.get();
    return NextResponse.json({ success: true, listing: mapListingToSpa(ref.id, created.data()) });
  } catch (err) {
    logger.error('Error creating listing:', err);
    return NextResponse.json(
      { error: 'Failed to create listing', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
