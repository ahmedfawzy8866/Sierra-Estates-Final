import { sendPortfolioViaWhatsApp } from '@/lib/services/portfolio-engine';
import { adminDb, isAdminInitialized } from '@/lib/server/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';

interface SendPortfolioRequest {
  leadId: string;
  phoneNumber?: string;
}

export const POST = async (req: NextRequest) => {
  try {
    const body: SendPortfolioRequest = await req.json();
    const { leadId, phoneNumber } = body;

    if (!leadId || typeof leadId !== 'string' || leadId.length > 128) {
      return NextResponse.json(
        { error: 'A valid lead ID is required' },
        { status: 400 }
      );
    }

    // Use Admin SDK for server-side Firestore access (not Client SDK)
    if (!isAdminInitialized) {
      return NextResponse.json(
        { error: 'Service unavailable — database not configured' },
        { status: 503 }
      );
    }

    // Fetch lead to get phone number if not provided
    const leadSnap = await adminDb.collection('stakeholders').doc(leadId).get();
    if (!leadSnap.exists) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    const lead = leadSnap.data();
    const phone = phoneNumber || lead?.phone || lead?.whatsapp;

    if (!phone) {
      return NextResponse.json(
        { error: 'No phone number found for this lead' },
        { status: 400 }
      );
    }

    // Fetch the concierge portfolio reference
    const portfolioId = lead?.conciergePortfolioId;

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'No portfolio found for this lead. Run curation first.' },
        { status: 400 }
      );
    }

    const portfolioSnap = await adminDb.collection('concierge_selections').doc(portfolioId).get();
    if (!portfolioSnap.exists) {
      return NextResponse.json(
        { error: 'Portfolio data not found' },
        { status: 404 }
      );
    }

    const portfolio: any = { id: portfolioSnap.id, ...portfolioSnap.data() };

    // Send via WhatsApp
    await sendPortfolioViaWhatsApp(leadId, portfolio, phone);

    // Update lead record using Admin SDK with proper server timestamp
    await adminDb.collection('stakeholders').doc(leadId).update({
      conciergePortfolioSentAt: FieldValue.serverTimestamp(),
      conciergePortfolioSentVia: 'whatsapp',
    });

    return NextResponse.json({
      success: true,
      message: `Portfolio sent to ${phone}`,
    });
  } catch (error: unknown) {
    console.error('[Concierge WhatsApp] Error sending portfolio:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { error: 'Failed to send portfolio' },
      { status: 500 }
    );
  }
};
