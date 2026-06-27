/**
 * Admin Seed — One-time Cloud Function to bootstrap the `admins` Firestore collection.
 *
 * Deploy and invoke once to seed admin emails, then delete the function.
 *
 * Deploy:
 *   firebase deploy --only functions:adminSeed
 *
 * Invoke:
 *   curl -X POST "https://europe-west1-sierra-blu.cloudfunctions.net/adminSeed" \
 *     -H "Authorization: Bearer $(gcloud auth print-identity-token)"
 *
 * After seeding, you can remove the hardcoded emails from isBootstrappedAdmin()
 * in firestore.rules.
 */

import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const ADMIN_EMAILS = [
  { email: 'A.fawzy8866@gmail.com', role: 'super_admin', name: 'Ahmed Fawzy' },
  { email: 'a.fawzy8866@gmail.com', role: 'admin', name: 'Ahmed Fawzy (alt)' },
  { email: 'emeraldestatesegypt@gmail.com', role: 'admin', name: 'Emerald Estates' },
];

export const adminSeed = onRequest(
  { region: 'europe-west1' },
  async (req, res) => {
    // Only allow POST method
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed. Use POST.' });
      return;
    }

    // Verify the caller is authenticated (via Firebase ID token or App Check)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: Missing Bearer token' });
      return;
    }

    try {
      // Verify the ID token
      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // Check if the caller is a bootstrapped admin
      const callerEmail = decodedToken.email;
      const isBootstrapAdmin = ADMIN_EMAILS.some(a => a.email === callerEmail);
      if (!isBootstrapAdmin) {
        res.status(403).json({ error: 'Forbidden: Caller is not a bootstrapped admin' });
        return;
      }

      // Seed the admins collection
      const batch = db.batch();
      for (const adm of ADMIN_EMAILS) {
        const ref = db.collection('admins').doc(adm.email);
        batch.set(ref, {
          email: adm.email,
          role: adm.role,
          name: adm.name,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: 'admin-seed-function',
          seededBy: callerEmail,
        });
      }

      await batch.commit();

      res.json({
        success: true,
        message: `Seeded ${ADMIN_EMAILS.length} admin entries`,
        admins: ADMIN_EMAILS.map(a => a.email),
      });
    } catch (error) {
      console.error('[adminSeed] Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);
