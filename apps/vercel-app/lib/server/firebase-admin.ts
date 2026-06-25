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
import * as admin from 'firebase-admin';

// Graceful fallback proxy — prevents hard crashes when Admin SDK is unavailable
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeUnavailable = (name: string): any =>
  new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'then') return undefined;
        return (..._args: any[]) => {
          console.warn(
            `[firebase-admin] ${name}.${String(prop)} called but Admin SDK is not available in Vercel. Use Client SDK instead, or call the Firebase Admin API.`
          );
          const chainable = {
            get: () => Promise.resolve({ size: 0, empty: true, forEach: () => {}, exists: false, data: () => ({}) }),
            set: () => Promise.resolve(),
            update: () => Promise.resolve(),
            add: () => Promise.resolve({ id: 'mock-id' }),
            limit: () => chainable,
            orderBy: () => chainable,
            where: () => chainable,
            doc: () => chainable,
            collection: () => chainable,
          };
          return chainable;
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
    console.log('[Firebase Admin] Initializing with Application Default Credentials');
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

  console.log('[Firebase Admin] Initialized successfully via ADC');
} catch (error) {
  console.warn(
    '[firebase-admin] Initialization failed — this is expected in Vercel without ADC.\n' +
    'The Vercel app should use the Client SDK (lib/firebase.ts) for all operations.\n' +
    'Admin operations are handled by the Firebase Admin App (Cloud Functions).\n' +
    'Reason:',
    error instanceof Error ? error.message : 'Unknown error'
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
