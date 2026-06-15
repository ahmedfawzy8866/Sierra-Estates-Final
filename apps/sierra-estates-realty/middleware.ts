import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { corsHeaders } from '@/lib/server/cors';

/**
 * Edge middleware for ALL `/api` routes. Two independent concerns, kept apart:
 *
 * 1. CORS — the Sierra Estates frontend is a separate origin (its own repo /
 *    deployment), so every `/api` response carries an allowlisted CORS header
 *    set and preflight `OPTIONS` requests are answered here. The allowlist is
 *    driven by `ALLOWED_ORIGINS` (see `lib/server/cors.ts`). Dynamic origin
 *    reflection lives here because static `vercel.json` headers can only pin a
 *    single origin — which breaks preview deploys and local dev.
 *
 * 2. Shared-secret gate — ONLY `/api/orchestrate` is gated on `X-SBR-SECRET-KEY`.
 *    Public/browser routes (`/api/listings`, `/api/leads`, `/api/concierge`, …),
 *    cron routes (authenticated with `CRON_SECRET`) and inbound third-party
 *    webhooks (`/api/webhooks/*`, `/api/telegram`, `/api/whatsapp/*` — each with
 *    its own secret/HMAC) authenticate themselves and must NEVER be gated here,
 *    or we would 401 the public site and break inbound webhooks.
 */
export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const cors = corsHeaders(origin);

  // 1) Answer CORS preflight immediately for any /api route.
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: cors });
  }

  // 2) Shared-secret gate — internal automation route(s) only.
  if (request.nextUrl.pathname.startsWith('/api/orchestrate')) {
    const inboundSecretHeader = request.headers.get('X-SBR-SECRET-KEY');
    const systemSecureToken = process.env.SBR_SECRET_KEY;

    // Token configured but missing/mismatched → block. No token (local dev) → allow.
    if (systemSecureToken && inboundSecretHeader !== systemSecureToken) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized: Invalid or missing X-SBR-SECRET-KEY' }),
        { status: 401, headers: { 'content-type': 'application/json', ...cors } }
      );
    }
  }

  // 3) Forward the request, attaching CORS headers to the response.
  const res = NextResponse.next();
  for (const [key, value] of Object.entries(cors)) res.headers.set(key, value);
  return res;
}

// Matches every /api route so CORS is applied uniformly. The secret gate inside
// the handler still restricts itself to /api/orchestrate — do NOT move that
// check into the matcher, or public/cron/webhook routes would be blocked.
export const config = { matcher: ['/api/:path*'] };
