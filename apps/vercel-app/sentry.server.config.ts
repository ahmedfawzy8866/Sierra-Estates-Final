// ─── Sentry Server-Side Config ────────────────────────────────────────
// This file configures the Sentry Node.js SDK for API routes and
// server components. It captures unhandled exceptions in server-side code.

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  enabled: !!process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',

  // Suppress noisy server-side errors
  ignoreErrors: [
    'NetworkError',
    'Failed to fetch',
  ],

  // Redact sensitive headers before sending to Sentry
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['x-sbr-secret-key'];
      delete event.request.headers['cookie'];
    }
    return event;
  },

  // Hook into existing Pino logger — Sentry will automatically capture
  // logged errors at 'error' level
  integrations: [],
});
