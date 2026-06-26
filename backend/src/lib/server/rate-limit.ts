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
 *     const limited = await applyRateLimit(req, publicEndpointLimiter);
 *     if (limited) return limited;
 *     // ... handler logic
 *   }
 */

import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  tag: string;
}

interface RequestRecord {
  count: number;
  resetAt: number;
}

// ─── In-memory fallback store ──────────────────────────────────────────────
const memoryStore = new Map<string, RequestRecord>();
let warnedAboutMemoryFallback = false;

// ─── Upstash Rate Limit Instance Cache ──────────────────────────────────────
const ratelimitInstances = new Map<string, Ratelimit>();

function getUpstashRatelimit(config: RateLimitConfig): Ratelimit | null {
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

  const instanceKey = `${config.tag}:${config.maxRequests}:${config.windowMs}`;
  if (ratelimitInstances.has(instanceKey)) {
    return ratelimitInstances.get(instanceKey)!;
  }

  try {
    const redis = new Redis({ url, token });
    
    // Upstash Ratelimit expects window format as string e.g. "60 s" or "10 m"
    const windowSeconds = Math.ceil(config.windowMs / 1000);
    const windowString = `${windowSeconds} s`;

    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.maxRequests, windowString as any),
      prefix: `sierra-rl:${config.tag}`,
      analytics: true,
    });
    
    ratelimitInstances.set(instanceKey, ratelimit);
    console.info(`[rate-limit] Upstash Redis connected for ${instanceKey} — using distributed rate limiter.`);
    return ratelimit;
  } catch (err) {
    console.error('[rate-limit] Failed to initialize Upstash — falling back to in-memory:', err);
    return null;
  }
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

  async function checkAsync(request: Request): Promise<NextResponse | null> {
    const ratelimit = getUpstashRatelimit(config);
    if (!ratelimit) return memoryLimiter(request);

    const identifier = getRateLimitKey(request);
    const { success, reset, remaining } = await ratelimit.limit(identifier);

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
    checkAsync,
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

export async function applyRateLimit(
  request: Request,
  limiter: ReturnType<typeof createRateLimiter>
): Promise<NextResponse | null> {
  return limiter.checkAsync(request);
}
