import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { COLLECTIONS } from '@/lib/models/schema';
import { applyRateLimit, publicEndpointLimiter } from '@/lib/server/rate-limit';

export async function POST(req: Request) {
  const rateLimitResponse = applyRateLimit(req, publicEndpointLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { leadId, unitId, portfolioId } = await req.json();

    if (!leadId || !unitId) {
      return NextResponse.json(
        { error: 'Lead ID and Unit ID are required' },
        { status: 400 }
      );
    }

    // Create a viewing request record
    const viewingDoc = await adminDb.collection(COLLECTIONS.viewings).add({
      leadId,
      unitId,
      portfolioId: portfolioId || null,
      status: 'pending_approval',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update the lead status
    const leadRef = adminDb.collection(COLLECTIONS.stakeholders).doc(leadId);
    const leadSnap = await leadRef.get();

    if (leadSnap.exists) {
      await leadRef.update({
        status: 'Viewing Requested',
        stage: 2,
        updatedAt: new Date()
      });
    }

    // Update the concierge selection if provided
    if (portfolioId) {
      const portfolioRef = adminDb.collection(COLLECTIONS.conciergeSelections).doc(portfolioId);
      await portfolioRef.update({
        [`engagement.requested_viewing`]: new Date(),
        status: 'viewing_requested',
        lastUpdatedUnit: unitId
      });
    }

    return NextResponse.json({
      success: true,
      viewingId: viewingDoc.id,
      message: 'Viewing request received. Laila is preparing matches for agent confirmation.'
    });
  } catch (error: any) {
    console.error('Error requesting viewing:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
