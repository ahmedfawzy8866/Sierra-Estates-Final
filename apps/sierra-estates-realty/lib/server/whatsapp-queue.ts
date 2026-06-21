import 'server-only';
import { adminDb } from '@/lib/server/firebase-admin';
import { Timestamp, type Transaction, type DocumentReference, type QueryDocumentSnapshot } from 'firebase-admin/firestore';
import {
  COLLECTIONS,
  type WhatsAppMessageJob,
  type WhatsAppMessagePurpose,
  type WhatsAppOutreachConfig,
} from '@/lib/models/schema';
import { logger } from '@/lib/logger';

// Defaults match the product spec: 4 numbers, 30 msgs/number per 2-hour window,
// 12pm–8pm Africa/Cairo. dailyCapPerNumber = 30 × 4 windows = 120; total 480.
export const DEFAULT_OUTREACH_CONFIG: WhatsAppOutreachConfig = {
  operatingHourStart: 12,
  operatingHourEnd: 20,
  timezone: 'Africa/Cairo',
  batchSizePerNumber: 30,
  windowMinutes: 120,
  dailyCapPerNumber: 120,
  dailyCapTotal: 480,
};

/** Reads the singleton config doc, falling back to defaults for any missing field. */
export async function getOutreachConfig(): Promise<WhatsAppOutreachConfig> {
  try {
    const snap = await adminDb.collection(COLLECTIONS.systemConfig).doc('whatsapp_outreach').get();
    return { ...DEFAULT_OUTREACH_CONFIG, ...(snap.exists ? (snap.data() as Partial<WhatsAppOutreachConfig>) : {}) };
  } catch {
    return DEFAULT_OUTREACH_CONFIG;
  }
}

/** Current hour (0–23) in the config timezone, without a tz library. */
export function currentHourInZone(timezone: string, now: Date = new Date()): number {
  const hour = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  }).format(now);
  // Intl can return "24" for midnight in some runtimes; normalize.
  return Number(hour) % 24;
}

export function isWithinOperatingHours(config: WhatsAppOutreachConfig, now: Date = new Date()): boolean {
  const hour = currentHourInZone(config.timezone, now);
  return hour >= config.operatingHourStart && hour < config.operatingHourEnd;
}

/**
 * Enqueues an outbound WhatsApp job. The dispatch worker (cron) sends it later,
 * subject to operating hours + per-number quota. Single write — safe to call from
 * request handlers.
 */
export async function enqueueWhatsAppJob(params: {
  purpose: WhatsAppMessagePurpose;
  toPhone: string;
  body: string;
  leadId?: string;
  unitId?: string;
  ownerNegotiationId?: string;
  templateName?: string;
  templateParams?: Record<string, string>;
}): Promise<string> {
  const job: Omit<WhatsAppMessageJob, 'id'> = {
    direction: 'outbound',
    purpose: params.purpose,
    toPhone: params.toPhone,
    body: params.body,
    status: 'queued',
    attempts: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    ...(params.leadId ? { leadId: params.leadId } : {}),
    ...(params.unitId ? { unitId: params.unitId } : {}),
    ...(params.ownerNegotiationId ? { ownerNegotiationId: params.ownerNegotiationId } : {}),
    ...(params.templateName ? { templateName: params.templateName } : {}),
    ...(params.templateParams ? { templateParams: params.templateParams } : {}),
  };
  const ref = await adminDb.collection(COLLECTIONS.whatsappMessageQueue).add(job);
  return ref.id;
}

/**
 * Seeds the 4 WhatsAppNumber docs from WABA_NUMBER_1..4 if the collection is
 * empty, so the dispatcher has senders to claim. Idempotent.
 */
export async function ensureNumbersSeeded(config: WhatsAppOutreachConfig): Promise<number> {
  const col = adminDb.collection(COLLECTIONS.whatsappNumbers);
  const existing = await col.limit(1).get();
  if (!existing.empty) return 0;

  const phones = [
    process.env.WABA_NUMBER_1,
    process.env.WABA_NUMBER_2,
    process.env.WABA_NUMBER_3,
    process.env.WABA_NUMBER_4,
  ].filter((p): p is string => Boolean(p));

  if (phones.length === 0) return 0;

  const now = Timestamp.now();
  const windowReset = Timestamp.fromMillis(now.toMillis() + config.windowMinutes * 60_000);
  const dailyReset = Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60_000);

  let created = 0;
  for (let i = 0; i < phones.length; i++) {
    await col.add({
      label: `Sender ${i + 1}`,
      e164Phone: phones[i],
      status: 'active',
      windowSentCount: 0,
      windowResetAt: windowReset,
      dailySentCount: 0,
      dailyResetAt: dailyReset,
      createdAt: now,
      updatedAt: now,
    });
    created++;
  }
  logger.info(`[whatsapp-queue] Seeded ${created} WhatsApp sender numbers`);
  return created;
}

export interface ClaimedNumber {
  id: string;
  e164Phone: string;
}

/**
 * Transactionally claims one sender number that still has window + daily quota,
 * resetting elapsed windows first. Increments the claimed number's counters so a
 * concurrent claim can't oversend. Returns null when every number is exhausted.
 */
export async function claimEligibleNumber(config: WhatsAppOutreachConfig): Promise<ClaimedNumber | null> {
  const snap = await adminDb.collection(COLLECTIONS.whatsappNumbers).where('status', '==', 'active').get();
  const ids: string[] = snap.docs.map((d: QueryDocumentSnapshot): string => d.id);

  for (const id of ids) {
    const ref: DocumentReference = adminDb.collection(COLLECTIONS.whatsappNumbers).doc(id);
    const claimed = await adminDb.runTransaction(async (tx: Transaction): Promise<ClaimedNumber | null> => {
      const doc = await tx.get(ref);
      if (!doc.exists) return null;
      const d = doc.data() as Record<string, any>;
      const nowMs = Date.now();

      let windowSent = d.windowSentCount ?? 0;
      let dailySent = d.dailySentCount ?? 0;
      const patch: Record<string, any> = {};

      if (!d.windowResetAt || nowMs > d.windowResetAt.toMillis()) {
        windowSent = 0;
        patch.windowResetAt = Timestamp.fromMillis(nowMs + config.windowMinutes * 60_000);
      }
      if (!d.dailyResetAt || nowMs > d.dailyResetAt.toMillis()) {
        dailySent = 0;
        patch.dailyResetAt = Timestamp.fromMillis(nowMs + 24 * 60 * 60_000);
      }

      if (windowSent >= config.batchSizePerNumber || dailySent >= config.dailyCapPerNumber) {
        // Persist any window/daily resets even though we can't claim it now.
        if (Object.keys(patch).length > 0) {
          tx.update(ref, { ...patch, windowSentCount: windowSent, dailySentCount: dailySent, updatedAt: Timestamp.now() });
        }
        return null;
      }

      tx.update(ref, {
        ...patch,
        windowSentCount: windowSent + 1,
        dailySentCount: dailySent + 1,
        lastSentAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { id, e164Phone: d.e164Phone };
    });

    if (claimed) return claimed;
  }
  return null;
}
