const functions = require('firebase-functions');
const admin     = require('firebase-admin');

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();

/**
 * collectData — HTTP endpoint to store raw scrape data.
 * Called by the WhatsApp scraper or external agents.
 */
exports.collectData = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const secretKey = req.headers['x-se-secret-key'];
  if (secretKey !== process.env.X_SE_SECRET_KEY && process.env.X_SE_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data = req.body;
  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Empty payload' });
  }

  try {
    const docRef = await db.collection('rawScrapeData').add({
      ...data,
      source:    data.source    || 'unknown',
      status:    data.status    || 'pending_review',
      createdAt: data.createdAt || new Date().toISOString(),
    });

    res.status(200).json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('[collectData] Firestore write failed:', err);
    res.status(500).json({ error: 'Failed to store data' });
  }
});
