const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

/**
 * DATA COLLECTION WORKFLOW
 * HTTP endpoint used exclusively by scrapers.
 * Dumps raw data into `rawScrapeData` — the frontend NEVER reads this.
 */
exports.collectData = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') return res.status(400).send('Invalid payload');
    const docRef = await db.collection('rawScrapeData').add({
      ...payload,
      collectedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'raw_unprocessed',
    });
    console.log(`Raw data ingested: ${docRef.id}`);
    return res.status(200).json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Data collection error:', error);
    return res.status(500).send('Internal Server Error');
  }
});
