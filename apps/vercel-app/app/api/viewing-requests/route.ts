import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { Timestamp, Query } from 'firebase-admin/firestore';
import { verifyRequest, unauthorizedResponse } from '@/lib/server/auth-guard';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyCode,
      visitorName,
      visitorEmail,
      visitorPhone,
      preferredDate,
      preferredTime,
      numberOfPeople,
      message,
    } = body;

    // Validation
    if (!propertyCode || !visitorName || !visitorEmail || !visitorPhone || !preferredDate) {
      return NextResponse.json(
        { error: 'Missing required fields: propertyCode, visitorName, visitorEmail, visitorPhone, preferredDate' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(visitorEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate date is in future
    const requestDate = new Date(preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestDate < today) {
      return NextResponse.json(
        { error: 'Preferred date must be in the future' },
        { status: 400 }
      );
    }

    // Add viewing request to Firestore
    const docRef = await adminDb.collection('viewing_requests').add({
      propertyCode,
      visitorName,
      visitorEmail,
      visitorPhone,
      preferredDate,
      preferredTime: preferredTime || '',
      numberOfPeople: numberOfPeople || 1,
      message: message || '',
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json(
      {
        success: true,
        requestId: docRef.id,
        message: 'Viewing request created successfully'
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('[Viewing Requests] Creation error:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { error: 'Failed to create viewing request' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/viewing-requests
 * Requires authentication (Firebase token or SBR secret key).
 * Supports pagination with ?page=N&limit=N (default limit=20, max=100).
 */
export async function GET(request: NextRequest) {
  try {
    // Auth check — viewing requests contain PII
    const auth = await verifyRequest(request);
    if (!auth.authenticated) {
      return unauthorizedResponse('Authentication required to view requests');
    }

    const { searchParams } = new URL(request.url);
    const propertyCode = searchParams.get('propertyCode');
    const status = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    let ref: Query = adminDb.collection('viewing_requests');

    if (propertyCode) {
      ref = ref.where('propertyCode', '==', propertyCode);
    }
    if (status) {
      ref = ref.where('status', '==', status);
    }

    // Apply pagination
    ref = ref.orderBy('createdAt', 'desc').limit(limit).offset((page - 1) * limit);

    const snapshot = await ref.get();
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      count: requests.length,
      page,
      limit,
      requests
    }, { status: 200 });
  } catch (error: unknown) {
    console.error('[Viewing Requests] Fetch error:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { error: 'Failed to fetch viewing requests' },
      { status: 500 }
    );
  }
}
