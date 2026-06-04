import { adminDb } from '@/lib/server/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { COLLECTIONS } from '@/lib/models/schema';
import { SBR_CONFIG } from '@/lib/config';

async function sendTelegramAlert(message: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[Telegram] Bot token or chat ID not configured. Alert will not be sent.');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      console.error('[Telegram API Error]:', await response.json());
      return false;
    }

    console.log('[Telegram] Alert sent successfully');
    return true;
  } catch (error) {
    console.error('[Telegram Send Error]:', error);
    return false;
  }
}

interface ViewingRequest {
  leadId: string;
  unitId: string;
  portfolioId: string;
}

export const POST = async (req: NextRequest) => {
  try {
    const body: ViewingRequest = await req.json();
    const { leadId, unitId, portfolioId } = body;

    if (!leadId || !unitId) {
      return NextResponse.json(
        { error: 'Lead ID and Unit ID are required' },
        { status: 400 }
      );
    }

    // Create viewing request record
    const viewingRef = await adminDb.collection('viewing_requests').add({
      leadId,
      unitId,
      portfolioId,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      requestedAt: new Date().toISOString(),
    });

    // Update lead record
    const leadDoc = await adminDb.collection(COLLECTIONS.stakeholders).doc(leadId).get();
    const leadData = leadDoc.data();

    await adminDb.collection(COLLECTIONS.stakeholders).doc(leadId).update({
      [`viewingRequests.${unitId}`]: {
        requestedAt: FieldValue.serverTimestamp(),
        status: 'pending',
      },
      lastViewingRequestAt: FieldValue.serverTimestamp(),
    });

    // Send Telegram alert to sales team
    const leadName = leadData?.name || 'Unknown Lead';
    const unitData = await adminDb.collection(COLLECTIONS.units).doc(unitId).get();
    const unitTitle = unitData?.data()?.title || 'Unknown Unit';

    const dashboardUrl = `${SBR_CONFIG.siteUrl}/admin/dashboard`;
    const alertMessage = `
📍 <b>New Viewing Request</b>

<b>Investor:</b> ${leadName}
<b>Property:</b> ${unitTitle}
<b>Request ID:</b> <code>${viewingRef.id}</code>
<b>Status:</b> Pending Scheduling

<a href="${dashboardUrl}">View in Dashboard</a>
    `.trim();

    await sendTelegramAlert(alertMessage);

    return NextResponse.json({
      success: true,
      viewingId: viewingRef.id,
      message: 'Viewing request submitted successfully',
    });
  } catch (error) {
    console.error('Error requesting viewing:', error);
    return NextResponse.json(
      { error: 'Failed to request viewing' },
      { status: 500 }
    );
  }
};
