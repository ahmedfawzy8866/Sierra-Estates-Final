const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

/**
 * 2️⃣ DATA PROCESSING WORKFLOW (Sierra AI integration)
 * Listens for new documents in the `rawScrapeData` collection.
 * Cleans/formats the data and moves it to `processedData` (which the app reads).
 */
exports.processDataForApp = functions.firestore
    .document('rawScrapeData/{docId}')
    .onCreate(async (snap, context) => {
        const rawData = snap.data();
        const docId = context.params.docId;

        console.log(`Sierra AI: Processing raw document ${docId}...`);

        try {
            // --- CLEANING & NORMALIZATION LOGIC ---
            // Standardizing names, calculating values, mapping to Sierra AI format
            const processedData = {
                title: rawData.title || 'Untitled Property',
                price: parseFloat(rawData.price) || 0,
                location: rawData.location || 'Unknown',
                source: rawData.source || 'Scraper Bot',
                processedAt: admin.firestore.FieldValue.serverTimestamp(),
                isAvailable: true,
                brand: 'Sierra AI'
            };

            // Write to the collection that the frontend app actually uses
            await db.collection('processedData').doc(docId).set(processedData);

            // Update the raw document to mark it as processed
            await snap.ref.update({ status: 'processed_success' });

            console.log(`Sierra AI: Successfully processed and moved ${docId} to processedData.`);

        } catch (error) {
            console.error(`Sierra AI: Error processing document ${docId}:`, error);
            // Mark as failed in the raw collection
            await snap.ref.update({ status: 'processed_error', error: error.message });
        }
    });
