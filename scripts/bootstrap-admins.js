#!/usr/bin/env node
/**
 * Sierra Estates — Admin Bootstrap Script
 *
 * Seeds the `admins` Firestore collection with initial admin users.
 * This eliminates the need for hardcoded admin emails in firestore.rules.
 *
 * USAGE OPTIONS:
 *
 * Option A — Run locally with a service account key:
 *   export GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json
 *   node scripts/bootstrap-admins.js
 *
 * Option B — Run via Firebase CLI (after firebase login):
 *   firebase login
 *   node scripts/bootstrap-admins.js --use-firebase-cli
 *
 * Option C — Deploy as a one-time Cloud Function:
 *   See the admin-seed function in functions/src/
 *
 * Option D — Manual seeding via Firebase Console:
 *   1. Open Firebase Console → Firestore Database
 *   2. Create collection "admins"
 *   3. Add documents with document ID = admin email:
 *      - Document: A.fawzy8866@gmail.com
 *        Fields: { email, role: "super_admin", name: "Ahmed Fawzy",
 *                  createdAt: timestamp, createdBy: "manual-seed" }
 *      - Document: emeraldestatesegypt@gmail.com
 *        Fields: { email, role: "admin", name: "Emerald Estates",
 *                  createdAt: timestamp, createdBy: "manual-seed" }
 *
 * After seeding, you can optionally remove the hardcoded emails from
 * isBootstrappedAdmin() in firestore.rules.
 */

const ADMIN_EMAILS = [
  { email: 'A.fawzy8866@gmail.com', role: 'super_admin', name: 'Ahmed Fawzy' },
  { email: 'a.fawzy8866@gmail.com', role: 'admin', name: 'Ahmed Fawzy (alt)' },
  { email: 'emeraldestatesegypt@gmail.com', role: 'admin', name: 'Emerald Estates' },
];

const useFirebaseCli = process.argv.includes('--use-firebase-cli');

async function main() {
  console.log('🔧 Sierra Estates — Admin Bootstrap\n');

  let db;

  if (useFirebaseCli) {
    // Use Firebase CLI's built-in auth
    try {
      const { initializeApp } = require('firebase-admin/app');
      const { getFirestore, FieldValue } = require('firebase-admin/firestore');

      // Firebase CLI sets up ADC when logged in
      const app = initializeApp({
        projectId: 'sierra-blu',
      });
      db = getFirestore(app);
      console.log('  📡 Connected via Firebase CLI auth\n');
    } catch (err) {
      console.error('❌ Firebase CLI auth failed. Run `firebase login` first.');
      console.error('   Error:', err.message);
      process.exit(1);
    }
  } else {
    // Use service account key via GOOGLE_APPLICATION_CREDENTIALS
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.error('❌ Missing GOOGLE_APPLICATION_CREDENTIALS env var.');
      console.error('');
      console.error('Choose one of these options:');
      console.error('  1. export GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json');
      console.error('     Then: node scripts/bootstrap-admins.js');
      console.error('');
      console.error('  2. firebase login && node scripts/bootstrap-admins.js --use-firebase-cli');
      console.error('');
      console.error('  3. Seed manually via Firebase Console (see script header)');
      console.error('');
      process.exit(1);
    }

    try {
      const { initializeApp, applicationDefault } = require('firebase-admin/app');
      const { getFirestore, FieldValue } = require('firebase-admin/firestore');

      initializeApp({ credential: applicationDefault() });
      db = getFirestore();
      console.log('  📡 Connected via service account\n');
    } catch (err) {
      console.error('❌ Failed to initialize Firebase Admin SDK:', err.message);
      process.exit(1);
    }
  }

  const FieldValue = require('firebase-admin/firestore').FieldValue;
  const batch = db.batch();

  for (const admin of ADMIN_EMAILS) {
    // Use email as document ID for isRegisteredAdminByEmail() lookup
    const emailRef = db.collection('admins').doc(admin.email);
    batch.set(emailRef, {
      email: admin.email,
      role: admin.role,
      name: admin.name,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: 'bootstrap-script',
    });
    console.log(`  📧 ${admin.email} → role: ${admin.role}`);
  }

  await batch.commit();
  console.log('\n✅ Admin bootstrap complete! All admin emails seeded to the `admins` collection.');
  console.log('   You can now safely remove the hardcoded emails from isBootstrappedAdmin() in firestore.rules.\n');
}

main().catch((err) => {
  console.error('❌ Bootstrap failed:', err.message);
  process.exit(1);
});
