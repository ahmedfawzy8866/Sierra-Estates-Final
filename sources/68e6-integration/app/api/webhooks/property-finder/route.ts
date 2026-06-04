import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { COLLECTIONS } from '@/lib/models/schema';
import { Timestamp } from 'firebase-admin/firestore';
import crypto from 'crypto';

function getWebhookSecret() {
  return process.env.PF_WEBHOOK_SECRET || '';
}

function verifySignature(payload: string, signature: string): boolean {
  const webhookSecret = getWebhookSecret();

  if (!webhookSecret || !signature) return false;
  const expected = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('X-Signature') || '';
  const webhookSecret = getWebhookSecret();

  if (!webhookSecret) {
    console.error('[PF Webhook] Missing PF_WEBHOOK_SECRET configuration');
    return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 500 });
  }

  // Missing/invalid signatures are treated as client auth failures once the secret is configured.
  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody);
    const eventType = event.type || event.eventId;

    switch (eventType) {
      case 'lead.created':
      case 'lead.updated':
      case 'lead.assigned': {
        const lead = event.data || event.payload;
        const existing = await adminDb.collection(COLLECTIONS.stakeholders)
          .where('pfLeadId', '==', lead.id)
          .get();

        const payload = {
          name: lead.sender?.name || lead.name || 'PF Lead',
          phone: lead.sender?.phone || lead.phone || '',
          email: lead.sender?.email || lead.email || '',
          source: 'property-finder',
          stage: 'inbound',
          phase: 'acquisition',
          originChannel: `Property Finder (${lead.channel || 'web'})`,
          pfLeadId: lead.id,
          pfListingReferenceNumber: lead.listing?.reference || '',
          updatedAt: Timestamp.now(),
        };

        if (existing.empty) {
          await adminDb.collection(COLLECTIONS.stakeholders).add({
            ...payload,
            automation: { botInitiated: false, scoringCompleted: false, whatsappFollowupSent: false, viewingReminderSent: false },
            createdAt: Timestamp.now(),
          });
        } else {
          await existing.docs[0].ref.update(payload);
        }
        break;
      }

      case 'listing.published':
      case 'listing.unpublished':
      case 'listing.action': {
        const listing = event.data || event.payload;
        const ref = listing.reference || String(listing.id);
        const units = await adminDb.collection(COLLECTIONS.units)
          .where('pfReferenceNumber', '==', ref)
          .get();

        if (!units.empty) {
          await units.docs[0].ref.update({
            'automation.isPublishedToPF': eventType === 'listing.published',
            pfStatus: eventType === 'listing.published' ? 'published' : 'unpublished',
            updatedAt: Timestamp.now(),
          });
        }
        break;
      }

      default:
        console.log(`[PF Webhook] Unhandled event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[PF Webhook]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
