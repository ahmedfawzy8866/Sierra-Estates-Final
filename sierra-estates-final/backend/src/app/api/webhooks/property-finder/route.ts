import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { COLLECTIONS } from '@/lib/models/schema';
import { Timestamp } from 'firebase-admin/firestore';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.PF_WEBHOOK_SECRET || '';

function verifySignature(payload: string, signature: string): boolean {
  try {
    const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(payload).digest('hex');
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (signatureBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (err) {
    console.error('[PF Webhook] Signature verification error:', err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('X-Signature') || '';

  if (!WEBHOOK_SECRET) {
    console.error('[PF Webhook] PF_WEBHOOK_SECRET not configured — rejecting all webhook calls');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  if (!signature || !verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody);
    const eventType = event.type || event.eventId;
    const eventId = event.id || event.eventId;

    switch (eventType) {
      case 'lead.created':
      case 'lead.updated':
      case 'lead.assigned': {
        const lead = event.data || event.payload;
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

        const existing = await adminDb.collection(COLLECTIONS.stakeholders)
          .where('pfLeadId', '==', lead.id)
          .get();

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
        const actionType = listing.action?.type || 'unknown';
        const actionStatus = listing.action?.status || 'pending';
        
        // Log the action for administrative review
        await adminDb.collection('pf_actions').add({
          eventId,
          eventType,
          listingReference: ref,
          actionType,
          actionStatus,
          payload: listing,
          timestamp: Timestamp.now(),
        });

        const units = await adminDb.collection(COLLECTIONS.units)
          .where('pfReferenceNumber', '==', ref)
          .get();

        if (!units.empty) {
          const updateData: any = {
            'automation.isPublishedToPF': eventType === 'listing.published',
            pfStatus: eventType === 'listing.published' ? 'published' : 'unpublished',
            pfLastAction: actionType,
            pfActionStatus: actionStatus,
            updatedAt: Timestamp.now(),
          };

          // Handle specific compliance rejections
          if (eventType === 'listing.action' && actionType.includes('required')) {
            updateData.pfComplianceStatus = 'needs_action';
            updateData.pfRejectionReason = listing.action?.reason || 'Compliance action required';
          }

          await units.docs[0].ref.update(updateData);
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
