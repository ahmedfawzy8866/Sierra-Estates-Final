/**
 * SIERRA ESTATES — FIREBASE ADMIN SDK (Vercel App)
 *
 * This Vercel app uses the Client SDK for all Firestore operations.
 * The Admin SDK is ONLY needed for:
 *   - Verifying auth tokens server-side (via applicationDefault())
 *   - Server-side Firestore reads that bypass rules
 *
 * IMPORTANT: Service account keys are NOT used here (org policy blocks them).
 * Cloud Functions get Admin SDK auto-magically via ADC.
 * This Vercel app falls back to Application Default Credentials.
 *
 * NEVER import this file from client-side code.
 */
import 'server-only';
import * as admin from 'firebase-admin';
import { createLogger } from './logger';

const log = createLogger('firebase-admin');

// Fallback proxy that throws explicit errors when Admin SDK is unavailable.
// This prevents silent data loss where mock data would have been returned
// and code downstream would have treated it as real data.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeUnavailable = (name: string): any =>
  new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'then') return undefined;
        if (prop === Symbol.toPrimitive) return undefined;
        return (..._args: any[]) => {
          const errMsg = `[firebase-admin] ${name}.${String(prop)}() called but Admin SDK is not initialized. ` +
            `This is expected on Vercel without ADC. Use Client SDK or call Firebase Admin Cloud Functions instead.`;
          log.error({ service: name, method: String(prop) }, 'Admin SDK called but not initialized');
          throw new Error(errMsg);
        };
      },
    }
  );

let adminApp: admin.app.App = makeUnavailable('App');
let adminAuth: admin.auth.Auth = makeUnavailable('Auth');
let adminDb: admin.firestore.Firestore = makeUnavailable('Firestore');
let adminAppCheck: admin.appCheck.AppCheck = makeUnavailable('AppCheck');
let adminStorage: admin.storage.Storage = makeUnavailable('Storage');
let isAdminInitialized = false;

try {
  if (!admin.apps.length) {
    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    // Strategy: Application Default Credentials
    // - On Cloud Functions: works automatically (no key needed)
    // - On Vercel: uses ADC if available, otherwise gracefully degrades
    // - Service account keys are blocked by org policy — we don't use them
    log.info('Initializing with Application Default Credentials');
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: projectId || 'sierra-blu',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }

  adminApp = admin.app();
  adminAuth = admin.auth();
  adminDb = admin.firestore();
  adminAppCheck = admin.appCheck();
  adminStorage = admin.storage();
  isAdminInitialized = true;

  log.info('Initialized successfully via ADC');
} catch (error) {
  log.warn(
    { err: error instanceof Error ? error.message : 'Unknown error' },
    'Initialization failed — expected on Vercel without ADC. Use Client SDK or Cloud Functions.'
  );
}

export {
  adminApp,
  adminAuth,
  adminDb,
  adminAppCheck,
  adminStorage,
  isAdminInitialized,
};
