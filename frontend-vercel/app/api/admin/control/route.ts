/**
 * Admin Control Proxy — Intelligence OS
 *
 * Single authenticated entry point the admin dashboard uses to trigger
 * secret-gated server operations (Sheets ingestion, Property-Finder syncs,
 * orchestration, seeding). The browser only ever sends the admin's Firebase
 * ID token; the server-side secrets (CRON_SECRET, SBR_SECRET_KEY) never leave
 * the server and are attached here on the internal hop.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest, unauthorizedResponse } from '@/lib/server/auth-guard';

export const dynamic = 'force-dynamic';

type Action =
  | 'sync-sheets'
  | 'sync-leads'
  | 'sync-listings'
  | 'seed-listings'
  | 'orchestrate'
  | 'matching-bulk';

interface Dispatch {
  method: 'GET' | 'POST';
  path: string;
  secret: 'cron' | 'sbr' | 'none';
  body?: (input: Record<string, unknown>) => unknown;
}

const ROUTES: Record<Action, Dispatch> = {
  'sync-sheets': { method: 'GET', path: '/api/cron/ingest-from-sheets', secret: 'cron' },
  'sync-leads': { method: 'GET', path: '/api/cron/sync-leads', secret: 'cron' },
  'sync-listings': { method: 'GET', path: '/api/cron/sync-listings', secret: 'cron' },
  'seed-listings': { method: 'POST', path: '/api/seed/listings', secret: 'cron' },
  'matching-bulk': { method: 'POST', path: '/api/matching?bulk=true', secret: 'none' },
  'orchestrate': {
    method: 'POST',
    path: '/api/orchestrate',
    secret: 'sbr',
    body: (i) => ({ docId: i.docId, collection: i.collection || 'whatsapp_intake' }),
  },
};

export async function POST(req: NextRequest) {
  // Gate: must be an authenticated Firebase admin user.
  const authResult = await verifyRequest(req);
  if (!authResult.authenticated || authResult.method !== 'firebase') {
    return unauthorizedResponse('Admin authentication required');
  }

  let input: Record<string, unknown> = {};
  try {
    input = await req.json();
  } catch {
    /* empty body allowed for GET-style actions */
  }

  const action = String(input.action || '') as Action;
  const dispatch = ROUTES[action];
  if (!dispatch) {
    return NextResponse.json(
      { success: false, error: `Unknown action: ${action || '(none)'}` },
      { status: 400 }
    );
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (dispatch.secret === 'cron') {
    headers['Authorization'] = `Bearer ${process.env.CRON_SECRET || ''}`;
  } else if (dispatch.secret === 'sbr') {
    headers['X-SBR-SECRET-KEY'] = process.env.SBR_SECRET_KEY || '';
  }

  const url = `${req.nextUrl.origin}${dispatch.path}`;
  try {
    const res = await fetch(url, {
      method: dispatch.method,
      headers,
      body: dispatch.method === 'POST' ? JSON.stringify(dispatch.body ? dispatch.body(input) : {}) : undefined,
      cache: 'no-store',
    });
    const text = await res.text();
    let result: unknown = text;
    try {
      result = text ? JSON.parse(text) : null;
    } catch {
      /* keep raw text */
    }
    return NextResponse.json(
      { success: res.ok, action, status: res.status, result },
      { status: res.ok ? 200 : 502 }
    );
  } catch (e) {
    return NextResponse.json(
      { success: false, action, error: e instanceof Error ? e.message : 'Proxy error' },
      { status: 500 }
    );
  }
}
