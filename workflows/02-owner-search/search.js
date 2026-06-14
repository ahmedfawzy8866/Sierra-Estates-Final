/**
 * Workflow 02: Owner Search
 * Searches Property Finder for direct-owner properties
 * Writes to Google Sheets "owner_leads" tab
 */

const { google } = require('googleapis');
const fs = require('fs');

const PF_API_BASE = process.env.PROPERTY_FINDER_API_BASE || 'https://api.propertyfinder.com.eg/v3';
const PF_TOKEN   = process.env.PROPERTY_FINDER_JWT_TOKEN;
const SHEET_ID   = process.env.BROKER_INBOX_SHEET_ID;
const SERVICE_ACCOUNT_KEY = JSON.parse(fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'utf8'));

const sheets = google.sheets({
  version: 'v4',
  auth: new google.auth.GoogleAuth({
    credentials: SERVICE_ACCOUNT_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  }),
});

async function appendToSheet(tabName, values) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `'${tabName}'!A:H`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [values] },
  });
}

async function searchPropertyFinder() {
  try {
    const response = await fetch(`${PF_API_BASE}/properties?location_id=cairo-new-cairo&purpose=sale&owner_only=true&limit=50`, {
      headers: { 'Authorization': `Bearer ${PF_TOKEN}`, 'Content-Type': 'application/json' },
    });

    if (!response.ok) { console.error(`PF API error: ${response.status}`); return; }

    const data = await response.json();
    for (const unit of data.data || []) {
      await appendToSheet('owner_leads', [
        new Date().toISOString(), 'property_finder', unit.title,
        unit.price, unit.location?.name || '',
        `${unit.beds || 0} BR, ${unit.baths || 0} BA, ${unit.area || '?'} sqm`,
        unit.owner?.phone || 'No contact', unit.url || '',
      ]);
    }
  } catch (err) {
    console.error('Property Finder search failed:', err.message);
  }
}

async function main() {
  console.log('Starting owner property search...');
  await searchPropertyFinder();
  console.log('Owner search complete');
  process.exit(0);
}

main();
