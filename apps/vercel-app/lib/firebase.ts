/**
 * SIERRA ESTATES — FIREBASE CLIENT SDK
 * Public configuration — safe for browser (NEXT_PUBLIC_* vars).
 * Admin SDK is in lib/server/firebase-admin.ts (server-only).
 */
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate: check if config has real values (not empty strings)
const hasValidConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

if (!hasValidConfig && typeof window !== 'undefined') {
  console.warn(
    '[firebase] Firebase client not configured — set NEXT_PUBLIC_FIREBASE_* env vars.'
  );
}

// Initialize Firebase only once (hot-reload safe)
const app: FirebaseApp = !getApps().length
  ? initializeApp(hasValidConfig ? firebaseConfig : {
      apiKey: 'dev-placeholder',
      authDomain: 'dev.firebaseapp.com',
      projectId: 'dev-project',
      storageBucket: 'dev.appspot.com',
      messagingSenderId: '000000000000',
      appId: '1:000000000000:web:dev',
    })
  : getApps()[0];

export const auth: Auth = getAuth(app);

/** Firestore — only available when real config is provided */
export const db: Firestore = hasValidConfig
  ? getFirestore(app)
  : new Proxy({} as Firestore, {
      get(_, prop) {
        throw new Error(
          `Firestore not available — configure NEXT_PUBLIC_FIREBASE_* env vars.`
        );
      },
    });

/** Storage — only available when real config is provided */
export const storage: FirebaseStorage = hasValidConfig
  ? getStorage(app)
  : new Proxy({} as FirebaseStorage, {
      get(_, prop) {
        throw new Error(
          `Storage not available — configure NEXT_PUBLIC_FIREBASE_* env vars.`
        );
      },
    });

export const isFirebaseClientConfigured = hasValidConfig;
export default app;
