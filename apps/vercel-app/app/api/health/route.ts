/**
 * GET /api/health
 * Health check endpoint for uptime monitoring and load balancers.
 * Returns system status and integration readiness without exposing secrets.
 */

import { NextResponse } from 'next/server';
import { isAdminInitialized } from '@/lib/server/firebase-admin';

export async function GET() {
  const checks: Record<string, 'ok' | 'degraded' | 'down'> = {};

  // Firebase Admin SDK
  checks.firebaseAdmin = isAdminInitialized ? 'ok' : 'degraded';

  // Upstash Redis (check if env vars are set)
  const upstashConfigured = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
  checks.rateLimiting = upstashConfigured ? 'ok' : 'degraded';

  // Twilio
  const twilioConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
  checks.twilio = twilioConfigured ? 'ok' : 'degraded';

  // Property Finder
  const pfConfigured = !!(
    (process.env.PROPERTY_FINDER_API_KEY && process.env.PROPERTY_FINDER_API_SECRET) ||
    (process.env.PROPERTY_FINDER_CLIENT_ID && process.env.PROPERTY_FINDER_CLIENT_SECRET)
  );
  checks.propertyFinder = pfConfigured ? 'ok' : 'degraded';

  // Determine overall status
  const hasDown = Object.values(checks).includes('down');
  const hasDegraded = Object.values(checks).includes('degraded');
  const overallStatus = hasDown ? 'down' : hasDegraded ? 'degraded' : 'ok';

  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    checks,
  }, {
    status: overallStatus === 'down' ? 503 : 200,
  });
}
