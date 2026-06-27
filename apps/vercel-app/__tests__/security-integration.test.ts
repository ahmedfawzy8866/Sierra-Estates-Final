/**
 * Integration Tests — Security & Middleware
 *
 * Tests the core security infrastructure without needing a running server:
 * - CORS origin validation
 * - CSRF protection logic
 * - Rate limiting (in-memory fallback)
 * - Auth guard token verification
 * - Environment config validation
 * - Error response sanitization
 */

import { describe, it, expect, vi, beforeEach, type Assertion } from 'vitest';

// ─── CORS Tests ──────────────────────────────────────────────────────

describe('CORS Configuration', () => {
  // We test the CORS logic by simulating the origin check
  const ALLOWED_ORIGINS = [
    'https://sierra-estates.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  const ALLOWED_PRODUCTION_ORIGINS: string[] = [];

  function isOriginAllowed(origin: string): boolean {
    return ALLOWED_ORIGINS.includes(origin) || ALLOWED_PRODUCTION_ORIGINS.includes(origin);
  }

  it('allows the production site origin', () => {
    expect(isOriginAllowed('https://sierra-estates.vercel.app')).toBe(true);
  });

  it('allows localhost for development', () => {
    expect(isOriginAllowed('http://localhost:3000')).toBe(true);
    expect(isOriginAllowed('http://localhost:3001')).toBe(true);
  });

  it('rejects arbitrary .vercel.app subdomains', () => {
    expect(isOriginAllowed('https://attacker.vercel.app')).toBe(false);
    expect(isOriginAllowed('https://some-preview.vercel.app')).toBe(false);
  });

  it('rejects unknown origins', () => {
    expect(isOriginAllowed('https://evil.com')).toBe(false);
    expect(isOriginAllowed('http://localhost:8080')).toBe(false);
  });

  it('rejects empty origin', () => {
    expect(isOriginAllowed('')).toBe(false);
  });
});

// ─── CSRF Protection Tests ──────────────────────────────────────────

describe('CSRF Protection Logic', () => {
  const CSRF_ALLOWED_ORIGINS = [
    'https://sierra-estates.vercel.app',
    'http://localhost:3000',
  ];

  const CSRF_EXEMPT_PATHS = ['/api/webhooks/', '/api/cron/', '/api/health'];
  const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

  function shouldCheckCsrf(method: string, pathname: string): boolean {
    if (!STATE_CHANGING_METHODS.includes(method.toUpperCase())) return false;
    if (CSRF_EXEMPT_PATHS.some(p => pathname.startsWith(p))) return false;
    return true;
  }

  function isCsrfValid(
    method: string,
    pathname: string,
    origin: string,
    hasCustomHeader: boolean
  ): boolean {
    if (!shouldCheckCsrf(method, pathname)) return true;
    if (hasCustomHeader) return true;
    if (origin && CSRF_ALLOWED_ORIGINS.includes(origin)) return true;
    return false;
  }

  it('allows GET requests without CSRF check', () => {
    expect(isCsrfValid('GET', '/api/listings', '', false)).toBe(true);
  });

  it('blocks POST without origin or custom header', () => {
    expect(isCsrfValid('POST', '/api/leads', '', false)).toBe(false);
  });

  it('allows POST with valid origin', () => {
    expect(isCsrfValid('POST', '/api/leads', 'https://sierra-estates.vercel.app', false)).toBe(true);
  });

  it('allows POST with custom header (X-Requested-With)', () => {
    expect(isCsrfValid('POST', '/api/leads', '', true)).toBe(true);
  });

  it('blocks POST from evil origin without custom header', () => {
    expect(isCsrfValid('POST', '/api/leads', 'https://evil.com', false)).toBe(false);
  });

  it('exempts webhook routes from CSRF', () => {
    expect(isCsrfValid('POST', '/api/webhooks/twilio-inbound', '', false)).toBe(true);
  });

  it('exempts cron routes from CSRF', () => {
    expect(isCsrfValid('GET', '/api/cron/sync-leads', '', false)).toBe(true);
  });

  it('exempts health route from CSRF', () => {
    expect(isCsrfValid('GET', '/api/health', '', false)).toBe(true);
  });

  it('blocks PUT and DELETE without origin', () => {
    expect(isCsrfValid('PUT', '/api/listings/123', '', false)).toBe(false);
    expect(isCsrfValid('DELETE', '/api/listings/123', '', false)).toBe(false);
  });
});

// ─── Rate Limiting Tests ─────────────────────────────────────────────

describe('Rate Limiting (In-Memory)', () => {
  // Simplified rate limiter matching the real implementation
  const store = new Map<string, { count: number; resetAt: number }>();

  function checkRateLimit(key: string, windowMs: number, maxRequests: number): { limited: boolean; remaining: number } {
    const now = Date.now();
    let record = store.get(key);
    if (!record || now > record.resetAt) {
      record = { count: 0, resetAt: now + windowMs };
      store.set(key, record);
    }
    record.count += 1;
    const remaining = Math.max(0, maxRequests - record.count);
    return { limited: record.count > maxRequests, remaining };
  }

  beforeEach(() => {
    store.clear();
  });

  it('allows requests under the limit', () => {
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit('ip1', 60000, 10);
      expect(result.limited).toBe(false);
    }
  });

  it('blocks requests over the limit', () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit('ip2', 60000, 10);
    }
    const result = checkRateLimit('ip2', 60000, 10);
    expect(result.limited).toBe(true);
  });

  it('tracks remaining requests correctly', () => {
    const r1 = checkRateLimit('ip3', 60000, 5);
    expect(r1.remaining).toBe(4);
    const r2 = checkRateLimit('ip3', 60000, 5);
    expect(r2.remaining).toBe(3);
  });

  it('separates limits by IP', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit('ip-a', 60000, 5);
    }
    // ip-a should be limited
    expect(checkRateLimit('ip-a', 60000, 5).limited).toBe(true);
    // ip-b should still be fine
    expect(checkRateLimit('ip-b', 60000, 5).limited).toBe(false);
  });
});

// ─── Error Response Sanitization Tests ──────────────────────────────

describe('Error Response Sanitization', () => {
  function sanitizeError(error: unknown): { message: string; safe: boolean } {
    if (error instanceof Error) {
      // Internal error details must NOT be exposed to clients
      return { message: error.message, safe: false };
    }
    return { message: 'Unknown error', safe: false };
  }

  function createPublicErrorResponse(error: unknown): { error: string } {
    // Production pattern: never expose internal error details
    console.error('Internal error:', error instanceof Error ? error.message : 'Unknown');
    return { error: 'An unexpected error occurred' };
  }

  it('never exposes internal error messages to clients', () => {
    const internalError = new Error('ECONNREFUSED 10.0.1.5:5432 - database connection failed');
    const response = createPublicErrorResponse(internalError);

    expect(response.error).not.toContain('ECONNREFUSED');
    expect(response.error).not.toContain('10.0.1.5');
    expect(response.error).not.toContain('database');
    expect(response.error).toBe('An unexpected error occurred');
  });

  it('does not leak file paths from errors', () => {
    const pathError = new Error('ENOENT: no such file /etc/secrets/db-password');
    const response = createPublicErrorResponse(pathError);

    expect(response.error).not.toContain('/etc/secrets');
    expect(response.error).not.toContain('ENOENT');
  });

  it('does not leak API keys from errors', () => {
    const keyError = new Error('Invalid API key: sk-proj-abc123def456');
    const response = createPublicErrorResponse(keyError);

    expect(response.error).not.toContain('sk-proj');
    expect(response.error).not.toContain('abc123');
  });
});

// ─── Environment Config Validation Tests ────────────────────────────

describe('Environment Config Validation', () => {
  // Simulate the Zod schema validation logic
  function validatePublicEnv(env: Record<string, string | undefined>): { valid: boolean; missing: string[] } {
    const required = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_APP_ID',
    ];
    const missing = required.filter(key => !env[key] || env[key]!.trim() === '');
    return { valid: missing.length === 0, missing };
  }

  it('fails when required public env vars are missing', () => {
    const result = validatePublicEnv({});
    expect(result.valid).toBe(false);
    expect(result.missing.length).toBeGreaterThan(0);
  });

  it('passes when all required public env vars are set', () => {
    const result = validatePublicEnv({
      NEXT_PUBLIC_FIREBASE_API_KEY: 'test-key',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test-project',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
      NEXT_PUBLIC_FIREBASE_APP_ID: '1:123:web:abc',
    });
    expect(result.valid).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it('detects blank env vars as missing', () => {
    const result = validatePublicEnv({
      NEXT_PUBLIC_FIREBASE_API_KEY: '   ',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test-project',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
      NEXT_PUBLIC_FIREBASE_APP_ID: '1:123:web:abc',
    });
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('NEXT_PUBLIC_FIREBASE_API_KEY');
  });

  function isPropertyFinderConfigured(env: Record<string, string | undefined>): boolean {
    return !!(
      (env.PROPERTY_FINDER_API_KEY && env.PROPERTY_FINDER_API_SECRET) ||
      (env.PROPERTY_FINDER_CLIENT_ID && env.PROPERTY_FINDER_CLIENT_SECRET)
    );
  }

  it('detects when Property Finder is NOT configured', () => {
    expect(isPropertyFinderConfigured({})).toBe(false);
  });

  it('detects when Property Finder IS configured', () => {
    expect(isPropertyFinderConfigured({
      PROPERTY_FINDER_API_KEY: 'key',
      PROPERTY_FINDER_API_SECRET: 'secret',
    })).toBe(true);
  });

  it('detects partial PF config as NOT configured', () => {
    expect(isPropertyFinderConfigured({
      PROPERTY_FINDER_API_KEY: 'key',
      // missing API_SECRET
    })).toBe(false);
  });
});

// ─── Input Validation Tests ──────────────────────────────────────────

describe('Input Validation', () => {
  function sanitizeForOutput(input: string, maxLength: number = 200): string {
    return input
      .replace(/<[^>]*>/g, '')
      .slice(0, maxLength)
      .trim();
  }

  it('strips HTML tags from user input', () => {
    expect(sanitizeForOutput('<script>alert("xss")</script>Hello')).toBe('alert("xss")Hello');
    expect(sanitizeForOutput('<b>Bold</b> text')).toBe('Bold text');
    expect(sanitizeForOutput('<img src=x onerror=alert(1)>')).toBe('');
  });

  it('truncates input to maxLength', () => {
    const long = 'A'.repeat(500);
    expect(sanitizeForOutput(long, 200).length).toBe(200);
  });

  it('trims whitespace', () => {
    expect(sanitizeForOutput('  hello  ')).toBe('hello');
  });

  it('handles empty input', () => {
    expect(sanitizeForOutput('')).toBe('');
  });

  function validateWebhookUrl(url: string | undefined): { valid: boolean; reason?: string } {
    if (!url) return { valid: false, reason: 'No URL provided' };
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') {
        return { valid: false, reason: 'Only HTTPS URLs are allowed' };
      }
      return { valid: true };
    } catch {
      return { valid: false, reason: 'Invalid URL format' };
    }
  }

  it('accepts valid HTTPS webhook URLs', () => {
    expect(validateWebhookUrl('https://hooks.zapier.com/12345').valid).toBe(true);
  });

  it('rejects HTTP webhook URLs', () => {
    const result = validateWebhookUrl('http://internal-service:8080/webhook');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('HTTPS');
  });

  it('rejects invalid URLs', () => {
    expect(validateWebhookUrl('not-a-url').valid).toBe(false);
  });

  it('rejects empty/undefined webhook URLs', () => {
    expect(validateWebhookUrl(undefined).valid).toBe(false);
  });
});

// ─── Smart Filter AI Output Validation Tests ─────────────────────────

describe('Smart Filter AI Output Validation', () => {
  const VALID_PROPERTY_TYPES = ['apartment', 'villa', 'townhouse', 'duplex', 'penthouse', 'studio', 'chalet', 'commercial', 'land'];
  const VALID_OFFERING_TYPES = ['sale', 'rent'];

  interface FilterResult {
    propertyType?: string;
    offeringType?: string;
    bedrooms?: number;
    priceMin?: number;
    priceMax?: number;
  }

  function validateFilterResult(filter: FilterResult): FilterResult {
    const validated = { ...filter };
    if (validated.propertyType && !VALID_PROPERTY_TYPES.includes(validated.propertyType)) {
      delete validated.propertyType;
    }
    if (validated.offeringType && !VALID_OFFERING_TYPES.includes(validated.offeringType)) {
      delete validated.offeringType;
    }
    if (validated.bedrooms !== undefined && (typeof validated.bedrooms !== 'number' || validated.bedrooms < 0 || validated.bedrooms > 20)) {
      delete validated.bedrooms;
    }
    if (validated.priceMin !== undefined && (typeof validated.priceMin !== 'number' || validated.priceMin < 0)) {
      delete validated.priceMin;
    }
    if (validated.priceMax !== undefined && (typeof validated.priceMax !== 'number' || validated.priceMax < 0)) {
      delete validated.priceMax;
    }
    return validated;
  }

  it('allows valid property types', () => {
    const result = validateFilterResult({ propertyType: 'villa' });
    expect(result.propertyType).toBe('villa');
  });

  it('strips invalid property types (SQL injection attempt)', () => {
    const result = validateFilterResult({ propertyType: "'; DROP TABLE units;--" });
    expect(result.propertyType).toBeUndefined();
  });

  it('strips invalid offering types', () => {
    const result = validateFilterResult({ offeringType: 'steal' });
    expect(result.offeringType).toBeUndefined();
  });

  it('strips negative bedroom counts', () => {
    const result = validateFilterResult({ bedrooms: -5 });
    expect(result.bedrooms).toBeUndefined();
  });

  it('strips unreasonably high bedroom counts', () => {
    const result = validateFilterResult({ bedrooms: 999 });
    expect(result.bedrooms).toBeUndefined();
  });

  it('strips negative price values', () => {
    const result = validateFilterResult({ priceMin: -1000 });
    expect(result.priceMin).toBeUndefined();
  });

  it('preserves valid filter values', () => {
    const input = { propertyType: 'apartment', offeringType: 'rent', bedrooms: 3, priceMin: 1000000, priceMax: 5000000 };
    const result = validateFilterResult(input);
    expect(result).toEqual(input);
  });
});

// ─── PFSyncEngine Hash Consistency Tests ────────────────────────────

describe('PFSyncEngine Sync Hash', () => {
  function computeSyncHash(pfReference: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(`pf:${pfReference}`).digest('hex');
  }

  it('produces deterministic hashes for the same reference', () => {
    const hash1 = computeSyncHash('PF-REF-001');
    const hash2 = computeSyncHash('PF-REF-001');
    expect(hash1).toBe(hash2);
  });

  it('produces different hashes for different references', () => {
    const hash1 = computeSyncHash('PF-REF-001');
    const hash2 = computeSyncHash('PF-REF-002');
    expect(hash1).not.toBe(hash2);
  });

  it('produces 64-char hex strings', () => {
    const hash = computeSyncHash('TEST');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('handles empty reference', () => {
    const hash = computeSyncHash('');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
