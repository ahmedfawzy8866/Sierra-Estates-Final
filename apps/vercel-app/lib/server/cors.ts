/**
 * SIERRA ESTATES — CORS Configuration
 * Centralized CORS policy for all API routes.
 */

import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL || 'https://sierra-estates.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-SBR-SECRET-KEY',
  'X-Request-ID',
  'X-Firebase-AppCheck',
];
const EXPOSED_HEADERS = ['X-RateLimit-Remaining', 'X-RateLimit-Reset'];
const MAX_AGE = 86400; // 24 hours

export function applyCors(request: NextRequest, response?: NextResponse): NextResponse {
  const origin = request.headers.get('origin') || '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin) ||
    (origin.endsWith('.vercel.app') && process.env.NODE_ENV === 'production');

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
    'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
    'Access-Control-Expose-Headers': EXPOSED_HEADERS.join(', '),
    'Access-Control-Max-Age': String(MAX_AGE),
  };

  if (isAllowed) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  if (response) {
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  return NextResponse.json(null, { status: 204, headers });
}

export function isPreflightRequest(request: NextRequest): boolean {
  return request.method === 'OPTIONS';
}
