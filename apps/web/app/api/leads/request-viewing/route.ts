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

    // Update the concierge selection/portfolio engagement in Firestore
    if (portfolioId) {
      const portfolioRef = adminDb.collection(COLLECTIONS.conciergeSelections).doc(portfolioId);
      await portfolioRef.update({
        [`engagement.requested_viewing`]: new Date(),
        status: 'viewing_requested',
        lastUpdatedUnit: unitId
      });
    }

    // In a production app, we would also update the Lead status or create a task
    // for the agent to approve/schedule the viewing.
    const leadRef = adminDb.collection(COLLECTIONS.stakeholders).doc(leadId);
    const leadSnap = await leadRef.get();
    
    if (leadSnap.exists) {
      await leadRef.update({
        status: 'Viewing Requested',
        stage: 2, // Moves to Stage 2: Agent Approval & Scheduling
        updatedAt: new Date()
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Viewing request received. Laila is preparing matches for agent confirmation.'
    });
  } catch (error: any) {
    console.error('Error requesting viewing:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
