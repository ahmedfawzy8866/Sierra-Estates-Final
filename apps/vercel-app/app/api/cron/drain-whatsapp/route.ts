/**
 * GET /api/cron/drain-whatsapp
 * Cron endpoint to drain the WhatsApp outbound message queue.
 * Protected by CRON_SECRET or SBR_SECRET_KEY (via middleware).
 */

import { NextRequest, NextResponse } from 'next/server';
import { drainOutboundQueue } from '@/lib/server/twilio-client';

export async function GET(request: NextRequest) {
  try {
    const result = await drainOutboundQueue();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown drain error';
    console.error('[WHATSAPP-DRAIN] Failed:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
