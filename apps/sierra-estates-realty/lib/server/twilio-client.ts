import 'server-only';
import { logger } from '@/lib/logger';

/**
 * Minimal Twilio WhatsApp sender over the REST API (no SDK dependency, mirroring
 * lib/server/n8n-client.ts). Sends a WhatsApp message from one of the dedicated
 * sender numbers. Degrades gracefully: when credentials are absent it logs and
 * returns a simulated SID instead of throwing, so the queue worker still drains
 * in dev/preview without live Twilio.
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID;

export const twilioConfigured = Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN);

export interface TwilioSendResult {
  sid: string;
  simulated: boolean;
}

function toWhatsApp(addr: string): string {
  return addr.startsWith('whatsapp:') ? addr : `whatsapp:${addr}`;
}

/**
 * @param fromPhone  E.164 sender (one of the 4 WABA numbers). Ignored when a
 *                   Messaging Service SID is configured (Twilio picks the sender).
 * @param toPhone    E.164 recipient.
 * @param body       Message text.
 * @param statusCallback  Optional URL Twilio posts delivery/read status to.
 */
export async function sendWhatsApp(
  fromPhone: string,
  toPhone: string,
  body: string,
  statusCallback?: string,
): Promise<TwilioSendResult> {
  if (!twilioConfigured) {
    logger.warn(`⚠️ [twilio] Not configured — simulating send to ${toPhone}`);
    return { sid: `SIMULATED_${Date.now()}_${Math.floor(Math.random() * 1e6)}`, simulated: true };
  }

  const form = new URLSearchParams();
  form.set('To', toWhatsApp(toPhone));
  if (TWILIO_MESSAGING_SERVICE_SID) {
    form.set('MessagingServiceSid', TWILIO_MESSAGING_SERVICE_SID);
  } else {
    form.set('From', toWhatsApp(fromPhone));
  }
  form.set('Body', body);
  if (statusCallback) form.set('StatusCallback', statusCallback);

  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
      signal: AbortSignal.timeout(10000),
    },
  );

  const data = (await res.json().catch(() => ({}))) as { sid?: string; message?: string; code?: number };
  if (!res.ok || !data.sid) {
    throw new Error(`Twilio send failed (${res.status}): ${data.message || 'unknown error'}`);
  }
  return { sid: data.sid, simulated: false };
}
