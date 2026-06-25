/**
 * lib/whatsapp.ts
 * 
 * WhatsApp Business API Integration
 * Wired to the Hermes AI agent for automated lead qualification & CRM.
 * 
 * Flow:
 *  Incoming WhatsApp message → Webhook → hermesAgent.chat() → Reply → CRM log
 */

import { hermesAgent, LeadProfile } from "./agents/hermes";
import { db } from "./firebase";
import { collection, setDoc, doc, updateDoc, getDoc } from "firebase/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WhatsAppMessage {
  from: string;         // phone number e.g. "201001234567"
  id: string;           // message id
  timestamp: string;
  type: "text" | "audio" | "image";
  text?: { body: string };
}

interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    changes: Array<{
      value: {
        messages?: WhatsAppMessage[];
        metadata: { phone_number_id: string };
      };
    }>;
  }>;
}

// ─── Config (set via env) ────────────────────────────────────────────────────

const WA_API_URL = "https://graph.facebook.com/v19.0";
const WA_PHONE_ID = process.env.EXPO_PUBLIC_WA_PHONE_ID || "";
const WA_TOKEN = process.env.EXPO_PUBLIC_WA_TOKEN || "";
const WA_VERIFY_TOKEN = process.env.EXPO_PUBLIC_WA_VERIFY_TOKEN || "sierra_hermes_2026";

// ─── Send a WhatsApp message ──────────────────────────────────────────────────

export const sendWhatsAppMessage = async (to: string, body: string): Promise<boolean> => {
  if (!WA_TOKEN || !WA_PHONE_ID) {
    console.log(`[WhatsApp STUB] → ${to}: ${body}`);
    return true; // Stub in dev
  }

  try {
    const res = await fetch(`${WA_API_URL}/${WA_PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      }),
    });
    return res.ok;
  } catch (e) {
    console.error("[WhatsApp] Send failed:", e);
    return false;
  }
};

// ─── Handle incoming webhook ──────────────────────────────────────────────────

export const handleWhatsAppWebhook = async (payload: WhatsAppWebhookPayload): Promise<void> => {
  await hermesAgent.initialize();

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      const messages = change.value.messages;
      if (!messages) continue;

      for (const msg of messages) {
        if (msg.type !== "text" || !msg.text) continue;

        const phone = msg.from;
        const conversationId = `wa_${phone}`;
        const userText = msg.text.body;

        console.log(`[WhatsApp] 📩 From ${phone}: ${userText}`);

        // Let Hermes respond
        const reply = await hermesAgent.chat(conversationId, userText);
        await sendWhatsAppMessage(phone, reply);

        // Log lead to Firestore CRM
        await upsertLead(phone, conversationId, userText);
      }
    }
  }
};

// ─── CRM: Upsert lead in Firestore ───────────────────────────────────────────

const upsertLead = async (phone: string, conversationId: string, latestMessage: string) => {
  try {
    const leadData = hermesAgent.extractLeadData(conversationId, phone);
    const leadRef = doc(db, "crm_leads", conversationId);
    const existing = await getDoc(leadRef);

    if (existing.exists()) {
      await updateDoc(leadRef, {
        lastMessage: latestMessage,
        lastMessageAt: new Date().toISOString(),
        ...leadData,
      });
    } else {
      await setDoc(leadRef, {
        phone,
        conversationId,
        lastMessage: latestMessage,
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        status: "new",
        source: "whatsapp",
        ...leadData,
      });
    }
    console.log(`[CRM] ✅ Lead logged: ${conversationId}`);
  } catch (e) {
    console.error("[CRM] Lead logging failed:", e);
  }
};

// ─── Verify webhook (GET request from Meta) ───────────────────────────────────

export const verifyWhatsAppWebhook = (
  mode: string,
  token: string,
  challenge: string
): string | null => {
  if (mode === "subscribe" && token === WA_VERIFY_TOKEN) {
    return challenge;
  }
  return null;
};

// ─── Manually send a lead to WhatsApp (from app UI) ──────────────────────────

export const sendLeadNotification = async (
  agentPhone: string,
  lead: Partial<LeadProfile>
): Promise<boolean> => {
  const message =
    `🔔 New Sierra Estates Lead!\n` +
    `📞 ${lead.phone}\n` +
    `🏡 Looking for: ${lead.propertyType || "N/A"}\n` +
    `📍 Area: ${lead.preferredArea || "N/A"}\n` +
    `💰 Budget: ${lead.budget || "Not specified"}\n` +
    `⏰ ${new Date().toLocaleString("en-EG")}`;

  return await sendWhatsAppMessage(agentPhone, message);
};
