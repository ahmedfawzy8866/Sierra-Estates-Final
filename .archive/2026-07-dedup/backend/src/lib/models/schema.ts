/**
 * Sierra Estates — Firestore Data Schema
 * Canonical type definitions for all collections.
 */

export const COLLECTIONS = {
  LISTINGS:             'listings',
  LEADS:                'leads',
  DEALS:                'deals',
  PROPOSALS:            'proposals',
  VIEWING_REQUESTS:     'viewingRequests',
  SALES:                'sales',
  ACTIVITIES:           'activities',
  USERS:                'users',
  RAW_SCRAPE_DATA:      'rawScrapeData',
  PROCESSED_DATA:       'processedData',
  SYNC_QUEUE:           'syncQueue',
  SYNC_LOG:             'syncLog',
  MARKET_INSIGHTS:      'marketInsights',
  PF_WEBHOOK_EVENTS:    'pfWebhookEvents',
  SCRAPER_HEARTBEATS:   'scraperHeartbeats',
  STRATEGIC_PIPELINE:   'strategicPipeline',
  PARTNERS:             'partners',
  VOUCHERS:             'vouchers',
  MEMORY:               'memory',
} as const;

export interface PortfolioAsset {
  id?: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  compound: string;
  propertyType: string;
  category?: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  price: number;
  pricePerSqm?: number;
  finishingType?: string;
  furnishingStatus?: string;
  floor?: number;
  unitNumber?: string;
  location?: {
    address: string;
    lat: number;
    lng: number;
  };
  images?: string[];
  primaryImage?: string;
  status: 'active' | 'sold' | 'reserved' | 'off_market';
  visibility?: 'public' | 'broker' | 'investor' | 'internal';
  dealStatus?: string;
  dealScore?: number;
  roiEstimate?: number;
  aiTags?: string[];
  sbrCode?: string;
  syncedToPF?: boolean;
  pfId?: string;
  dupeCheckHash?: string;
  source?: string;
  ownerType?: 'broker' | 'owner' | 'developer';
  ownerContact?: string;
  stage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentStakeholder {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  budget?: number;
  budgetMin?: number;
  budgetMax?: number;
  preferredCompounds?: string[];
  preferredBedrooms?: number[];
  intent?: 'buy_resale' | 'rent' | 'invest' | 'unknown';
  decisionTimeline?: number; // months
  notes?: string;
  source?: string;
  status: 'new' | 'active' | 'warm' | 'hot' | 'closed_won' | 'closed_lost';
  stage?: string;
  investmentProfile?: Record<string, unknown>;
  matchedAssets?: string[];
  neuralMatchScore?: number;
  leilaScore?: number;
  agentAssigned?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id?: string;
  leadId: string;
  assetId: string;
  proposalText: string;
  proposalTextAr?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  stage?: string;
  sentAt?: string;
  createdAt: string;
}

export interface ViewingRequest {
  id?: string;
  stakeholderName: string;
  stakeholderPhone: string;
  assetId: string;
  preferredDate?: string;
  scheduledDate?: string;
  notes?: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Sale {
  id?: string;
  sbrCode?: string;
  propertyName?: string;
  leadName?: string;
  leadId?: string;
  assetId?: string;
  salePriceEGP: number;
  commissionRate: number;
  commissionEGP: number;
  agentName?: string;
  agentId?: string;
  closeDate: string;
  paymentStatus: 'pending' | 'partial' | 'paid';
  invoiceRef?: string;
  createdAt: string;
}
