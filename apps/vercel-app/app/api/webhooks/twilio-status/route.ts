/**
 * POST /api/webhooks/twilio-status
 * Receives delivery status callbacks from Twilio.
 * Twilio sends application/x-www-form-urlencoded payloads.
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateMessageStatus } from '@/lib/server/twilio-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);

    const messageSid = params.get('MessageSid') || '';
    const messageStatus = params.get('MessageStatus') || '';
    const errorCode = params.get('ErrorCode') || '';
    const errorMessage = params.get('ErrorMessage') || '';

    if (!messageSid || !messageStatus) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    console.log('[TWILIO-STATUS]', { messageSid, messageStatus, errorCode });

    // Update the message log in Firestore
    await updateMessageStatus(messageSid, messageStatus);

    // If there's an error, log it
    if (errorCode) {
      console.warn('[TWILIO-STATUS] Delivery error:', {
        messageSid,
        errorCode,
        errorMessage,
      });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error: unknown) {
    console.error('[TWILIO-STATUS] Error:', error);
    return new NextResponse('OK', { status: 200 }); // Prevent retries
  }
}
