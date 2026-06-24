/**
 * SIERRA ESTATES — Rate Limiting
 *
 * Uses Upstash Redis (@upstash/ratelimit + @upstash/redis) when
 * UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set — this
 * gives multi-instance consistency on Vercel serverless.
 *
 * Falls back to in-memory rate limiting when env vars are missing (local
 * dev, CI, or self-hosted single-instance deploys). The fallback is
 * per-instance and bypassable on multi-instance setups — a warning is
 * logged once at module load.
 *
 * Usage in a route handler:
 *
 *   import { applyRateLimit, publicEndpointLimiter } from '@/lib/server/rate-limit';
 *
 *   export async function GET(req: Request) {
 *     const limited = applyRateLimit(req, publicEndpointLimiter);
 *     if (limited) return limited;
 *     // ... handler logic
 *   }
 *
 * Or async (preferred — uses Upstash when available):
 *
 *   import { applyRateLimitAsync, publicEndpointLimiter } from '@/lib/server/rate-limit';
 *
 *   export async function GET(req: Request) {
 *     const limited = await applyRateLimitAsync(req, publicEndpointLimiter);
 *     if (limited) return limited;
 *     // ... handler logic
 *   }
 */

import { NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  tag?: string;
}

interface RequestRecord {
  count: number;
  resetAt: number;
}

// ─── In-memory fallback store ──────────────────────────────────────────────
const memoryStore = new Map<string, RequestRecord>();

let warnedAboutMemoryFallback = false;

// ─── Upstash lazy init ────────────────────────────────────────────────────
let upstashRatelimit: any = null;
let upstashInitialized = false;

async function getUpstashRatelimit() {
  if (upstashInitialized) return upstashRatelimit;
  upstashInitialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (!warnedAboutMemoryFallback) {
      console.warn(
        '[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN not set — using in-memory fallback. ' +
        'Rate limits will be per-instance on multi-instance deploys (e.g. Vercel).'
      );
      warnedAboutMemoryFallback = true;
    }
    return null;
  }

  try {
    const { Ratelimit } = await import('@upstash/ratelimit');
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({ url, token });
    upstashRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '60 s'),
      prefix: 'sierra-rl',
      analytics: true,
    });
    console.info('[rate-limit] Upstash Redis connected — using distributed rate limiter.');
  } catch (err) {
    console.error('[rate-limit] Failed to initialize Upstash — falling back to in-memory:', err);
  }
  return upstashRatelimit;
}

// ─── Public API ────────────────────────────────────────────────────────────

export function getRateLimitKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded
    ? forwarded.split(',')[0].trim()
    : request.headers.get('x-real-ip') || 'unknown';
  return ip;
}

export function createRateLimiter(config: RateLimitConfig) {
  function memoryLimiter(request: Request): NextResponse | null {
    const key = getRateLimitKey(request);
    const now = Date.now();

    let record = memoryStore.get(key);
    if (!record || now > record.resetAt) {
      record = { count: 0, resetAt: now + config.windowMs };
      memoryStore.set(key, record);
    }
    record.count += 1;

    if (record.count > config.maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((record.resetAt - now) / 1000).toString(),
          },
        }
      );
    }
    return null;
  }

  async function upstashLimiter(request: Request): Promise<NextResponse | null> {
    const ratelimit = await getUpstashRatelimit();
    if (!ratelimit) return memoryLimiter(request);

    const identifier = getRateLimitKey(request);
    const tag = config.tag ?? 'rl';
    const { success, reset, remaining } = await ratelimit.limit(`${tag}:${identifier}`);

    if (!success) {
      const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(reset),
          },
        }
      );
    }
    return null;
  }

  return {
    check: memoryLimiter,
    checkAsync: upstashLimiter,
  };
}

export const publicEndpointLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  tag: 'public',
});

export const webhookLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
  tag: 'webhook',
});

export function applyRateLimit(
  request: Request,
  limiter: ReturnType<typeof createRateLimiter>
): NextResponse | null {
  return limiter.check(request);
}

export async function applyRateLimitAsync(
  request: Request,
  limiter: ReturnType<typeof createRateLimiter>
): Promise<NextResponse | null> {
  return limiter.checkAsync(request);
}
