/**
 * SIERRA ESTATES — SHARED FIRESTORE DATA CONTRACT
 *
 * This is the SINGLE SOURCE OF TRUTH for the database schema.
 * BOTH apps (Vercel + Firebase Admin) import from this package.
 *
 * HARD RULES:
 *   1. Never rename collections without updating BOTH apps.
 *   2. Never create a second Firestore database.
 *   3. Bots/scrapers WRITE. Dashboards READ.
 *   4. All document shapes are typed here.
 */

// ─── Re-export canonical schema ────────────────────────────────────
export type {
  BaseDocument,
  Unit,
  PortfolioAsset,
  Property,
  Project,
  Developer,
  MediaAsset,
  InvestmentStakeholder,
  Lead,
  Sale,
  InboundAssetSignal,
  BrokerListing,
  Voucher,
  Proposal,
  Viewing,
  UserProfile,
  Activity,
  IntelligenceObject,
  PropertyStatus,
  PropertyType,
  PipelineStage,
  StakeholderAcquisitionSource,
  CurrencyCode,
  FurnishingCode,
  SierraFeatureCode,
  ListingSentiment,
} from './schema';

export { COLLECTIONS } from './schema';

// ─── Collection Registry ───────────────────────────────────────────
//
// WRITE ACCESS (Firebase Admin App only):
//   - bot_jobs/     — scraper/bot task queue + results
//   - broker_listings/ — inbound asset signals (Scribe intake)
//   - syncQueue/    — Property Finder sync queue
//   - syncLog/      — sync operation logs
//   - exchange/     — agent orchestration message bus
//   - owner_negotiations/ — WhatsApp negotiation threads
//
// READ/WRITE (Both apps, with role-based access):
//   - listings/     — property units (Admin writes, Vercel reads)
//   - leads/        — CRM leads (Admin writes, Vercel reads)
//   - proposals/    — AI-generated proposals (Admin writes, Vercel reads)
//   - viewings/     — scheduled inspections (Admin writes, Vercel reads)
//   - sales/        — transactions (Admin writes, Vercel reads)
//   - activities/   — audit log (Admin writes, Vercel reads)
//   - users/        — staff profiles (Admin writes, Vercel reads)
//
// READ-ONLY (Vercel App — public dashboard):
//   - listings/     — public property search
//   - projects/     — development projects
//   - developers/   — developer profiles
//

/**
 * Bot Job — task queue for scrapers and automation bots.
 * Written by Firebase Admin App only. Never by Vercel.
 */
export interface BotJob {
  id?: string;
  type: 'whatsapp-scraper' | 'owner-search' | 'owner-contact' |
        'email-sender' | 'unit-adder' | 'pf-sync' |
        'lead-scoring' | 'matching-engine' | 'closing-deal';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  payload: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string;
  progress: number;  // 0-100
  stepName?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  scheduledAt?: Date;
  retryCount: number;
  maxRetries: number;
}

/**
 * Exchange Record — message bus for agent orchestration.
 * Written by Firebase Admin App only.
 */
export interface ExchangeRecord {
  id?: string;
  type: 'agent_task' | 'workflow_run' | 'admin_signal' | 'crm_event' |
        'lead_update' | 'property_match';
  source: 'admin' | 'agent' | 'workflow' | 'webhook' | 'system';
  status: 'pending' | 'running' | 'done' | 'error' | 'cancelled';
  payload: Record<string, unknown>;
  agentId?: string;
  workflowId?: string;
  leadId?: string;
  progress: number;  // 0-100
  stepName?: string;
  result?: Record<string, unknown>;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Owner Negotiation — WhatsApp negotiation thread with property owners.
 * Written by Firebase Admin App only.
 */
export interface OwnerNegotiation {
  id?: string;
  ownerPhone: string;
  ownerName?: string;
  unitId?: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  messages: Array<{
    direction: 'inbound' | 'outbound';
    body: string;
    timestamp: Date;
    senderNumber?: string;
  }>;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Extended Collection Names ──────────────────────────────────────

export const ADMIN_COLLECTIONS = {
  ...COLLECTIONS,
  botJobs: 'bot_jobs',
  exchange: 'exchange',
  ownerNegotiations: 'owner_negotiations',
} as const;

// ─── Role Definitions ──────────────────────────────────────────────

export type UserRole = 'admin' | 'agent' | 'employee';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['read', 'write', 'delete', 'manage_users', 'deploy', 'manage_bots'],
  agent: ['read', 'write', 'manage_leads', 'manage_listings'],
  employee: ['read', 'manage_leads'],
};
