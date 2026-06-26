import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';

/**
 * GET /api/admin/owner-negotiations
 * Lists owner negotiations from Firestore `owner_negotiations` collection,
 * ordered by `updatedAt` descending. Supports optional `status` query filter.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    let queryRef = adminDb
      .collection('owner_negotiations')
      .orderBy('updatedAt', 'desc');

    if (statusFilter && ['active', 'paused', 'completed'].includes(statusFilter)) {
      queryRef = adminDb
        .collection('owner_negotiations')
        .where('status', '==', statusFilter)
        .orderBy('updatedAt', 'desc');
    }

    const snapshot = await queryRef.get();

    const negotiations = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ownerName: data.ownerName || '',
        phone: data.phone || '',
        propertyReference: data.propertyReference || '',
        status: data.status || 'active',
        lastMessagePreview: data.lastMessagePreview || '',
        lastActivityAt: data.lastActivityAt || null,
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
      };
    });

    return NextResponse.json({ success: true, negotiations });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    console.error('[owner-negotiations GET]', message);
    return NextResponse.json(
      { success: false, error: `Failed to fetch negotiations: ${message}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/owner-negotiations
 * Creates a new owner negotiation thread.
 * Required body: { phone: string }
 * Optional body: { ownerName, propertyReference, initialMessage }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ownerName, phone, propertyReference, initialMessage } = body;

    // Validate required fields
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';
    if (!normalizedPhone) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: phone' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Build the negotiation document
    const negotiationData: Record<string, unknown> = {
      ownerName: typeof ownerName === 'string' ? ownerName.trim() : '',
      phone: normalizedPhone,
      propertyReference: typeof propertyReference === 'string' ? propertyReference.trim() : '',
      status: 'active',
      lastMessagePreview: typeof initialMessage === 'string' && initialMessage.trim()
        ? initialMessage.trim().slice(0, 80)
        : '',
      lastActivityAt: now,
      createdAt: now,
      updatedAt: now,
    };

    // Create the parent negotiation document
    const negotiationRef = await adminDb.collection('owner_negotiations').add(negotiationData);

    // If an initial message is provided, create the first message in the subcollection
    const trimmedMessage = typeof initialMessage === 'string' ? initialMessage.trim() : '';
    if (trimmedMessage) {
      await adminDb
        .collection('owner_negotiations')
        .doc(negotiationRef.id)
        .collection('messages')
        .add({
          direction: 'sent',
          body: trimmedMessage,
          timestamp: new Date(),
        });
    }

    return NextResponse.json({
      success: true,
      id: negotiationRef.id,
      negotiation: {
        id: negotiationRef.id,
        ...negotiationData,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    console.error('[owner-negotiations POST]', message);
    return NextResponse.json(
      { success: false, error: `Failed to create negotiation: ${message}` },
      { status: 500 }
    );
  }
}
