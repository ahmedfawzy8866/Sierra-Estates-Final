import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { Timestamp, Query } from 'firebase-admin/firestore';
import { verifyRequest, unauthorizedResponse } from '@/lib/server/auth-guard';
import { applyRateLimitAsync, publicEndpointLimiter } from '@/lib/server/rate-limit';
import { z } from 'zod';

// ── Input Validation Schema ────────────────────────────────────────────
const viewingRequestSchema = z.object({
  propertyCode: z.string().trim().min(1, 'Property code is required').max(50),
  visitorName: z.string().trim().min(1, 'Name is required').max(200),
  visitorEmail: z.string().email('Invalid email format').max(200),
  visitorPhone: z.string().trim().min(1, 'Phone is required').max(50),
  preferredDate: z.string().min(1, 'Preferred date is required'),
  preferredTime: z.string().max(20).optional().default(''),
  numberOfPeople: z.number().int().min(1).max(50).optional().default(1),
  message: z.string().max(2000).optional().default(''),
});

/**
 * POST /api/viewing-requests
 * Public endpoint (for website forms) — validates input with Zod.
 */
export async function POST(request: NextRequest) {
  // Rate limit public form submissions
  const limited = await applyRateLimitAsync(request, publicEndpointLimiter);
  if (limited) return limited;

  try {
    const body = await request.json();

    // ── Validate with Zod ────────────────────────────────────────────
    const parsed = viewingRequestSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid input';
      return NextResponse.json({ error: firstError }, { status: 400 });
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
    } = parsed.data;

    // Validate date is in the future
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
      preferredTime,
      numberOfPeople,
      message,
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