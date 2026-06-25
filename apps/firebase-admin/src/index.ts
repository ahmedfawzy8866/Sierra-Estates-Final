/**
 * SIERRA ESTATES — FIREBASE ADMIN APP
 *
 * Entry point for Cloud Functions + Express API.
 * This is the admin/bot/scraper side of the two-app architecture.
 *
 * Architecture:
 *   Vercel App (public + light dashboard) ←→ Firestore ←→ Firebase Admin App (this)
 *
 * Hard Rules:
 *   1. Same Firestore DB as Vercel app (never create a second DB)
 *   2. Same Firebase Auth (never create a second auth)
 *   3. Bots/scrapers WRITE to DB. Dashboards only READ.
 *   4. Admin SDK is server-side ONLY. Never expose client-side.
 *   5. Roles via custom claims: admin | agent | employee
 */

import * as admin from 'firebase-admin';

// ─── Firebase Admin SDK Initialization ────────────────────────────────
// Uses the same project as the Vercel app — ONE DB, ONE Auth.

if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (serviceAccountJson) {
    let parsedCredential: object;
    try {
      const raw = serviceAccountJson.trim();
      const jsonStr = raw.startsWith('{')
        ? raw
        : Buffer.from(raw, 'base64').toString('utf-8');
      parsedCredential = JSON.parse(jsonStr);
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON or base64');
    }
    admin.initializeApp({
      credential: admin.credential.cert(parsedCredential as admin.ServiceAccount),
      projectId,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } else if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      projectId,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: projectId || 'sierra-estates',
    });
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
export default admin;
