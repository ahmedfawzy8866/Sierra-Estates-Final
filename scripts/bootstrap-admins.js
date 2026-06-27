#!/usr/bin/env node
/**
 * Sierra Estates — Admin Bootstrap Script
 *
 * Seeds the `admins` Firestore collection with initial admin users.
 * This eliminates the need for hardcoded admin emails in firestore.rules.
 *
 * Usage:
 *   node scripts/bootstrap-admins.js
 *
 * Required env vars:
 *   GOOGLE_APPLICATION_CREDENTIALS — path to service account JSON
 *
 * After running this script, you can optionally remove the hardcoded
 * emails from isBootstrappedAdmin() in firestore.rules.
 */

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const ADMIN_EMAILS = [
  { email: 'A.fawzy8866@gmail.com', role: 'super_admin', name: 'Ahmed Fawzy' },
  { email: 'a.fawzy8866@gmail.com', role: 'admin', name: 'Ahmed Fawzy (alt)' },
  { email: 'emeraldestatesegypt@gmail.com', role: 'admin', name: 'Emerald Estates' },
];

async function main() {
  console.log('🔧 Sierra Estates — Admin Bootstrap\n');

  try {
    initializeApp({ credential: applicationDefault() });
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin SDK.');
    console.error('   Make sure GOOGLE_APPLICATION_CREDENTIALS is set.');
    console.error('   Example: export GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json\n');
    process.exit(1);
  }

  const db = getFirestore();
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
