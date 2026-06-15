/**
 * Sierra Estates Web — Firebase Admin SDK (Server-only)
 *
 * IMPORTANT: This file must ONLY be imported in server-side components or API routes.
 * Lazy-loads firebase-admin to prevent Metadata service errors during Next.js build.
 */
// Note: only import this from Server Components or Route Handlers
import 'server-only';

// ---------------------------------------------------------------------------
// Graceful no-op proxy — used when Admin SDK is not yet initialised
// (build time, test env, or missing credentials). Prevents import-time errors.
// ---------------------------------------------------------------------------
const makeUnavailable = (name: string) =>
  new Proxy(
    {} as Record<string, unknown>,
    {
      get(_target, prop) {
        if (prop === 'then') return undefined; // not a Promise
        return (..._args: unknown[]) => { // eslint-disable-line @typescript-eslint/no-unused-vars
          console.warn(`⚠️ [firebase-admin] ${name}.${String(prop)} called but not initialized.`);
          return Promise.resolve(null);
        };
      },
    }
  );

/* eslint-disable @typescript-eslint/no-explicit-any */
let adminAuth: any = makeUnavailable('Auth');
let adminDb: any   = makeUnavailable('Firestore');
let isInitialized  = false;
let initPromise: Promise<void> | null = null;

async function loadAdmin() {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const admin = await import('firebase-admin');
      if (!admin.apps?.length) {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        const projectId      = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const clientEmail    = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey     = process.env.FIREBASE_PRIVATE_KEY?.replace?.(/\\n/g, '\n');

        if (serviceAccount) {
          admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(serviceAccount) as object),
            projectId,
          });
        } else if (projectId && clientEmail && privateKey) {
          admin.initializeApp({
            credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
            projectId,
          });
        } else {
          console.warn('[firebase-admin] No credentials — running in limited mode.');
          return;
        }
      }

      if (admin.apps?.length) {
        adminAuth = admin.auth();
        adminDb   = admin.firestore();
        isInitialized = true;
      }
    } catch (err) {
      console.warn('[firebase-admin] Init failed:', err instanceof Error ? err.message : err);
    }
  })();

  return initPromise;
}

// Kick off initialisation eagerly but never block module load
loadAdmin().catch(() => {});

export { adminAuth, adminDb, isInitialized, loadAdmin };
