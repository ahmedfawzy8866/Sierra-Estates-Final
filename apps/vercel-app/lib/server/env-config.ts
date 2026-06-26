/**
 * SIERRA ESTATES — Environment Configuration Validation
 * Validates all required env vars at startup and provides typed access.
 */

import { z } from 'zod';

// Public env vars (safe to expose to client)
const publicEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'Firebase API key is required'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase auth domain is required'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase project ID is required'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'Firebase storage bucket is required'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, 'Firebase app ID is required'),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional().default('https://sierra-estates.vercel.app'),
});

// Server-only env vars
const serverEnvSchema = z.object({
  // Auth & Security
  SBR_SECRET_KEY: z.string().min(16, 'SBR_SECRET_KEY must be at least 16 characters'),
  CRON_SECRET: z.string().min(16, 'CRON_SECRET must be at least 16 characters').optional(),

  // Firebase Admin
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),

  // Property Finder Atlas API
  PROPERTY_FINDER_API_GATEWAY: z.string().url().optional().default('https://atlas.propertyfinder.com'),
  PROPERTY_FINDER_API_KEY: z.string().optional(),
  PROPERTY_FINDER_API_SECRET: z.string().optional(),
  PROPERTY_FINDER_CLIENT_ID: z.string().optional(),
  PROPERTY_FINDER_CLIENT_SECRET: z.string().optional(),

  // Twilio / WhatsApp
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  WABA_NUMBER_1: z.string().optional(),
  WABA_NUMBER_2: z.string().optional(),
  WABA_NUMBER_3: z.string().optional(),
  WABA_NUMBER_4: z.string().optional(),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),

  // Google Services
  GOOGLE_SHEETS_CREDENTIALS: z.string().optional(),
  GOOGLE_SHEETS_SPREADSHEET_ID: z.string().optional(),

  // Rate Limiting
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // AI
  GOOGLE_AI_API_KEY: z.string().optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

let _publicEnv: PublicEnv | null = null;
let _serverEnv: ServerEnv | null = null;
let _validationErrors: z.ZodError | null = null;

export function validatePublicEnv(): PublicEnv {
  if (_publicEnv) return _publicEnv;
  const result = publicEnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error('[env] Public env validation failed:', result.error.flatten().fieldErrors);
    _validationErrors = result.error;
    throw new Error('Missing required public environment variables');
  }
  _publicEnv = result.data;
  return _publicEnv;
}

export function validateServerEnv(): ServerEnv {
  if (_serverEnv) return _serverEnv;
  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    console.warn('[env] Server env validation warnings:', result.error.flatten().fieldErrors);
    // Server env is non-blocking — we log warnings but don't crash
    _serverEnv = result.data as ServerEnv; // partial data is ok
  } else {
    _serverEnv = result.data;
  }
  return _serverEnv;
}

export function getValidationErrors(): z.ZodError | null {
  return _validationErrors;
}

export function isPropertyFinderConfigured(): boolean {
  const env = validateServerEnv();
  return !!(env.PROPERTY_FINDER_API_KEY && env.PROPERTY_FINDER_API_SECRET) ||
    !!(env.PROPERTY_FINDER_CLIENT_ID && env.PROPERTY_FINDER_CLIENT_SECRET);
}

export function isTwilioConfigured(): boolean {
  const env = validateServerEnv();
  return !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN);
}

export function isGoogleSheetsConfigured(): boolean {
  const env = validateServerEnv();
  return !!(env.GOOGLE_SHEETS_CREDENTIALS && env.GOOGLE_SHEETS_SPREADSHEET_ID);
}
