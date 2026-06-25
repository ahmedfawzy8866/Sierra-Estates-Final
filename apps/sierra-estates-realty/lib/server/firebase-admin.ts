/**
 * SIERRA ESTATES — FIREBASE ADMIN SDK (Server-Only)
 *
 * Initialization strategies (in priority order):
 * 1. FIREBASE_SERVICE_ACCOUNT_JSON — full service account JSON (or base64)
 * 2. Individual env vars: FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 * 3. Application Default Credentials (Cloud Run / GCE)
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
        return (...args: any[]) => {
          console.warn(
            `[firebase-admin] ${name}.${String(prop)} called but Admin SDK is not initialized.`
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
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (serviceAccountJson) {
      // Strategy 1: Full service account JSON
      console.log('[Firebase] Initializing with FIREBASE_SERVICE_ACCOUNT_JSON');
      let parsedCredential: object;
      try {
        const raw = serviceAccountJson.trim();
        const jsonStr = raw.startsWith('{')
          ? raw
          : Buffer.from(raw, 'base64').toString('utf-8');
        parsedCredential = JSON.parse(jsonStr);
      } catch {
        throw new Error(
          'FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON or base64-encoded JSON'
        );
      }
      admin.initializeApp({
        credential: admin.credential.cert(parsedCredential as admin.ServiceAccount),
        projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else if (projectId && clientEmail && privateKey) {
      // Strategy 2: Individual env vars
      console.log('[Firebase] Initializing with individual env vars');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      // Strategy 3: Application Default Credentials (Cloud Run / GCE)
      console.log('[Firebase] Initializing with Application Default Credentials');
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: projectId || 'sierra-estates',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }
  }

  adminApp = admin.app();
  adminAuth = admin.auth();
  adminDb = admin.firestore();
  adminAppCheck = admin.appCheck();
  adminStorage = admin.storage();
  isAdminInitialized = true;

  console.log('[Firebase] Admin SDK initialized successfully');
} catch (error) {
  console.warn(
    '[firebase-admin] Initialization failed — Admin features limited.\n' +
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
