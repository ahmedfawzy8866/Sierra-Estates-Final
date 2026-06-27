import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { verifyRequest, unauthorizedResponse } from '@/lib/server/auth-guard';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * GET /api/admin/owner-negotiations
 * Lists owner negotiations from Firestore `owner_negotiations` collection,
 * ordered by `updatedAt` descending. Supports optional `status` query filter.
 * Requires authentication (Firebase token or SBR secret key).
 */
export async function GET(request: NextRequest) {
  try {
    // Per-request auth check — admin routes must verify each request
    const auth = await verifyRequest(request);
    if (!auth.authenticated) {
      return unauthorizedResponse('Authentication required');
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    let queryRef = adminDb
      .collection('owner_negotiations')
      .orderBy('updatedAt', 'desc');

    if (statusFilter && ['active', 'paused', 'completed'].includes(statusFilter)) {
      queryRef = adminDb
        .collection('owner_negotiations')
        .where('status', '==', statusFilter)
        .orderBy('updatedAt', 'desc');
    }

    // Apply pagination
    queryRef = queryRef.limit(limit).offset((page - 1) * limit);

    const snapshot = await queryRef.get();

    const negotiations = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ownerName: data.ownerName || '',
        // Mask phone for non-superadmin access
        phone: auth.method === 'secret-key' ? data.phone : (data.phone ? '***' + String(data.phone).slice(-4) : ''),
        propertyReference: data.propertyReference || '',
        status: data.status || 'active',
        lastMessagePreview: data.lastMessagePreview || '',
        lastActivityAt: data.lastActivityAt || null,
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
      };
    });

    return NextResponse.json({ success: true, negotiations, page, limit });
  } catch (error: unknown) {
    console.error('[owner-negotiations GET]', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { success: false, error: 'Failed to fetch negotiations' },
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
    // Per-request auth check
    const auth = await verifyRequest(request);
    if (!auth.authenticated) {
      return unauthorizedResponse('Authentication required');
    }

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

    // Validate initialMessage length
    const trimmedMessage = typeof initialMessage === 'string' ? initialMessage.trim() : '';
    if (trimmedMessage.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Initial message must be under 2000 characters' },
        { status: 400 }
      );
    }

    // Build the negotiation document with proper Firestore timestamps
    const negotiationData: Record<string, unknown> = {
      ownerName: typeof ownerName === 'string' ? ownerName.trim() : '',
      phone: normalizedPhone,
      propertyReference: typeof propertyReference === 'string' ? propertyReference.trim() : '',
      status: 'active',
      lastMessagePreview: trimmedMessage ? trimmedMessage.slice(0, 80) : '',
      lastActivityAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Create the parent negotiation document
    const negotiationRef = await adminDb.collection('owner_negotiations').add(negotiationData);

    // If an initial message is provided, create the first message in the subcollection
    if (trimmedMessage) {
      await adminDb
        .collection('owner_negotiations')
        .doc(negotiationRef.id)
        .collection('messages')
        .add({
          direction: 'sent',
          body: trimmedMessage,
          timestamp: FieldValue.serverTimestamp(),
        });
    }

    return NextResponse.json({
      success: true,
      id: negotiationRef.id,
    });
  } catch (error: unknown) {
    console.error('[owner-negotiations POST]', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { success: false, error: 'Failed to create negotiation' },
      { status: 500 }
    );
  }
}
