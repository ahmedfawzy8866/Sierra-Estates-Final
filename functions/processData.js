const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const { normalizeProperty } = require('./transform');

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

/**
 * DATA PROCESSING WORKFLOW
 * Listens for new docs in rawScrapeData.
 * Cleans/normalizes and writes to processedData (readable by the app).
 */
exports.processDataForApp = functions.firestore
  .document('rawScrapeData/{docId}')
  .onCreate(async (snap, context) => {
    const rawData = snap.data();
    const docId   = context.params.docId;
    console.log(`Processing raw document ${docId}...`);
    try {
      const processedData = {
        ...normalizeProperty(rawData),
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await db.collection('processedData').doc(docId).set(processedData);
      await snap.ref.update({ status: 'processed_success' });
      console.log(`Successfully processed ${docId}`);
    } catch (error) {
      console.error(`Error processing ${docId}:`, error);
      await snap.ref.update({ status: 'processed_error', error: error.message });
    }
  });
