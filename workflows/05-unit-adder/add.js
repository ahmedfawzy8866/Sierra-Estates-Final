/**
 * Workflow 05: Unit Adder
 * Reads new units from Google Sheets, deduplicates, writes to Firestore
 */

const { google } = require('googleapis');
const admin  = require('firebase-admin');
const crypto = require('crypto');
const fs     = require('fs');

const SHEET_ID = process.env.BROKER_INBOX_SHEET_ID;
const SERVICE_ACCOUNT_KEY = JSON.parse(fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(SERVICE_ACCOUNT_KEY),
  projectId:  process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();
const sheets = google.sheets({
  version: 'v4',
  auth: new google.auth.GoogleAuth({
    credentials: SERVICE_ACCOUNT_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  }),
});

function generateSBRCode(compound, bedrooms, furnishing, price) {
  const compoundAbbr = compound.substring(0, 3).toUpperCase();
  const furnishCode  = furnishing === 'furnished' ? 'F' : 'U';
  const priceAbbr    = `${Math.floor(price / 1000)}K`;
  return `${compoundAbbr}-${bedrooms}${furnishCode}-${priceAbbr}`;
}

function computeSyncHash(compound, area, floor, unitNumber) {
  return crypto.createHash('sha256').update(`${compound}|${area}|${floor}|${unitNumber}`).digest('hex');
}

async function getPendingUnits() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "'new_units'!A:L",
  });
  const rows = response.data.values || [];
  return rows.slice(1).filter(row => row[11] === 'PENDING');
}

async function checkDuplicate(syncHash) {
  const snapshot = await db.collection('listings').where('dupeCheckHash', '==', syncHash).limit(1).get();
  return !snapshot.empty;
}

async function addUnitToFirestore(unit, syncHash) {
  const sbrCode = generateSBRCode(unit.compound, unit.bedrooms, unit.furnishing, unit.price);
  const docRef  = await db.collection('listings').add({
    title:           `${unit.bedrooms}BR ${unit.compound}`,
    sbrCode,
    bedrooms:        parseInt(unit.bedrooms) || 0,
    bathrooms:       parseInt(unit.bathrooms) || 0,
    area:            parseInt(unit.area) || 0,
    price:           parseFloat(unit.price) || 0,
    pricePerSqm:     parseFloat(unit.price) / (parseInt(unit.area) || 1),
    compound:        unit.compound,
    finishingType:   unit.finishingType || 'not-finished',
    furnishingStatus:unit.furnishing || 'unfurnished',
    dupeCheckHash:   syncHash,
    status:          'Available',
    source:          'sheets_sync',
    createdAt:       new Date(),
    updatedAt:       new Date(),
  });
  return docRef.id;
}

async function updateUnitStatus(rowIndex, status) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `'new_units'!L${rowIndex + 2}`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [[status]] },
  });
}

async function main() {
  const pendingUnits = await getPendingUnits();
  let added = 0, deduplicated = 0;

  for (let i = 0; i < pendingUnits.length; i++) {
    const row  = pendingUnits[i];
    const unit = { compound: row[0], bedrooms: row[1], bathrooms: row[2], area: row[3], price: row[4], finishingType: row[5], furnishing: row[6], propertyType: row[7] };
    const syncHash  = computeSyncHash(unit.compound, unit.area, row[5], row[1]);
    const isDuplicate = await checkDuplicate(syncHash);
    if (isDuplicate) {
      await updateUnitStatus(i, 'DEDUPLICATED'); deduplicated++;
    } else {
      const docId = await addUnitToFirestore(unit, syncHash);
      await updateUnitStatus(i, docId ? 'ADDED' : 'ERROR');
      if (docId) added++;
    }
  }

  console.log(`Unit adder complete: ${added} added, ${deduplicated} deduplicated`);
  process.exit(0);
}

main();
