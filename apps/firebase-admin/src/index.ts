/**
 * SIERRA ESTATES — FIREBASE ADMIN APP (Cloud Functions)
 *
 * Entry point for Cloud Functions + Express API.
 * This is the admin/bot/scraper side of the two-app architecture.
 *
 * IMPORTANT: No service account key needed!
 * Cloud Functions automatically get Application Default Credentials (ADC).
 * Org policies that block key creation are fine — ADC is the recommended approach.
 *
 * Architecture:
 *   Vercel App (Client SDK only) ←→ Firestore ←→ Cloud Functions (Admin SDK via ADC)
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
// Cloud Functions get ADC automatically — no service account key needed.
// This is the Google-recommended approach and works with org policies.

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || 'sierra-blu',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'sierra-blu.firebasestorage.app',
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
export default admin;
