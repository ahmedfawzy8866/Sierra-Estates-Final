/**
 * Intelligence OS — client API layer.
 *
 * Thin, defensive wrappers around the existing Sierra API routes. Every call
 * returns { ok, data, error } and never throws, so the admin UI degrades
 * gracefully (and renders in CI / empty-backend environments) instead of
 * crashing. Auth'd calls attach the current Firebase ID token.
 */
import { auth } from '@/lib/firebase';

export interface ApiResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

async function idToken(): Promise<string | null> {
  try {
    return (await auth?.currentUser?.getIdToken?.()) ?? null;
  } catch {
    return null;
  }
}

async function authHeaders(json = true): Promise<Record<string, string>> {
  const h: Record<string, string> = {};
  if (json) h['Content-Type'] = 'application/json';
  const t = await idToken();
  if (t) h['Authorization'] = `Bearer ${t}`;
  return h;
}

async function call<T = unknown>(
  url: string,
  init?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, init);
    const text = await res.text();
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      /* non-json response — keep raw text */
    }
    if (!res.ok) {
      const msg =
        (body && typeof body === 'object' && 'error' in body
          ? String((body as { error: unknown }).error)
          : `HTTP ${res.status}`) || `HTTP ${res.status}`;
      return { ok: false, error: msg, data: body as T };
    }
    return { ok: true, data: body as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}

/* ── Reads (public routes) ──────────────────────────────────── */

export function fetchListings(limit = 24) {
  return call<{ success: boolean; listings: Record<string, unknown>[]; count: number }>(
    `/api/listings?limit=${limit}`
  );
}

export async function fetchLeads() {
  // /api/leads (GET) if present, otherwise the CRM route — both tolerated.
  const r = await call<{ leads?: unknown[]; data?: unknown[] }>(`/api/leads`);
  return r;
}

export function fetchPortfolio(count = 6, market: 'egypt' | 'uae' = 'egypt') {
  return call(`/api/wealth/portfolio?count=${count}&market=${market}`);
}

/* ── Agents (Sierra / Leila-Lola / Scribe / Curator / Closer) ── */

export type AgentId =
  | 'SIERRA_CORE'
  | 'SCRIBE'
  | 'CURATOR'
  | 'MATCHMAKER'
  | 'CLOSER';

export async function chatAgent(agentId: AgentId, message: string) {
  return call<{ success: boolean; response: string; vipAlert?: boolean }>(
    `/api/agent/hub`,
    {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ agentId, message }),
    }
  );
}

/* ── Scrapers / matching (public) ───────────────────────────── */

export async function pfSearch(params = '') {
  return call(`/api/property-finder?action=search-listings${params ? '&' + params : ''}`);
}

export async function runMatchingBulk() {
  return call(`/api/matching?bulk=true`, { method: 'POST', headers: await authHeaders() });
}

export async function openclawInsights(
  stats: Record<string, unknown>,
  activities: string[]
) {
  return call<{ insights: { type: string; text: string; priority?: string; action?: string }[] | null }>(
    `/api/openclaw`,
    {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ stats, activities }),
    }
  );
}

/* ── Admin control proxy (secret-gated ops, admin-token guarded) ─ */

export type ControlAction =
  | 'sync-sheets'
  | 'sync-leads'
  | 'sync-listings'
  | 'seed-listings'
  | 'orchestrate'
  | 'matching-bulk';

export async function adminControl(action: ControlAction, payload?: Record<string, unknown>) {
  return call<{ success: boolean; action: string; result?: unknown; error?: string }>(
    `/api/admin/control`,
    {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ action, ...(payload || {}) }),
    }
  );
}
