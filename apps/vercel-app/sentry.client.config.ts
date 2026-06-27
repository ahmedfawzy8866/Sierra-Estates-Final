// ─── Sentry Client-Side Config ────────────────────────────────────────
// This file configures the Sentry browser SDK for the Vercel app.
// It wraps Next.js's built-in error boundary and captures unhandled
// client-side exceptions, rejected promises, and performance traces.

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production — lower = fewer events sent
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Capture Replay for 10% of sessions in production
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 0.1,

  // Only enable in production (or when DSN is explicitly set)
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Don't capture errors from localhost in development
  environment: process.env.NODE_ENV || 'development',

  // Filter out noisy errors
  ignoreErrors: [
    // Network errors that are not actionable
    'NetworkError',
    'Failed to fetch',
    'Load failed',
    // Browser extensions
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],

  // Attach user context from Firebase when available
  beforeSend(event, hint) {
    // Don't send events with PII in URLs
    if (event.request?.url) {
      event.request.url = event.request.url.replace(/\/api\/crm\/leads\/[^/]+/g, '/api/crm/leads/:id');
    }
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;