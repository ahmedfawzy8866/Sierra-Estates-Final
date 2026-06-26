import { NextRequest, NextResponse } from 'next/server';
import { applyCors, isPreflightRequest } from '@/lib/server/cors';
import {
  applyRateLimit,
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── CORS: Handle preflight ──────────────────────────────────────────────
  if (isPreflightRequest(request)) {
    return applyCors(request);
  }

  // ── Rate Limiting ───────────────────────────────────────────────────────
  const limiter = getLimiterForPath(pathname);
  const rateLimited = applyRateLimit(request, limiter);
  if (rateLimited) {
    // Apply CORS headers to rate limit response too
    return applyCors(request, rateLimited);
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
