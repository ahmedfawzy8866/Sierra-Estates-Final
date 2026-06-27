import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
/**
 * CRM Leads API Tests
 *
 * Tests the POST /api/crm/leads route:
 *   - Lead creation with valid data
 *   - Validation: missing required fields (client_name, client_mobile)
 *   - Validation: invalid extracted_metrics
 *   - Lead scoring logic
 *   - Specialist routing based on compound_target
 *   - Error handling — returns 500 on Firestore errors
 *
 * Note: The route currently only exposes POST; GET is not implemented.
 */

// Mock firebase-admin before any imports
vi.mock('@/lib/server/firebase-admin', () => {
  const mockDoc = {
    get: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const mockCollection = {
    doc: vi.fn(() => mockDoc),
    add: vi.fn(() => Promise.resolve({ id: 'mock-id' })),
    get: vi.fn(),
    where: vi.fn(() => ({
      get: vi.fn(),
      orderBy: vi.fn(() => ({
        get: vi.fn(),
      })),
    })),
    orderBy: vi.fn(() => ({
      limit: vi.fn(() => ({
        get: vi.fn(),
      })),
      get: vi.fn(),
    })),
  };

  return {
    adminDb: {
      collection: vi.fn(() => mockCollection),
    },
    isAdminInitialized: true,
  };
});

// Mock global fetch for Zapier webhook
const originalFetch = global.fetch;
const mockFetch = vi.fn(() => Promise.resolve({ ok: true } as Response));

describe('CRM Leads API', () => {
  let POST: (request: Request) => Promise<Response>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let adminDb: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    global.fetch = mockFetch as unknown as typeof fetch;

    // Dynamic import to pick up the mock
    const route = await import('@/app/api/crm/leads/route');
    POST = route.POST;
    const firebaseAdmin = await import('@/lib/server/firebase-admin');
    adminDb = firebaseAdmin.adminDb;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  // ─── Helper ────────────────────────────────────────────────────────

  function makeRequest(body: unknown): Request {
    return new Request('http://localhost/api/crm/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  // ─── POST /api/crm/leads — Success Cases ──────────────────────────

  describe('POST /api/crm/leads', () => {
    it('should create a lead with valid data and return success', async () => {
      const validPayload = {
        client_name: 'Ahmed Mohamed',
        client_mobile: '+201012345678',
        extracted_metrics: {
          intent: 'BUY',
          capital_budget: 5000000,
          timeline_weeks: 2,
          compound_target: 'Mivida',
        },
        conversation_summary: 'Client is looking for a 3BR villa in Mivida',
      };

      const mockSet = vi.fn(() => Promise.resolve());
      const mockDoc = { set: mockSet, get: vi.fn() };
      (adminDb.collection as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ doc: () => mockDoc });

      const response = await POST(makeRequest(validPayload));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.lead_id).toMatch(/^SBR-LEAD-/);
      expect(data.metrics_score).toBeDefined();
      expect(data.rep_owner).toBeDefined();
      expect(mockSet).toHaveBeenCalledTimes(1);

      // Verify the document written to Firestore has the right shape
      const writtenDoc = ((mockSet.mock as any).calls as any[][])[0]?.[0] as Record<string, unknown>;
      expect(writtenDoc.name).toBe('Ahmed Mohamed');
      expect(writtenDoc.mobile).toBe('+201012345678');
    });

    it('should assign VIP pipeline stage for high-scoring leads (score >= 8)', async () => {
      // Intent non-UNKNOWN: +3, budget > 0: +4, timeline <= 4 weeks: +3 = total 10
      const highScorePayload = {
        client_name: 'VIP Client',
        client_mobile: '+201099999999',
        extracted_metrics: {
          intent: 'BUY',
          capital_budget: 10000000,
          timeline_weeks: 2,
        },
      };

      const mockSet = vi.fn(() => Promise.resolve());
      const mockDoc = { set: mockSet, get: vi.fn() };
      (adminDb.collection as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ doc: () => mockDoc });

      const response = await POST(makeRequest(highScorePayload));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      const writtenDoc = ((mockSet.mock as any).calls as any[][])[0]?.[0] as Record<string, unknown>;
      expect(writtenDoc.pipeline_stage).toBe('VIP_QUALIFIED_CORRIDOR');
      expect(writtenDoc.sierra_ai_score).toBeGreaterThanOrEqual(8);
    });

    it('should assign LEAD_SOURCED stage for low-scoring leads (score < 8)', async () => {
      // Intent UNKNOWN: +0, budget 0: +0, timeline 0: +1 = total 1
      const lowScorePayload = {
        client_name: 'Cold Lead',
        client_mobile: '+201000000000',
        extracted_metrics: {
          intent: 'UNKNOWN',
          capital_budget: 0,
          timeline_weeks: 0,
        },
      };

      const mockSet = vi.fn(() => Promise.resolve());
      const mockDoc = { set: mockSet, get: vi.fn() };
      (adminDb.collection as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ doc: () => mockDoc });

      const response = await POST(makeRequest(lowScorePayload));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      const writtenDoc = ((mockSet.mock as any).calls as any[][])[0]?.[0] as Record<string, unknown>;
      expect(writtenDoc.pipeline_stage).toBe('LEAD_SOURCED');
    });

    it('should route to Mokattam specialist for Mokattam compound', async () => {
      const payload = {
        client_name: 'Test User',
        client_mobile: '+201011111111',
        extracted_metrics: {
          intent: 'BUY',
          capital_budget: 3000000,
          timeline_weeks: 3,
          compound_target: 'Uptown Mokattam',
        },
      };

      const mockSet = vi.fn(() => Promise.resolve());
      const mockDoc = { set: mockSet, get: vi.fn() };
      (adminDb.collection as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ doc: () => mockDoc });

      const response = await POST(makeRequest(payload));
      const data = await response.json();

      expect(data.rep_owner).toBe('CLOSER_MOKATTAM_SPECIALIST');
    });

    it('should route to VIP Golden Square specialist for Mivida compound', async () => {
      const payload = {
        client_name: 'Test User',
        client_mobile: '+201011111111',
        extracted_metrics: {
          intent: 'BUY',
          capital_budget: 3000000,
          timeline_weeks: 3,
          compound_target: 'Mivida',
        },
      };

      const mockSet = vi.fn(() => Promise.resolve());
      const mockDoc = { set: mockSet, get: vi.fn() };
      (adminDb.collection as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ doc: () => mockDoc });

      const response = await POST(makeRequest(payload));
      const data = await response.json();

      expect(data.rep_owner).toBe('CLOSER_VIP_GOLDEN_SQUARE');
    });

    it('should route to general pool for unrecognized compound', async () => {
      const payload = {
        client_name: 'Test User',
        client_mobile: '+201011111111',
        extracted_metrics: {
          intent: 'BUY',
          capital_budget: 3000000,
          timeline_weeks: 3,
          compound_target: 'Rehab',
        },
      };

      const mockSet = vi.fn(() => Promise.resolve());
      const mockDoc = { set: mockSet, get: vi.fn() };
      (adminDb.collection as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ doc: () => mockDoc });

      const response = await POST(makeRequest(payload));
      const data = await response.json();

      expect(data.rep_owner).toBe('GENERAL_ACTIVE_REPS_POOL');
    });
  });

  // ─── Validation — Missing Required Fields ────────────────────────────

  describe('POST /api/crm/leads — Validation', () => {
    it('should reject missing client_name', async () => {
      const payload = {
        client_mobile: '+201012345678',
        extracted_metrics: { intent: 'BUY', capital_budget: 5000000, timeline_weeks: 2 },
      };

      const response = await POST(makeRequest(payload));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('client_name');
    });

    it('should reject missing client_mobile', async () => {
      const payload = {
        client_name: 'Ahmed',
        extracted_metrics: { intent: 'BUY', capital_budget: 5000000, timeline_weeks: 2 },
      };

      const response = await POST(makeRequest(payload));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('client_mobile');
    });

    it('should reject blank/whitespace-only client_name', async () => {
      const payload = {
        client_name: '   ',
        client_mobile: '+201012345678',
        extracted_metrics: { intent: 'BUY', capital_budget: 5000000, timeline_weeks: 2 },
      };

      const response = await POST(makeRequest(payload));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject missing extracted_metrics', async () => {
      const payload = {
        client_name: 'Ahmed',
        client_mobile: '+201012345678',
      };

      const response = await POST(makeRequest(payload));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('extracted_metrics');
    });

    it('should reject extracted_metrics as an array', async () => {
      const payload = {
        client_name: 'Ahmed',
        client_mobile: '+201012345678',
        extracted_metrics: [{ intent: 'BUY' }],
      };

      const response = await POST(makeRequest(payload));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('extracted_metrics');
    });

    it('should reject extracted_metrics as a string', async () => {
      const payload = {
        client_name: 'Ahmed',
        client_mobile: '+201012345678',
        extracted_metrics: 'invalid',
      };

      const response = await POST(makeRequest(payload));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  // ─── Lead Scoring Logic ─────────────────────────────────────────────

  describe('Lead Scoring', () => {
    /**
     * Recreate the scoring logic from the route to test in isolation.
     * Score = intent points + budget points + timeline points
     *   intent !== 'UNKNOWN' → +3
     *   capital_budget > 0   → +4
     *   timeline_weeks > 0 && <= 4 → +3, else → +1
     */
    function computeLeadScore(metrics: { intent?: string; capital_budget?: number; timeline_weeks?: number }): number {
      let score = 0;
      if (metrics.intent !== 'UNKNOWN') score += 3;
      if ((metrics.capital_budget ?? 0) > 0) score += 4;
      if ((metrics.timeline_weeks ?? 0) > 0 && (metrics.timeline_weeks ?? 0) <= 4) score += 3;
      else score += 1;
      return score;
    }

    it('should score 10 for a hot lead (intent=BUY, budget>0, timeline<=4)', () => {
      expect(computeLeadScore({ intent: 'BUY', capital_budget: 5000000, timeline_weeks: 2 })).toBe(10);
    });

    it('should score 8 for a warm lead (intent=BUY, budget>0, timeline>4)', () => {
      expect(computeLeadScore({ intent: 'BUY', capital_budget: 2000000, timeline_weeks: 8 })).toBe(8);
    });

    it('should score 1 for an unknown lead (intent=UNKNOWN, no budget, no timeline)', () => {
      expect(computeLeadScore({ intent: 'UNKNOWN', capital_budget: 0, timeline_weeks: 0 })).toBe(1);
    });

    it('should score 4 for a lead with intent only (no budget, timeline > 4)', () => {
      expect(computeLeadScore({ intent: 'RENT', capital_budget: 0, timeline_weeks: 12 })).toBe(4);
    });

    it('should score 6 for a lead with intent + short timeline but no budget', () => {
      expect(computeLeadScore({ intent: 'INVEST', capital_budget: 0, timeline_weeks: 3 })).toBe(6);
    });
  });

  // ─── Error Handling ──────────────────────────────────────────────────

  describe('Error handling', () => {
    it('should return 500 on Firestore write error', async () => {
      const validPayload = {
        client_name: 'Error Test',
        client_mobile: '+201012345678',
        extracted_metrics: { intent: 'BUY', capital_budget: 5000000, timeline_weeks: 2 },
      };

      const mockSet = vi.fn(() => Promise.reject(new Error('Firestore write failed')));
      const mockDoc = { set: mockSet, get: vi.fn() };
      (adminDb.collection as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ doc: () => mockDoc });

      const response = await POST(makeRequest(validPayload));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Lead processing failed');
    });

    it('should return 500 when request body is invalid JSON', async () => {
      const badRequest = new Request('http://localhost/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not valid json{',
      });

      const response = await POST(badRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
});
