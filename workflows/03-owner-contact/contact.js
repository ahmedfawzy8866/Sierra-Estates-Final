/**
 * Workflow 03: Owner Contact
 * Sends WhatsApp messages to property owners
 */

const { google } = require('googleapis');
const axios = require('axios');
const fs    = require('fs');

const SHEET_ID   = process.env.BROKER_INBOX_SHEET_ID;
const WA_API_URL = process.env.WHATSAPP_API_URL;
const WA_TOKEN = process.env.WHATSAPP_API_TOKEN;
let SERVICE_ACCOUNT_KEY;
try {
  SERVICE_ACCOUNT_KEY = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
} catch (e) {
  SERVICE_ACCOUNT_KEY = JSON.parse(fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'utf8'));
}

const sheets = google.sheets({
  version: 'v4',
  auth: new google.auth.GoogleAuth({
    credentials: SERVICE_ACCOUNT_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  }),
});

const CONTACT_TEMPLATE = `السلام عليكم

نحن فريق Sierra Estates — متخصصون في تسويق العقارات الفاخرة بالقاهرة الجديدة.

هل لديك اهتمام بالتعاون معنا لتسويق الوحدة?

السعر: ___PRICE___ جنيه
الموقع: ___LOCATION___`;

async function getOwnerLeads() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "'owner_leads'!A:H",
  });
  const rows = response.data.values || [];
  return rows.slice(1).filter(row => row[7] === 'PENDING');
}

async function sendWhatsAppMessage(phoneNumber, text) {
  try {
    const response = await axios.post(`${WA_API_URL}/send`, { phone: phoneNumber, message: text }, {
      headers: { 'Authorization': `Bearer ${WA_TOKEN}`, 'Content-Type': 'application/json' },
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

async function updateLeadStatus(rowIndex, status) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `'owner_leads'!H${rowIndex + 2}`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [[status]] },
  });
}

async function main() {
  const leads = await getOwnerLeads();
  for (let i = 0; i < leads.length; i++) {
    const lead  = leads[i];
    const phone = lead[5];
    if (!phone || phone === 'No contact') { await updateLeadStatus(i, 'SKIPPED'); continue; }
    const message = CONTACT_TEMPLATE.replace('___PRICE___', lead[3]).replace('___LOCATION___', lead[4]);
    const sent    = await sendWhatsAppMessage(phone, message);
    await updateLeadStatus(i, sent ? 'CONTACTED' : 'ERROR');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  process.exit(0);
}

main();
