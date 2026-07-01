import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import type { BrokerListing } from '@/lib/models/schema';
import { COLLECTIONS } from '@/lib/models/schema';
import { buildSierraCodeMetadata } from '@/lib/services/coding-algorithm';
import { WhatsAppParserService } from '@/lib/services/WhatsAppParserService';
import { OrchestratorService } from '@/lib/services/orchestrator';
import { GoogleSheetsSync } from '@/lib/services/sheets-sync';
import { GoogleAIService } from '@/lib/server/google-ai';
import { LEILA_PROMPT } from '@/lib/prompts';

async function sendWhatsAppReply(phoneNumber: string, text: string) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn('[WhatsApp] API token or phone number ID not configured. Reply will not be sent.');
    return false;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: text },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('[WhatsApp API Error]:', error);
      return false;
    }

    console.log(`[WhatsApp] Reply sent to ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error('[WhatsApp Send Error]:', error);
    return false;
  }
}

const extractRawMessage = (body: Record<string, any>) =>
  body.message ||
  body.text ||
  body.data?.message?.text ||
  body.data?.text ||
  body.Body ||
  body.content ||
  body.payload?.message ||
  '';

const extractSender = (body: Record<string, any>) =>
  body.sender ||
  body.from ||
  body.From ||
  body.senderName ||
  body.data?.sender ||
  'Unknown';

const extractGroup = (body: Record<string, any>) =>
  body.groupName ||
  body.group ||
  body.chatName ||
  body.data?.groupName ||
  body.To ||
  'Direct Message';

const buildListingDocument = (
  rawMessage: string,
  sender: string,
  group: string,
  parsed: any
): Omit<BrokerListing, 'id'> => {
  const isListing = parsed?.isListing === true;
  
  // Use the pre-calculated sierraCode if available, else build it
  const metadata = isListing && parsed?.price
    ? buildSierraCodeMetadata({
        compound: parsed.compound,
        locationCode: parsed.compound,
        rooms: parsed.bedrooms,
        furnishingStatus: parsed.finishing || parsed.furnishingStatus,
        price: parsed.price,
        currency: parsed.currency || 'EGP',
        features: parsed.matchingKeywords,
      })
    : null;

  return {
    rawMessage,
    sourceGroup: group,
    sourcePlatform: 'whatsapp',
    senderInfo: sender,
    extractedData: {
      compound: parsed?.compound,
      propertyType: parsed?.type || parsed?.propertyType,
      bedrooms: parsed?.bedrooms,
      price: parsed?.price,
      currency: parsed?.currency || 'EGP',
      area: parsed?.area,
      finishingType: parsed?.finishing || parsed?.finishingType,
      furnishingStatus: metadata?.furnishingStatus || parsed?.furnishingStatus,
      phoneNumber: parsed?.phoneNumber,
      urgencyScore: parsed?.urgencyScore,
      sentiment: parsed?.sentiment,
      matchingKeywords: parsed?.matchingKeywords || [],
      features: metadata?.featureCodes || [],
      sierraCode: parsed?.sierraCode || metadata?.code,
    },
    intelligence: {
      code: parsed?.sierraCode || metadata?.code || '',
      locationCode: metadata?.locationCode || parsed?.compound || '',
      furnishingStatus: metadata?.furnishingStatus || 'U',
      normalizedPrice: metadata?.normalizedPrice || parsed?.price || 0,
      currency: metadata?.currency || 'EGP',
      featureCodes: metadata?.featureCodes || [],
      urgencyScore: parsed?.urgencyScore || 0,
      sentiment: parsed?.sentiment || 'neutral',
      matchingKeywords: parsed?.matchingKeywords || [],
      parserVersion: 'whatsapp-ingest/v2-unified',
      lastUpdatedAt: Timestamp.now(),
    },
    status: isListing ? 'parsed' : 'new',
    isVerified: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    orchestrationState: {
      stage: isListing ? 'S2' : 'S1',
      status: isListing ? 'completed' : 'pending',
      engineVersion: 'whatsapp-ingest/v2-unified',
      lastTriggeredAt: Timestamp.now() as any,
    },
  };
};

export async function POST(req: Request) {
  try {
    const body = await req.json() as Record<string, any>;
    const rawMessage = extractRawMessage(body);
    const sender = extractSender(body);
    const group = extractGroup(body);

    if (!rawMessage || typeof rawMessage !== 'string') {
      return NextResponse.json({ success: false, error: 'No valid message content found.' }, { status: 400 });
    }

    const parsed = await WhatsAppParserService.parseMessage(rawMessage);

    let leilaReply = null;
    let replyText = '';
    if (parsed && !parsed.isListing) {
      try {
        const responseText = await GoogleAIService.generateContent(
          'SCRIBE', 'S1-WhatsApp-Intake',
          {
            system: LEILA_PROMPT.system,
            user: rawMessage
          },
          { model: 'gemini-1.5-flash', temperature: 0.3 }
        );

        replyText = responseText.replace('[VIP_ALERT_TRIGGER]', '').trim();
        leilaReply = {
          text: replyText,
          isVIP: responseText.includes('[VIP_ALERT_TRIGGER]')
        };
      } catch (err) {
        console.warn('[WhatsApp Ingest] Leila response generation failed:', err);
        replyText = 'Thank you for your message. Our team will review it shortly and get back to you.';
      }
    }

    const listing = buildListingDocument(rawMessage, sender, group, parsed);
    const docRef = await adminDb.collection(COLLECTIONS.brokerListings).add(listing);

    // Dual-Ingestion: Also append to Google Sheets Master Log
    try {
      await GoogleSheetsSync.appendRow('Leads', {
        id: docRef.id,
        sender,
        group,
        isListing: parsed?.isListing ? 'YES' : 'NO',
        content: rawMessage,
        date: new Date().toISOString()
      });
    } catch (e) {
      console.warn('[WhatsApp Ingest] Google Sheets Dual-Ingest fell back to retry queue', e);
    }

    // Send WhatsApp reply if not a listing
    if (replyText && parsed?.phoneNumber) {
      await sendWhatsAppReply(parsed.phoneNumber, replyText);
    }

    // Trigger the orchestration pipeline relay in the background
    OrchestratorService.runPipeline(docRef.id, 'brokerListings')
      .then(() => console.log(`[WhatsApp Ingest] Triggered pipeline for ${docRef.id}`))
      .catch((err: any) => console.error(`[WhatsApp Ingest] Pipeline error for ${docRef.id}`, err));

    return NextResponse.json({
      success: true,
      id: docRef.id,
      isListing: parsed?.isListing === true,
      sierraCode: listing.extractedData?.sierraCode || null,
      orchestration: parsed?.isListing === true ? 'S1-S2 completed' : 'Stored for manual review',
      leilaReply,
      replySent: !!replyText
    });
  } catch (error: any) {
    console.error('[WhatsApp Ingest Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'Sierra Estates WhatsApp Ingest Gateway',
  });
}
