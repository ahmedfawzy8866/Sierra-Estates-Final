/**
 * SIERRA ESTATES — WHATSAPP OUTBOUND QUEUE
 *
 * Owns everything around *when* and *through which number* an outbound
 * WhatsApp message goes out. `twilio-client.ts` stays a dumb Twilio REST
 * wrapper; this module is the scheduler sitting in front of it:
 *
 *   - Round-robin load balancing across the 4 WABA sender numbers
 *   - Per-number rate limiting (30 msg / 2 hr fixed window)
 *   - Operating-hours gating (12:00–20:00 Africa/Cairo) — outside that
 *     window, or once a number is rate-limited, the message is queued
 *     instead of dropped
 *   - Exponential-backoff retry on Twilio send failures
 *
 * Backend: Upstash Redis (`@upstash/redis` + `@upstash/ratelimit`) when
 * `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are set — required
 * for correctness across multiple serverless instances. Falls back to an
 * in-memory store otherwise (local dev / CI / no Redis configured yet),
 * mirroring the fallback convention already used in `lib/server/rate-limit.ts`.
 *
 * Usage:
 *   import { enqueueWhatsAppMessage, drainWhatsAppQueue } from '@/lib/server/whatsapp-queue';
 */

import { sendTwilioWhatsAppMessage, logWhatsAppMessage } from '@/lib/server/twilio-client';

// ─── Configuration ──────────────────────────────────────────────────────────

/** Pool of WhatsApp Business sender numbers (E.164 digits, no leading +). */
const SENDER_NUMBERS: string[] = [
  process.env.WABA_NUMBER_1 ?? '',
  process.env.WABA_NUMBER_2 ?? '',
  process.env.WABA_NUMBER_3 ?? '',
  process.env.WABA_NUMBER_4 ?? '',
].filter(Boolean);

/** Maximum messages a single sender number may send per 2-hour fixed window. */
const MAX_PER_WINDOW = 30;

/** Window size for the per-number rate limit. */
const WINDOW_MS = 2 * 60 * 60 * 1000;
const WINDOW_LABEL = '2 h';

/** Operating hours, Africa/Cairo (24h clock). */
const OPS_START_HOUR = 12;
const OPS_END_HOUR = 20;
const CAIRO_OFFSET_HOURS = 2; // Africa/Cairo is UTC+2, no DST in recent years.

/** Retry policy for failed Twilio sends. */
const MAX_DELIVERY_ATTEMPTS = 5;
const BASE_BACKOFF_MS = 30_000; // 30s
const MAX_BACKOFF_MS = 30 * 60_000; // 30min

/** Default number of queued jobs processed per `drainWhatsAppQueue()` call. */
const DEFAULT_DRAIN_BATCH_SIZE = 10;

const QUEUE_KEY = 'wa:queue';
const CURSOR_KEY = 'wa:rr:cursor';
const RATE_KEY_PREFIX = 'wa:rate';

// ─── Types ──────────────────────────────────────────────────────────────────

interface QueuedJob {
  id: string;
  to: string;
  body: string;
  senderNumber?: string;
  attempts: number;
  createdAt: number;
}

export interface SendResult {
  success: boolean;
  queued: boolean;
  messageSid?: string;
  senderNumber?: string;
  errorMessage?: string;
}

export interface DrainSummary {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
}

// ─── Time helpers (Africa/Cairo) ────────────────────────────────────────────

function getCurrentHourCairo(now: Date): number {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo',
    hour: 'numeric',
    hour12: false,
  });
  return parseInt(formatter.format(now), 10);
}

/** Whether `now` (default: current time) falls within the 12:00–20:00 Africa/Cairo operating window. */
export function isWithinOperatingHours(now: Date = new Date()): boolean {
  const hour = getCurrentHourCairo(now);
  return hour >= OPS_START_HOUR && hour < OPS_END_HOUR;
}

/** Epoch ms of the start of the next operating window (today or tomorrow, 12:00 Africa/Cairo). */
export function nextOperatingWindowMs(now: Date = new Date()): number {
  const cairoParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => cairoParts.find((p) => p.type === type)?.value ?? '0';
  const year = parseInt(get('year'), 10);
  const month = parseInt(get('month'), 10) - 1;
  let day = parseInt(get('day'), 10);

  const targetMs = Date.UTC(year, month, day, OPS_START_HOUR - CAIRO_OFFSET_HOURS, 0, 0);
  if (targetMs <= now.getTime()) day += 1;

  return Date.UTC(year, month, day, OPS_START_HOUR - CAIRO_OFFSET_HOURS, 0, 0);
}

function computeBackoffMs(attempts: number): number {
  return Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** attempts);
}

// ─── Upstash Redis (lazy init, in-memory fallback) ──────────────────────────
// Mirrors the convention in lib/server/rate-limit.ts.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let redisClient: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ratelimiters: Map<string, any> = new Map();
let redisInitialized = false;
let warnedAboutMemoryFallback = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getRedis(): Promise<any> {
  if (redisInitialized) return redisClient;
  redisInitialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (!warnedAboutMemoryFallback) {
      console.warn(
        '[whatsapp-queue] UPSTASH_REDIS_REST_URL/TOKEN not set — using in-memory queue/rate-limit ' +
        'fallback. Not safe across multiple serverless instances; configure Upstash for production.'
      );
      warnedAboutMemoryFallback = true;
    }
    return null;
  }

  try {
    const { Redis } = await import('@upstash/redis');
    redisClient = new Redis({ url, token });
    console.info('[whatsapp-queue] Upstash Redis connected.');
  } catch (err) {
    console.error('[whatsapp-queue] Failed to initialize Upstash Redis — falling back to in-memory:', err);
    redisClient = null;
  }
  return redisClient;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getRatelimiter(senderNumber: string): Promise<any> {
  const cached = ratelimiters.get(senderNumber);
  if (cached) return cached;

  const redis = await getRedis();
  if (!redis) return null;

  try {
    const { Ratelimit } = await import('@upstash/ratelimit');
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(MAX_PER_WINDOW, WINDOW_LABEL),
      prefix: RATE_KEY_PREFIX,
      analytics: true,
    });
    ratelimiters.set(senderNumber, limiter);
    return limiter;
  } catch (err) {
    console.error('[whatsapp-queue] Failed to initialize Ratelimit — falling back to in-memory:', err);
    return null;
  }
}

// ─── In-memory fallbacks ────────────────────────────────────────────────────

interface MemoryWindow {
  windowStart: number;
  count: number;
}

const memoryRateStore = new Map<string, MemoryWindow>();
const memoryQueue: QueuedJob[] = [];
let memoryCursor = 0;

function memoryRateAllowed(senderNumber: string, now: number): boolean {
  const record = memoryRateStore.get(senderNumber);
  if (!record || now - record.windowStart >= WINDOW_MS) {
    memoryRateStore.set(senderNumber, { windowStart: now, count: 1 });
    return true;
  }
  if (record.count >= MAX_PER_WINDOW) return false;
  record.count += 1;
  return true;
}

// ─── Rate limiting ───────────────────────────────────────────────────────────

/** Checks (and consumes, if allowed) one send slot for `senderNumber`. */
async function consumeSendSlot(senderNumber: string): Promise<boolean> {
  const limiter = await getRatelimiter(senderNumber);
  if (limiter) {
    const { success } = await limiter.limit(senderNumber);
    return success;
  }
  return memoryRateAllowed(senderNumber, Date.now());
}

// ─── Sender selection (round-robin) ─────────────────────────────────────────

async function nextCursor(): Promise<number> {
  const redis = await getRedis();
  if (redis) {
    const value = await redis.incr(CURSOR_KEY);
    return Number(value);
  }
  memoryCursor += 1;
  return memoryCursor;
}

/**
 * Picks the next sender number in round-robin order, skipping any number
 * that is currently rate-limited. Returns `null` if all configured numbers
 * are exhausted for the current window.
 */
export async function selectSenderNumber(): Promise<string | null> {
  if (SENDER_NUMBERS.length === 0) return null;

  const cursor = await nextCursor();
  for (let i = 0; i < SENDER_NUMBERS.length; i++) {
    const candidate = SENDER_NUMBERS[(cursor + i) % SENDER_NUMBERS.length];
    if (await consumeSendSlot(candidate)) return candidate;
  }
  return null;
}

/** The configured sender pool, in order. Used for setup verification. */
export function getConfiguredSenderNumbers(): string[] {
  return [...SENDER_NUMBERS];
}

// ─── Queue primitives ───────────────────────────────────────────────────────

function makeJobId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function pushJob(job: QueuedJob, scheduledAtMs: number): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    await redis.zadd(QUEUE_KEY, { score: scheduledAtMs, member: JSON.stringify(job) });
    return;
  }
  memoryQueue.push(job);
  memoryQueue.sort((a, b) => a.createdAt - b.createdAt);
  // scheduledAtMs is implicit via attempt scheduling for the in-memory path —
  // store it on the job itself so popDueJobs can honor it.
  (job as QueuedJob & { scheduledAtMs?: number }).scheduledAtMs = scheduledAtMs;
}

async function popDueJobs(limit: number, now: number): Promise<QueuedJob[]> {
  const redis = await getRedis();
  if (redis) {
    const due: string[] = await redis.zrange(QUEUE_KEY, 0, now, { byScore: true, offset: 0, count: limit });
    if (due.length === 0) return [];
    await redis.zrem(QUEUE_KEY, ...due);
    return due.map((raw) => JSON.parse(raw) as QueuedJob);
  }

  const due: QueuedJob[] = [];
  for (let i = memoryQueue.length - 1; i >= 0 && due.length < limit; i--) {
    const job = memoryQueue[i] as QueuedJob & { scheduledAtMs?: number };
    if ((job.scheduledAtMs ?? 0) <= now) {
      due.push(job);
      memoryQueue.splice(i, 1);
    }
  }
  return due.reverse();
}

// ─── Public API: Enqueue ─────────────────────────────────────────────────────

/**
 * Sends a WhatsApp message immediately if we're inside operating hours and
 * a sender slot is available; otherwise queues it for the next eligible
 * attempt (next operating window, or the next drain cycle if only rate
 * limits — not business hours — are blocking).
 */
export async function enqueueWhatsAppMessage(
  to: string,
  body: string,
  opts: { senderNumber?: string } = {},
): Promise<SendResult> {
  if (SENDER_NUMBERS.length === 0) {
    return { success: false, queued: false, errorMessage: '[whatsapp-queue] No WABA sender numbers configured (WABA_NUMBER_1–4).' };
  }

  const now = new Date();

  if (!isWithinOperatingHours(now)) {
    await pushJob(
      { id: makeJobId(), to, body, senderNumber: opts.senderNumber, attempts: 0, createdAt: Date.now() },
      nextOperatingWindowMs(now),
    );
    return { success: true, queued: true };
  }

  const job: QueuedJob = { id: makeJobId(), to, body, senderNumber: opts.senderNumber, attempts: 0, createdAt: Date.now() };

  const senderNumber = opts.senderNumber
    ? ((await consumeSendSlot(opts.senderNumber)) ? opts.senderNumber : null)
    : await selectSenderNumber();

  if (!senderNumber) {
    // All eligible senders are rate-limited — retry shortly, still within operating hours.
    await pushJob(job, Date.now() + 60_000);
    return { success: true, queued: true };
  }

  return attemptDelivery(job, senderNumber);
}

async function dispatch(senderNumber: string, to: string, body: string): Promise<SendResult> {
  try {
    const result = await sendTwilioWhatsAppMessage(senderNumber, to, body);

    if (result.errorCode) {
      console.error(`[whatsapp-queue] Twilio error ${result.errorCode}: ${result.errorMessage}`);
      await logWhatsAppMessage({ messageSid: '', to, from: senderNumber, body, status: 'failed', senderNumber });
      return { success: false, queued: false, senderNumber, errorMessage: result.errorMessage };
    }

    await logWhatsAppMessage({ messageSid: result.sid ?? '', to, from: senderNumber, body, status: 'sent', senderNumber });
    return { success: true, queued: false, senderNumber, messageSid: result.sid };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown send error';
    console.error('[whatsapp-queue] dispatch failed:', message);
    return { success: false, queued: false, senderNumber, errorMessage: message };
  }
}

/**
 * Attempts delivery for `job` via `senderNumber`. On failure, re-queues
 * with exponential backoff (preserving the job's original sender
 * preference, if any) unless it has exhausted `MAX_DELIVERY_ATTEMPTS`.
 * Shared by both the immediate-send path and `drainWhatsAppQueue`, so a
 * send that fails on the first attempt gets the same retry treatment as
 * one that failed after being queued.
 */
async function attemptDelivery(job: QueuedJob, senderNumber: string): Promise<SendResult> {
  const result = await dispatch(senderNumber, job.to, job.body);
  if (result.success) return result;

  const attempts = job.attempts + 1;
  if (attempts >= MAX_DELIVERY_ATTEMPTS) {
    console.error(`[whatsapp-queue] Job ${job.id} dropped after ${attempts} attempts: ${result.errorMessage}`);
    return result;
  }

  await pushJob({ ...job, attempts }, Date.now() + computeBackoffMs(attempts));
  return result;
}

// ─── Public API: Drain ───────────────────────────────────────────────────────

/**
 * Processes due jobs from the outbound queue. Intended to be invoked on a
 * schedule (Vercel Cron) every 1–2 minutes during operating hours.
 */
export async function drainWhatsAppQueue(batchSize: number = DEFAULT_DRAIN_BATCH_SIZE): Promise<DrainSummary> {
  const summary: DrainSummary = { processed: 0, sent: 0, failed: 0, skipped: 0 };

  if (!isWithinOperatingHours()) {
    console.info('[whatsapp-queue] drainWhatsAppQueue: outside operating hours — skipping.');
    return summary;
  }

  if (SENDER_NUMBERS.length === 0) {
    console.warn('[whatsapp-queue] drainWhatsAppQueue: no sender numbers configured — skipping.');
    return summary;
  }

  const now = Date.now();
  const jobs = await popDueJobs(batchSize, now);

  for (const job of jobs) {
    summary.processed += 1;

    const senderNumber = job.senderNumber
      ? ((await consumeSendSlot(job.senderNumber)) ? job.senderNumber : null)
      : await selectSenderNumber();

    if (!senderNumber) {
      // Still rate-limited — push back for the next drain cycle without counting as an attempt.
      await pushJob(job, now + 60_000);
      summary.skipped += 1;
      continue;
    }

    const result = await attemptDelivery(job, senderNumber);
    if (result.success) {
      summary.sent += 1;
    } else {
      summary.failed += 1;
    }
  }

  return summary;
}
