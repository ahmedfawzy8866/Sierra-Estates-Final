import { Timestamp } from 'firebase/firestore';

export interface InvestmentStakeholder {
  id: string;
  name: string;
  phone: string;
  portfolioPreference: string;
  capitalAllocation: string;
  strategicIntensity: 'hot' | 'warm' | 'cold';
  phase: PipelinePhase;
  createdAt?: Timestamp;
  originChannel: string;
  intelligenceScore?: number;
  assignedTo?: string;
  assignedPartnerId?: string;
  assignedPartnerName?: string;
  dealValue?: number;
  commissionPercentage?: number;
  finalGci?: number;
  
  // Codex v4.0 Alignment
  aiProfiling: {
    interests: string[];
    topMatches: Array<{
      unitId: string;
      matchScore: number;
      matchReason: string;
    }>;
    lastMatchRunAt?: Timestamp;
    lastAnalyzedAt?: Timestamp;
  };
  automation: {
    followupReminderEnabled: boolean;
    nextAutomatedInteraction?: Timestamp;
    interactionFrequency: 'low' | 'medium' | 'high';
  };
}

export interface StakeholderDraft {
  name: string;
  phone: string;
  portfolioPreference: string;
  capitalAllocation: string;
  strategicIntensity: 'hot' | 'warm' | 'cold';
  originChannel: string;
  assignedPartnerId: string;
  dealValue: number;
  commissionPercentage: number;
}

export interface StakeholderFilters {
  search: string;
  intensity: 'all' | InvestmentStakeholder['strategicIntensity'];
  channel: 'all' | string;
  partnerId: 'all' | string;
}

export type PipelinePhase = 'acquisition' | 'consultation' | 'inspection' | 'structuring' | 'settlement';

export interface PhaseMetadata {
  title: string;
  color: string;
  description: string;
}

export const PHASE_DEFS: Record<PipelinePhase, PhaseMetadata> = {
  acquisition: { title: 'Strategic Acquisition', color: 'var(--blue)', description: 'High-intent market entries and incoming portfolio inquiries' },
  consultation: { title: 'Executive Consultation', color: 'var(--blue-light)', description: 'Initial discovery and architectural preference synthesis' },
  inspection: { title: 'Asset Inspection', color: 'var(--gold)', description: 'Private viewings and physical property experience' },
  structuring: { title: 'Deal Structuring', color: '#10b981', description: 'Financial reconciliation and contractual architecture' },
  settlement: { title: 'Portfolio Settlement', color: 'var(--navy)', description: 'Successful asset transition and relationship formalization' },
};

export const PHASE_SEQUENCE: PipelinePhase[] = ['acquisition', 'consultation', 'inspection', 'structuring', 'settlement'];

export const CHANNEL_METADATA: Record<string, { icon: string; color: string }> = {
  WhatsApp: { icon: '💬', color: '#25D366' },
  Website: { icon: '🌐', color: 'var(--blue)' },
  Referral: { icon: '🎖️', color: 'var(--gold)' },
  Instagram: { icon: '📸', color: '#e11d48' },
  'Walk-in': { icon: '🚪', color: 'var(--blue-light)' }
};

export const INITIAL_STAKEHOLDER_STATE: StakeholderDraft = { 
  name: '', 
  phone: '', 
  portfolioPreference: '', 
  capitalAllocation: '', 
  strategicIntensity: 'warm', 
  originChannel: 'WhatsApp',
  assignedPartnerId: '',
  dealValue: 0,
  commissionPercentage: 2.5
};