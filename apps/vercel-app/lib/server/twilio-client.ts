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
import 'server-only';

import { adminDb } from '@/lib/server/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import crypto from 'crypto';
import { createLogger } from './logger';

const log = createLogger('twilio');

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

// ─── Sender Selection / Load Balancing ──────────────────────────────────────

/**
 * Retrieves (or initialises) the sender-stats document for a given phone
 * number and the current Cairo-calendar date.
 */
async function getSenderStat(
  phoneNumber: string,
  date: string
): Promise<SenderStat> {
  const docId = `${phoneNumber}_${date}`;
  const snap = await adminDb.collection(COLL_SENDER_STATS).doc(docId).get();

  if (snap.exists) {
    return snap.data() as SenderStat;
  }

  // Initialise a new stat document
  const newStat: SenderStat = {
    phoneNumber,
    date,
    count: 0,
    windowStart: Date.now(),
    windowCount: 0,
    updatedAt: nowAsTimestamp(),
  };

  await adminDb.collection(COLL_SENDER_STATS).doc(docId).set(newStat);
  return newStat;
}

/**
 * Increments the send counter for a given phone number, respecting both
 * the 2-hour window and daily limits.
 *
 * @returns `true` if the increment was applied, `false` if the number
 *          has hit a rate limit.
 */
async function incrementSenderStat(phoneNumber: string): Promise<boolean> {
  const date = getTodayCairo();
  const docId = `${phoneNumber}_${date}`;
  const stat = await getSenderStat(phoneNumber, date);

  const now = Date.now();

  // Reset 2-hour window if it has expired
  const windowExpired = now - stat.windowStart >= TWO_HOURS_MS;
  const currentWindowCount = windowExpired ? 0 : stat.windowCount;

  // Check limits
  if (stat.count >= MAX_PER_DAY_PER_NUMBER) return false;
  if (currentWindowCount >= MAX_PER_WINDOW) return false;

  await adminDb
    .collection(COLL_SENDER_STATS)
    .doc(docId)
    .update({
      count: stat.count + 1,
      windowCount: currentWindowCount + 1,
      windowStart: windowExpired ? now : stat.windowStart,
      updatedAt: nowAsTimestamp(),
    });

  return true;
}

/**
 * Selects the sender number with the lowest daily usage (round-robin via
 * count comparison).  Respects per-number and total-daily limits.
 *
 * @returns The selected phone number, or `null` if all numbers are exhausted.
 */
async function selectSenderNumber(): Promise<string | null> {
  const date = getTodayCairo();

  // Load stats for all senders
  const stats = await Promise.all(
    SENDER_NUMBERS.map(async (num) => {
      const stat = await getSenderStat(num, date);
      return { number: num, stat };
    })
  );

  // Check total daily limit
  const totalDaily = stats.reduce((sum, s) => sum + s.stat.count, 0);
  if (totalDaily >= MAX_TOTAL_DAILY) {
    return null;
  }

  // Sort by daily count ascending — pick the least-used number
  const sorted = stats.sort((a, b) => a.stat.count - b.stat.count);

  for (const { number, stat } of sorted) {
    if (stat.count >= MAX_PER_DAY_PER_NUMBER) continue;

    // Check 2-hour window
    const now = Date.now();
    const windowExpired = now - stat.windowStart >= TWO_HOURS_MS;
    const windowCount = windowExpired ? 0 : stat.windowCount;
    if (windowCount >= MAX_PER_WINDOW) continue;

    return number;
  }

  return null;
}

// ─── Public API: Send Message ───────────────────────────────────────────────

/**
 * Sends a WhatsApp message via Twilio, or queues it for later delivery
 * if we are outside operating hours.
 *
 * Load-balances across the 4 configured WABA sender numbers, picking the
 * one with the lowest daily send count.  If a specific `senderNumber` is
 * provided, that number is used directly (subject to rate limits).
 *
 * @param to          Recipient phone number in E.164 format (without the leading `+`).
 * @param body        Message body (plain text).
 * @param senderNumber  Optional override for the sender number (E.164 without `+`).
 * @returns A `SendMessageResult` describing the outcome.
 *
 * @example
 * ```ts
 * const result = await sendWhatsAppMessage('201012345678', 'Hello from Sierra!');
 * if (result.queued) log.info('Message queued for next operating window');
 * else if (result.success) log.info('Sent:', result.messageSid);
 * ```
 */
export async function sendWhatsAppMessage(
  to: string,
  body: string,
  senderNumber?: string,
): Promise<SendMessageResult> {
  // ── Guard: validate required env vars ────────────────────────────────
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    return {
      success: false,
      errorMessage:
        '[twilio-client] TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are not configured.',
    };
  }

  if (SENDER_NUMBERS.length === 0) {
    return {
      success: false,
      errorMessage:
        '[twilio-client] No WABA sender numbers configured (WABA_NUMBER_1–4).',
    };
  }

  // ── Operating-hours gate ─────────────────────────────────────────────
  if (!isWithinOperatingHours()) {
    return queueMessage(to, body, senderNumber);
  }

  // ── Sender selection ─────────────────────────────────────────────────
  const selectedSender = senderNumber ?? (await selectSenderNumber());

  if (!selectedSender) {
    // All senders exhausted — queue for later
    return queueMessage(to, body, senderNumber);
  }

  // ── Rate-limit check & counter increment ─────────────────────────────
  const allowed = await incrementSenderStat(selectedSender);
  if (!allowed) {
    return queueMessage(to, body, senderNumber);
  }

  // ── Call Twilio REST API ─────────────────────────────────────────────
  try {
    const result = await callTwilioMessagesAPI(selectedSender, to, body);

    if (result.errorCode) {
      log.error(
        `[twilio-client] Twilio API error ${result.errorCode}: ${result.errorMessage}`
      );

      // Log the failure
      await logMessage({
        messageSid: '',
        to,
        from: selectedSender,
        body,
        status: 'failed',
        senderNumber: selectedSender,
        createdAt: nowAsTimestamp(),
      });

      return {
        success: false,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        senderNumber: selectedSender,
      };
    }

    // Log the successful send
    await logMessage({
      messageSid: result.sid ?? '',
      to,
      from: selectedSender,
      body,
      status: 'sent',
      senderNumber: selectedSender,
      createdAt: nowAsTimestamp(),
    });

    return {
      success: true,
      messageSid: result.sid,
      senderNumber: selectedSender,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error('[twilio-client] sendWhatsAppMessage failed:', message);

    return {
      success: false,
      errorMessage: message,
      senderNumber: selectedSender,
    };
  }
}

// ─── Message Queue ──────────────────────────────────────────────────────────

/**
 * Enqueues a message for delivery at the next operating-hours window.
 *
 * @internal Called by `sendWhatsAppMessage` when outside operating hours
 *           or when rate limits are hit.
 */
async function queueMessage(
  to: string,
  body: string,
  senderNumber?: string,
): Promise<SendMessageResult> {
  try {
    const scheduledFor = nextOpWindowTimestamp();

    const item: Omit<OutboundQueueItem, 'updatedAt'> = {
      to,
      body,
      senderNumber: senderNumber ?? undefined,
      status: 'queued',
      createdAt: nowAsTimestamp(),
      scheduledFor,
      attempts: 0,
    };

    const docRef = await adminDb.collection(COLL_OUTBOUND_QUEUE).add(item);

    log.info(
      `[twilio-client] Message queued (${docRef.id}) for ${scheduledFor.toDate().toISOString()}`
    );

    return {
      success: true,
      queued: true,
      senderNumber,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error('[twilio-client] Failed to queue message:', message);

    return {
      success: false,
      errorMessage: `Failed to queue message: ${message}`,
    };
  }
}

// ─── Public API: Drain Outbound Queue ───────────────────────────────────────

/**
 * Processes the outbound message queue, dispatching up to
 * {@link DRAIN_BATCH_SIZE} messages per call.
 *
 * This function should be invoked on a schedule (e.g. via Vercel Cron or
 * an external scheduler) every 1–2 minutes during operating hours.
 *
 * Behaviour:
 *   1. Skips entirely if outside operating hours.
 *   2. Queries `whatsapp_outbound_queue` for `status == 'queued'` and
 *      `scheduledFor <= now`, ordered by `scheduledFor` ascending.
 *   3. For each message: increments sender stats, calls the Twilio API,
 *      and updates the queue item status on success or failure.
 *   4. Messages that exceed {@link MAX_DELIVERY_ATTEMPTS} are marked as
 *      permanently `failed`.
 *
 * @returns An object summarising the drain run.
 *
 * @example
 * ```ts
 * // In a Vercel Cron route: app/api/cron/drain-whatsapp/route.ts
 * import { drainOutboundQueue } from '@/lib/server/twilio-client';
 * export async function GET() {
 *   const result = await drainOutboundQueue();
 *   return Response.json(result);
 * }
 * ```
 */
export async function drainOutboundQueue(): Promise<{
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
}> {
  const summary = { processed: 0, sent: 0, failed: 0, skipped: 0 };

  // ── Respect operating hours ──────────────────────────────────────────
  if (!isWithinOperatingHours()) {
    log.info('[twilio-client] drainOutboundQueue: outside operating hours — skipping.');
    return summary;
  }

  // ── Guard: config ────────────────────────────────────────────────────
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || SENDER_NUMBERS.length === 0) {
    log.warn('[twilio-client] drainOutboundQueue: Twilio not configured — skipping.');
    return summary;
  }

  try {
    const now = Timestamp.now();

    const snapshot = await adminDb
      .collection(COLL_OUTBOUND_QUEUE)
      .where('status', '==', 'queued')
      .where('scheduledFor', '<=', now)
      .orderBy('scheduledFor', 'asc')
      .limit(DRAIN_BATCH_SIZE)
      .get();

    if (snapshot.empty) {
      return summary;
    }

    for (const doc of snapshot.docs) {
      summary.processed += 1;
      const data = doc.data() as OutboundQueueItem;

      // ── Max attempts check ───────────────────────────────────────────
      if (data.attempts >= MAX_DELIVERY_ATTEMPTS) {
        await adminDb.collection(COLL_OUTBOUND_QUEUE).doc(doc.id).update({
          status: 'failed',
          lastError: 'Exceeded maximum delivery attempts',
          updatedAt: nowAsTimestamp(),
        });
        summary.failed += 1;
        continue;
      }

      // ── Sender selection ─────────────────────────────────────────────
      const senderNumber = data.senderNumber ?? (await selectSenderNumber());

      if (!senderNumber) {
        // All senders at capacity — leave queued for next drain cycle
        summary.skipped += 1;
        continue;
      }

      // ── Rate-limit check ─────────────────────────────────────────────
      const allowed = await incrementSenderStat(senderNumber);
      if (!allowed) {
        summary.skipped += 1;
        continue;
      }

      // ── Increment attempt counter ────────────────────────────────────
      await adminDb.collection(COLL_OUTBOUND_QUEUE).doc(doc.id).update({
        attempts: data.attempts + 1,
        updatedAt: nowAsTimestamp(),
      });

      // ── Send via Twilio ──────────────────────────────────────────────
      try {
        const result = await callTwilioMessagesAPI(senderNumber, data.to, data.body);

        if (result.errorCode) {
          await adminDb.collection(COLL_OUTBOUND_QUEUE).doc(doc.id).update({
            status: data.attempts + 1 >= MAX_DELIVERY_ATTEMPTS ? 'failed' : 'queued',
            lastError: `Twilio ${result.errorCode}: ${result.errorMessage}`,
            updatedAt: nowAsTimestamp(),
          });
          summary.failed += 1;
        } else {
          await adminDb.collection(COLL_OUTBOUND_QUEUE).doc(doc.id).update({
            status: 'sent',
            senderNumber,
            updatedAt: nowAsTimestamp(),
          });

          // Log the successful send
          await logMessage({
            messageSid: result.sid ?? '',
            to: data.to,
            from: senderNumber,
            body: data.body,
            status: 'sent',
            senderNumber,
            createdAt: nowAsTimestamp(),
          });

          summary.sent += 1;
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown send error';
        await adminDb.collection(COLL_OUTBOUND_QUEUE).doc(doc.id).update({
          status: data.attempts + 1 >= MAX_DELIVERY_ATTEMPTS ? 'failed' : 'queued',
          lastError: errMsg,
          updatedAt: nowAsTimestamp(),
        });
        summary.failed += 1;
      }
    }
  } catch (err) {
    log.error(
      '[twilio-client] drainOutboundQueue error:',
      err instanceof Error ? err.message : err
    );
  }

  return summary;
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
    log.error('[twilio-client] Cannot verify signature: TWILIO_AUTH_TOKEN is not set.');
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
    log.warn('[twilio-client] updateMessageStatus called with empty messageSid — ignoring.');
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
      log.info(`[twilio-client] Created message log for ${messageSid} with status: ${status}`);
      return;
    }

    // Update the existing entry
    const docId = snapshot.docs[0].id;
    await adminDb.collection(COLL_MESSAGE_LOG).doc(docId).update({
      status,
      updatedAt: nowAsTimestamp(),
    });

    log.info(`[twilio-client] Updated ${messageSid} → ${status}`);
  } catch (err) {
    log.error(
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
    log.error(
      '[twilio-client] Failed to write message log:',
      err instanceof Error ? err.message : err
    );
  }
}
