/**
 * SIERRA ESTATES — SERVER STARTUP ENV VALIDATION
 * Called once at server init via instrumentation.ts.
 * Logs errors for missing required vars, warns for missing optional ones.
 */

const REQUIRED_VARS: string[] = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'GOOGLE_AI_API_KEY',
  'CRON_SECRET',
  'SE_SECRET_KEY',
  'PF_WEBHOOK_SECRET',
  'SYNC_API_KEY',
];

const FIREBASE_ADMIN_OPTION_A = ['FIREBASE_SERVICE_ACCOUNT_JSON'];
const FIREBASE_ADMIN_OPTION_B = ['FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_PROJECT_ID'];

const OPTIONAL_VARS: string[] = [
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
  'PROPERTY_FINDER_CLIENT_ID',
  'PROPERTY_FINDER_CLIENT_SECRET',
  'ARIZE_SPACE_ID',
  'ARIZE_API_KEY',
  'OPENCLAW_BASE_URL',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_SUPPORT_PHONE',
  'NEXT_PUBLIC_SUPPORT_EMAIL',
  'NEXT_PUBLIC_WHATSAPP_URL',
];

export function validateEnv(): void {
  const missing: string[] = [];
  const warned: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) missing.push(key);
  }

  const hasOptionA = FIREBASE_ADMIN_OPTION_A.every((k) => !!process.env[k]);
  const hasOptionB = FIREBASE_ADMIN_OPTION_B.every((k) => !!process.env[k]);
  if (!hasOptionA && !hasOptionB) {
    missing.push(
      'FIREBASE_SERVICE_ACCOUNT_JSON (Option A) OR ' +
      'FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY + FIREBASE_PROJECT_ID (Option B)'
    );
  }

  for (const key of OPTIONAL_VARS) {
    if (!process.env[key]) warned.push(key);
  }

  if (missing.length > 0) {
    console.error(
      '\n[sierra-estates] ❌ MISSING REQUIRED ENVIRONMENT VARIABLES:\n' +
      missing.map((v) => `  - ${v}`).join('\n') +
      '\n  → Some features will fail. Set these in .env.local or Vercel project settings.\n'
    );
  }

  if (warned.length > 0) {
    console.warn(
      '\n[sierra-estates] ⚠️  Optional env vars not set (some integrations will be disabled):\n' +
      warned.map((v) => `  - ${v}`).join('\n') + '\n'
    );
  }

  if (missing.length === 0) {
    console.log('[sierra-estates] ✅ Environment variables validated successfully.');
  }
}
