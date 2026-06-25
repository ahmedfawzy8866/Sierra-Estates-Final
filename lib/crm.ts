/**
 * lib/crm.ts — Sierra Estates CRM Layer
 * 
 * Central CRM utilities bridging WhatsApp, Firebase, and the Admin Dashboard.
 * All lead activity is logged here and surfaced in the Admin page.
 */

import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { sendLeadNotification } from "./whatsapp";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CRMLead {
  id: string;
  phone: string;
  conversationId: string;
  lastMessage: string;
  createdAt: string;
  lastMessageAt: string;
  status: "new" | "qualified" | "negotiating" | "closed" | "lost";
  source: "whatsapp" | "app" | "web" | "referral";
  budget?: string;
  preferredArea?: string;
  propertyType?: string;
  assignedAgent?: string;
}

// ─── Fetch all leads ──────────────────────────────────────────────────────────

export const fetchLeads = async (
  statusFilter?: CRMLead["status"]
): Promise<CRMLead[]> => {
  try {
    let q = query(
      collection(db, "crm_leads"),
      orderBy("lastMessageAt", "desc"),
      limit(100)
    );
    if (statusFilter) {
      q = query(
        collection(db, "crm_leads"),
        where("status", "==", statusFilter),
        orderBy("lastMessageAt", "desc"),
        limit(100)
      );
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CRMLead));
  } catch (e) {
    console.error("[CRM] fetchLeads failed:", e);
    return [];
  }
};

// ─── Update lead status ───────────────────────────────────────────────────────

export const updateLeadStatus = async (
  leadId: string,
  status: CRMLead["status"]
): Promise<void> => {
  try {
    await updateDoc(doc(db, "crm_leads", leadId), { status });
    console.log(`[CRM] Lead ${leadId} updated to: ${status}`);
  } catch (e) {
    console.error("[CRM] updateLeadStatus failed:", e);
  }
};

// ─── Assign lead to agent ─────────────────────────────────────────────────────

export const assignLeadToAgent = async (
  leadId: string,
  agentName: string,
  agentPhone: string,
  lead: Partial<CRMLead>
): Promise<void> => {
  try {
    await updateDoc(doc(db, "crm_leads", leadId), {
      assignedAgent: agentName,
      status: "qualified",
    });
    // Notify agent on WhatsApp
    await sendLeadNotification(agentPhone, lead);
    console.log(`[CRM] Lead ${leadId} assigned to agent: ${agentName}`);
  } catch (e) {
    console.error("[CRM] assignLeadToAgent failed:", e);
  }
};

// ─── Fetch CRM summary for Admin Dashboard ────────────────────────────────────

export const fetchCRMSummary = async () => {
  try {
    const all = await fetchLeads();
    return {
      total: all.length,
      new: all.filter((l) => l.status === "new").length,
      qualified: all.filter((l) => l.status === "qualified").length,
      negotiating: all.filter((l) => l.status === "negotiating").length,
      closed: all.filter((l) => l.status === "closed").length,
      lost: all.filter((l) => l.status === "lost").length,
    };
  } catch (e) {
    console.error("[CRM] fetchCRMSummary failed:", e);
    return { total: 0, new: 0, qualified: 0, negotiating: 0, closed: 0, lost: 0 };
  }
};

// ─── Legacy helper (kept for backward compat) ─────────────────────────────────

export const sendWhatsAppLead = async (
  name: string,
  phone: string,
  propertyId: string
): Promise<boolean> => {
  console.log(`[CRM] Lead queued → Name: ${name}, Phone: ${phone}, Property: ${propertyId}`);
  return true;
};
