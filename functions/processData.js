const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const { normalizeProperty } = require('./transform');

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();

/**
 * processDataForApp — Firestore trigger on rawScrapeData.
 * Normalizes and deduplicates records, writing to processedData.
 */
exports.processDataForApp = functions.firestore
  .document('rawScrapeData/{docId}')
  .onCreate(async (snap, _context) => {
    const raw = snap.data();

    // Skip if not extraction-ready
    if (raw.status !== 'extracted') return null;

    const normalized = normalizeProperty(raw.parsedData || raw);

    // Deduplication: check by syncHash
    if (normalized.syncHash) {
      const existing = await db
        .collection('processedData')
        .where('syncHash', '==', normalized.syncHash)
        .limit(1)
        .get();

      if (!existing.empty) {
        await snap.ref.update({ status: 'duplicate_detected' });
        return null;
      }
    }

    await db.collection('processedData').add({
      ...normalized,
      rawId:       snap.id,
      processedAt: new Date().toISOString(),
    });

    await snap.ref.update({ status: 'processed' });
    return null;
  });
