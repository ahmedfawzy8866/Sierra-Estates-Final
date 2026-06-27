/**
 * POST /api/webhooks/twilio-inbound
 * Receives inbound WhatsApp messages from Twilio.
 * Twilio sends application/x-www-form-urlencoded payloads.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyTwilioSignature } from '@/lib/server/twilio-client';

export async function POST(request: NextRequest) {
  try {
    // ── Signature verification ─────────────────────────────────────────────
    const signature = request.headers.get('x-twilio-signature') || '';
    const url = request.url;
    const body = await request.text();

    const isValid = verifyTwilioSignature(url, body, signature);
    if (!isValid) {
      console.warn('[TWILIO-INBOUND] Invalid signature — possible spoofed request');
      return new NextResponse('Invalid signature', { status: 403 });
    }

    // ── Parse form-urlencoded body ─────────────────────────────────────────
    const params = new URLSearchParams(body);
    const from = params.get('From') || '';           // whatsapp:+2010xxxxxxx
    const to = params.get('To') || '';               // our sender number
    const messageBody = params.get('Body') || '';
    const messageSid = params.get('MessageSid') || '';
    const profileName = params.get('ProfileName') || '';

    console.log('[TWILIO-INBOUND]', {
      from,
      to,
      profileName,
      messageSid,
      bodyLength: messageBody.length,
    });

    // ── Store inbound message in Firestore ─────────────────────────────────
    try {
      const { adminDb } = await import('@/lib/server/firebase-admin');
      await adminDb.collection('whatsapp_inbound').add({
        from,
        to,
        body: messageBody,
        messageSid,
        profileName,
        receivedAt: new Date().toISOString(),
        processed: false,
      });
    } catch (dbError) {
      console.error('[TWILIO-INBOUND] Failed to store message:', dbError);
      // Still return 200 so Twilio doesn't retry
    }

    // ── Respond with empty TwiML (acknowledge receipt) ─────────────────────
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error: unknown) {
    console.error('[TWILIO-INBOUND] Error:', error);
    // Return 200 to prevent Twilio retries on our internal errors
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
