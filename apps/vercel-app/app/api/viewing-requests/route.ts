import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { Timestamp, Query } from 'firebase-admin/firestore';
import { verifyRequest, unauthorizedResponse } from '@/lib/server/auth-guard';
import { z } from 'zod';

// ─── Input Validation Schema ────────────────────────────────────────────────

const ViewingRequestSchema = z.object({
  propertyCode: z.string().min(1, 'propertyCode is required').max(50, 'propertyCode too long'),
  visitorName: z.string().min(1, 'visitorName is required').max(200, 'visitorName too long'),
  visitorEmail: z.string().email('Invalid email format').max(254, 'Email too long'),
  visitorPhone: z.string().min(1, 'visitorPhone is required').max(50, 'Phone too long'),
  preferredDate: z.string().min(1, 'preferredDate is required').refine(
    (val) => { const d = new Date(val); const today = new Date(); today.setHours(0,0,0,0); return d >= today; },
    { message: 'Preferred date must be in the future' }
  ),
  preferredTime: z.string().max(20).optional(),
  numberOfPeople: z.number().int().min(1).max(50).optional(),
  message: z.string().max(2000, 'Message too long').optional(),
});

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();

    // Validate input with Zod
    const parseResult = ViewingRequestSchema.safeParse(raw);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      );
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const {
      propertyCode,
      visitorName,
      visitorEmail,
      visitorPhone,
      preferredDate,
      preferredTime,
      numberOfPeople,
      message,
    } = parseResult.data;

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
