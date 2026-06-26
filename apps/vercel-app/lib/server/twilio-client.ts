/**
 * SIERRA ESTATES — TWILIO WHATSAPP REST WRAPPER
 *
 * Thin wrapper around the Twilio Messages REST API. Designed for Vercel
 * Edge/Serverless — uses native `fetch` instead of the Twilio SDK to avoid
 * bundle-size bloat on cold starts.
 *
 * This module only knows how to call Twilio and verify/track delivery —
 * it has no opinion on rate limits, operating hours, or queuing. That
 * scheduling logic lives in `lib/server/whatsapp-queue.ts`.
 *
 * Firestore Collections:
 *   - `whatsapp_message_log`   — delivery-status audit trail
 *
 * Usage:
 *   import { sendTwilioWhatsAppMessage, verifyTwilioSignature,
 *            updateMessageStatus } from '@/lib/server/twilio-client';
 */

import { adminDb } from '@/lib/server/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import crypto from 'crypto';

// ─── Configuration ──────────────────────────────────────────────────────────

/** Twilio Account SID (starts with "AC") */
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? '';

/** Twilio Auth Token */
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? '';

/** Twilio Messages REST endpoint */
const TWILIO_MESSAGES_URL = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

// ─── Firestore Collection Names ─────────────────────────────────────────────

const COLL_MESSAGE_LOG = 'whatsapp_message_log';

// ─── Types ──────────────────────────────────────────────────────────────────

/** Input to `logWhatsAppMessage` — timestamps are stamped internally. */
export interface MessageLogEntry {
  messageSid: string;
  to: string;
  from: string;
  body: string;
  status: string;
  senderNumber: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns the current time as a Firestore Timestamp.
 */
function nowAsTimestamp(): FirebaseFirestore.Timestamp {
  return Timestamp.now();
}

// ─── Twilio REST API ────────────────────────────────────────────────────────

/**
 * Sends a single WhatsApp message via the Twilio Messages REST API.
 * Avoids importing the full `twilio` SDK — we only need a single `POST`
 * with Basic auth. No rate limiting, retry, or queuing here; callers
 * (`lib/server/whatsapp-queue.ts`) own that.
 *
 * @param from Sender number, E.164 digits without the leading `+`.
 * @param to   Recipient number, E.164 digits without the leading `+`.
 */
export async function sendTwilioWhatsAppMessage(
  from: string,
  to: string,
  body: string,
): Promise<{ sid?: string; errorCode?: number; errorMessage?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error(
      '[twilio-client] TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set.'
    );
  }

  const credentials = Buffer.from(
    `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
  ).toString('base64');

  const params = new URLSearchParams({
    From: `whatsapp:+${from}`,
    To: `whatsapp:+${to}`,
    Body: body,
  });

  const response = await fetch(TWILIO_MESSAGES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      errorCode: data.code ?? response.status,
      errorMessage: data.message ?? `Twilio API error ${response.status}`,
    };
  }

  return { sid: data.sid };
}

// ─── Public API: Webhook Signature Verification ─────────────────────────────

/**
 * Verifies that an incoming webhook request genuinely originated from Twilio.
 *
 * Twilio signs every webhook request with an `X-Twilio-Signature` header.
 * The signature is a Base64-encoded SHA1 HMAC computed over the concatenation
 * of the URL and the request parameters sorted alphabetically by key, using
 * the Auth Token as the secret.
 *
 * @param url       The full URL that Twilio called (including protocol and query string).
 * @param body      The raw request body **or** the parsed params as a `Record<string, string>`.
 *                  If a string is provided, it is parsed as URL-encoded form data.
 * @param signature The value of the `X-Twilio-Signature` header.
 * @returns `true` if the signature is valid, `false` otherwise.
 *
 * @example
 * ```ts
 * // In an API route handler:
 * import { verifyTwilioSignature } from '@/lib/server/twilio-client';
 *
 * const signature = req.headers.get('X-Twilio-Signature') ?? '';
 * const url = req.url;
 * const body = await req.text();
 * const isValid = verifyTwilioSignature(url, body, signature);
 * if (!isValid) return new Response('Invalid signature', { status: 403 });
 * ```
 */
export function verifyTwilioSignature(
  url: string,
  body: string | Record<string, string>,
  signature: string,
): boolean {
  if (!TWILIO_AUTH_TOKEN) {
    console.error('[twilio-client] Cannot verify signature: TWILIO_AUTH_TOKEN is not set.');
    return false;
  }

  // Parse body into sorted key-value pairs
  let params: Record<string, string>;

  if (typeof body === 'string') {
    params = {};
    const parsed = new URLSearchParams(body);
    parsed.forEach((value, key) => {
      params[key] = value;
    });
  } else {
    params = body;
  }

  // Build the concatenated string: URL + sorted params
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) {
    data += key + params[key];
  }

  // Compute HMAC-SHA1
  const hmac = crypto
    .createHmac('sha1', TWILIO_AUTH_TOKEN)
    .update(data, 'utf8')
    .digest('base64');

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hmac, 'base64'),
      Buffer.from(signature, 'base64'),
    );
  } catch {
    // Length mismatch or invalid base64 — signature is invalid
    return false;
  }
}

// ─── Public API: Delivery Status ────────────────────────────────────────────

/**
 * Updates the delivery status of a WhatsApp message in the
 * `whatsapp_message_log` Firestore collection.
 *
 * Call this from your Twilio status-callback webhook handler to track
 * delivery progress (queued → sent → delivered → read, or undelivered / failed).
 *
 * @param messageSid  The `MessageSid` provided by Twilio.
 * @param status      The new status string (e.g. `'delivered'`, `'read'`,
 *                    `'undelivered'`, `'failed'`).
 *
 * @example
 * ```ts
 * // In a status-callback API route:
 * import { updateMessageStatus } from '@/lib/server/twilio-client';
 *
 * const form = await req.formData();
 * await updateMessageStatus(
 *   form.get('MessageSid') as string,
 *   form.get('MessageStatus') as string,
 * );
 * ```
 */
export async function updateMessageStatus(
  messageSid: string,
  status: string,
): Promise<void> {
  if (!messageSid) {
    console.warn('[twilio-client] updateMessageStatus called with empty messageSid — ignoring.');
    return;
  }

  try {
    // Find the log entry by messageSid
    const snapshot = await adminDb
      .collection(COLL_MESSAGE_LOG)
      .where('messageSid', '==', messageSid)
      .limit(1)
      .get();

    if (snapshot.empty) {
      // No existing log — create a minimal entry
      await adminDb.collection(COLL_MESSAGE_LOG).add({
        messageSid,
        status,
        createdAt: nowAsTimestamp(),
        updatedAt: nowAsTimestamp(),
      });
      console.info(`[twilio-client] Created message log for ${messageSid} with status: ${status}`);
      return;
    }

    // Update the existing entry
    const docId = snapshot.docs[0].id;
    await adminDb.collection(COLL_MESSAGE_LOG).doc(docId).update({
      status,
      updatedAt: nowAsTimestamp(),
    });

    console.info(`[twilio-client] Updated ${messageSid} → ${status}`);
  } catch (err) {
    console.error(
      '[twilio-client] updateMessageStatus failed:',
      err instanceof Error ? err.message : err
    );
    // Intentionally not re-throwing — status updates are non-critical
  }
}

// ─── Message Log Writer ─────────────────────────────────────────────────────

/**
 * Writes a message-log entry to the `whatsapp_message_log` Firestore collection.
 * Called by `lib/server/whatsapp-queue.ts` to record both successful sends and failures.
 */
export async function logWhatsAppMessage(entry: MessageLogEntry): Promise<void> {
  try {
    await adminDb.collection(COLL_MESSAGE_LOG).add({
      ...entry,
      createdAt: nowAsTimestamp(),
      updatedAt: nowAsTimestamp(),
    });
  } catch (err) {
    // Logging is non-critical — swallow the error but report it
    console.error(
      '[twilio-client] Failed to write message log:',
      err instanceof Error ? err.message : err
    );
  }
}
