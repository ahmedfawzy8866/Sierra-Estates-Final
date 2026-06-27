import { NextRequest, NextResponse } from 'next/server';
import { applyCors, isPreflightRequest } from '@/lib/server/cors';
import {
  applyRateLimitAsync,
  publicEndpointLimiter,
  webhookLimiter,
  createRateLimiter,
} from '@/lib/server/rate-limit';

const VALID_SECRET = process.env.SBR_SECRET_KEY;

/**
 * Rate limiters for different route families
 */
const adminLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  tag: 'admin',
});

const syncLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
  tag: 'sync',
});

/**
 * Determine which rate limiter to use based on the path
 */
function getLimiterForPath(pathname: string) {
  if (pathname.startsWith('/api/webhooks/')) return webhookLimiter;
  if (pathname.startsWith('/api/cron/')) return adminLimiter;
  if (pathname.includes('/sync') || pathname.includes('/property-finder')) return syncLimiter;
  return publicEndpointLimiter;
}

/**
 * Routes that require the SBR secret key
 */
const PROTECTED_ROUTES = ['/api/orchestrate', '/api/cron/', '/api/admin/'];

/**
 * Routes that are public (no auth required)
 */
const PUBLIC_ROUTES = ['/api/listings', '/api/leads', '/api/viewing-requests', '/api/chat'];

/**
 * Routes exempt from CSRF checks (they have their own auth or signature verification)
 */
const CSRF_EXEMPT_ROUTES = ['/api/webhooks/', '/api/cron/', '/api/health'];

/**
 * Allowed origins for CSRF validation — must match CORS policy
 */
const CSRF_ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL || 'https://sierra-estates.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

/**
 * CSRF protection for state-changing requests (POST, PUT, PATCH, DELETE).
 * Rejects requests where the Origin/Referer doesn't match our allowed origins
 * AND the request doesn't include an X-Requested-With or Authorization header.
 * Cross-origin forms can't set custom headers, so this blocks CSRF attacks.
 */
function checkCsrf(request: NextRequest): NextResponse | null {
  const method = request.method.toUpperCase();
  // Only check state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return null;

  const { pathname } = request.nextUrl;

  // Exempt webhook/cron routes (they have their own signature verification)
  if (CSRF_EXEMPT_ROUTES.some(route => pathname.startsWith(route))) return null;

  // If request has a custom header, it's not a simple form submission
  const hasCustomHeader = request.headers.has('x-requested-with') ||
    request.headers.has('authorization') ||
    request.headers.has('x-sbr-secret-key') ||
    request.headers.has('x-firebase-appcheck');

  if (hasCustomHeader) return null;

  // Check Origin header against allowlist
  const origin = request.headers.get('origin') || '';
  const referer = request.headers.get('referer') || '';
  const originToCheck = origin || (referer ? new URL(referer).origin : '');

  if (originToCheck && CSRF_ALLOWED_ORIGINS.some(allowed => originToCheck === allowed)) {
    return null; // Valid origin
  }

  // No valid origin and no custom headers — likely a CSRF attack
  console.warn(`[CSRF] Blocked request to ${pathname} from origin: ${originToCheck || 'none'}`);
  const response = NextResponse.json(
    { error: 'Forbidden: Missing required request headers' },
    { status: 403 }
  );
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── CORS: Handle preflight ──────────────────────────────────────────────
  if (isPreflightRequest(request)) {
    return applyCors(request);
  }

  // ── Rate Limiting (async — uses Upstash Redis when available) ───────────
  const limiter = getLimiterForPath(pathname);
  const rateLimited = await applyRateLimitAsync(request, limiter);
  if (rateLimited) {
    // Apply CORS headers to rate limit response too
    return applyCors(request, rateLimited);
  }

  // ── CSRF Protection ─────────────────────────────────────────────────────
  const csrfRejected = checkCsrf(request);
  if (csrfRejected) {
    return applyCors(request, csrfRejected);
  }

  // ── Auth: Protected routes require SBR secret key ───────────────────────
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected) {
    if (!VALID_SECRET) {
      const response = NextResponse.json(
        { error: 'Server misconfiguration: missing SBR_SECRET_KEY' },
        { status: 500 }
      );
      return applyCors(request, response);
    }

    const secretKey = request.headers.get('x-sbr-secret-key');
    if (!secretKey || secretKey !== VALID_SECRET) {
      const response = NextResponse.json(
        { error: 'Unauthorized: Invalid or missing X-SBR-SECRET-KEY header' },
        { status: 401 }
      );
      return applyCors(request, response);
    }
  }

  // ── Continue to route handler ───────────────────────────────────────────
  const response = NextResponse.next();

  // Apply CORS headers to all API responses
  if (pathname.startsWith('/api/')) {
    applyCors(request, response);
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
