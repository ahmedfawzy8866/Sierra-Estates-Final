import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { COLLECTIONS } from '@/lib/models/schema';
import { logger } from '@/lib/logger';

/**
 * Twilio delivery/read status callback. Twilio POSTs form-encoded params
 * (MessageSid, MessageStatus, …) for each WhatsApp message we send with a
 * StatusCallback URL. We map the Twilio status onto the queued job's status.
 */

const TWILIO_TO_JOB_STATUS: Record<string, string> = {
  queued: 'sent',
  sending: 'sending',
  sent: 'sent',
  delivered: 'delivered',
  read: 'read',
  failed: 'failed',
  undelivered: 'failed',
};

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const sid = String(form.get('MessageSid') || form.get('SmsSid') || '');
    const twilioStatus = String(form.get('MessageStatus') || form.get('SmsStatus') || '');

    if (!sid) {
      return NextResponse.json({ error: 'Missing MessageSid' }, { status: 400 });
    }

    const snap = await adminDb
      .collection(COLLECTIONS.whatsappMessageQueue)
      .where('twilioMessageSid', '==', sid)
      .limit(1)
      .get();

    if (snap.empty) {
      // Unknown SID (e.g. a message not sent by the queue) — ack so Twilio stops retrying.
      logger.warn(`[twilio-status] no job found for SID ${sid} (status ${twilioStatus})`);
      return NextResponse.json({ ok: true, matched: false });
    }

    const mapped = TWILIO_TO_JOB_STATUS[twilioStatus];
    const update: Record<string, any> = { twilioStatus, updatedAt: Timestamp.now() };
    // Never regress a 'read' job back to 'delivered'/'sent' on out-of-order callbacks.
    const current = snap.docs[0].data().status as string | undefined;
    const rank: Record<string, number> = { sent: 1, delivered: 2, read: 3, failed: 3 };
    if (mapped && (rank[mapped] ?? 0) >= (rank[current ?? ''] ?? 0)) {
      update.status = mapped;
    }

    await snap.docs[0].ref.update(update);
    return NextResponse.json({ ok: true, matched: true });
  } catch (error: any) {
    logger.error('[twilio-status] callback error:', error);
    return NextResponse.json({ error: error?.message || 'callback failed' }, { status: 500 });
  }
}
