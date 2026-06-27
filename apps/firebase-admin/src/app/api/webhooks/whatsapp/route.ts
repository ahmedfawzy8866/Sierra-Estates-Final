import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppStatusService } from '@/lib/services/WhatsAppStatusService';
import { WhatsAppParserService } from '@/lib/services/WhatsAppParserService';
import crypto from 'crypto';

/**
 * SIERRA ESTATES WEBHOOK ENTRY POINT
 * This endpoint receives real-time streams from messaging gateways.
 *
 * Supports: WhatsApp Business API, Telegram Bot Webhooks, or Automation Bridges.
 *
 * SECURITY: All POST requests must include either:
 *   1. X-Twilio-Signature header (Twilio webhook)
 *   2. X-Webhook-Secret header matching WEBHOOK_SHARED_SECRET env var
 *   3. hub.mode=subscribe + hub.verify_token for Meta webhook verification
 */

const WEBHOOK_SHARED_SECRET = process.env.WEBHOOK_SHARED_SECRET || '';

/**
 * Verify that the incoming webhook request is authentic.
 * Accepts either a Twilio signature or a shared secret header.
 */
function verifyWebhookAuth(request: NextRequest, body: string): boolean {
  // 1. Check for shared secret header (for custom integrations)
  const sharedSecret = request.headers.get('x-webhook-secret');
  if (sharedSecret && WEBHOOK_SHARED_SECRET && sharedSecret === WEBHOOK_SHARED_SECRET) {
    return true;
  }

  // 2. Check for Twilio signature (for Twilio WhatsApp webhooks)
  const twilioSignature = request.headers.get('x-twilio-signature');
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (twilioSignature && authToken) {
    const url = request.url;
    const params = new URLSearchParams(body);
    const sortedKeys = [...params.keys()].sort();
    let data = url;
    for (const key of sortedKeys) {
      data += key + (params.get(key) || '');
    }
    const expected = crypto
      .createHmac('sha1', authToken)
      .update(data, 'utf8')
      .digest('base64');
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected, 'base64'),
        Buffer.from(twilioSignature, 'base64')
      );
    } catch {
      return false;
    }
  }

  // 3. If neither auth method is available and the env is development, allow through
  if (process.env.NODE_ENV === 'development' && !WEBHOOK_SHARED_SECRET && !authToken) {
    console.warn('[webhook] No auth configured — allowing request in development mode');
    return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // ── Verify webhook authenticity ───────────────────────────────────────
    if (!verifyWebhookAuth(req, rawBody)) {
      console.warn('[webhook] Unauthorized POST — missing or invalid auth header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    // Log incoming payload for audit (redact sensitive fields)
    console.info('[webhook] Incoming message from:', body.from || body.From || 'unknown');

    // Update Node Connectivity Heartbeat
    await WhatsAppStatusService.recordHeartbeat('syncing');

    // Dynamic extraction logic (Adapter Pattern)
    // Here we adapt the payload to our internal processing schema.
    const message = body.message?.text || body.text || body.Body;
    const sender = body.from || body.From || "External Signal";
    const group = body.groupName || body.Source || "WhatsApp Broker Group";

    if (!message) {
      return NextResponse.json({ error: "Empty signal ignored" }, { status: 400 });
    }

    // Trigger AI Neural Processing
    const result = await WhatsAppParserService.processIncomingMessage(message, sender, group);

    return NextResponse.json({
      status: "success",
      id: result.id,
      ai_confidence: "high",
      processed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error("[webhook] Critical failure:", error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: "Internal processing error" }, { status: 500 });
  }
}

/**
 * GET Handler for Webhook Verification (Required by Meta/Twilio)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify the webhook setup
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200 });
  }

  // Don't reveal webhook status to unauthenticated requests
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
