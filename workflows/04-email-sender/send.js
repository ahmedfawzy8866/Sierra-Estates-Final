/**
 * Workflow 04: Email Sender
 * Sends bulk emails to investor stakeholders via SendGrid
 */

const { google } = require('googleapis');
const sgMail = require('@sendgrid/mail');
const fs     = require('fs');

const SHEET_ID = process.env.BROKER_INBOX_SHEET_ID;
const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@sierra-estates.com';
let SERVICE_ACCOUNT_KEY;
try {
  SERVICE_ACCOUNT_KEY = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
} catch (e) {
  SERVICE_ACCOUNT_KEY = JSON.parse(fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'utf8'));
}

sgMail.setApiKey(SENDGRID_KEY);

const sheets = google.sheets({
  version: 'v4',
  auth: new google.auth.GoogleAuth({
    credentials: SERVICE_ACCOUNT_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  }),
});

const EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to Sierra Estates – Your Exclusive Real Estate Gateway',
    html: `
      <h2>Welcome to Sierra Estates</h2>
      <p>We're thrilled to have you on board!</p>
      <p>Our curated portfolio of luxury properties in New Cairo awaits your exploration.</p>
      <p><a href="https://sierra-estates.vercel.app/landing">View Exclusive Listings</a></p>
    `,
  },
  property_alert: {
    subject: 'New Property Match: {{property_title}}',
    html: `
      <h2>New Property Match for You</h2>
      <p><strong>{{property_title}}</strong></p>
      <p>Price: {{property_price}} EGP</p>
      <p>Location: {{property_location}}</p>
      <p><a href="https://sierra-estates.vercel.app/listings/{{property_id}}">View Details</a></p>
    `,
  },
  viewing_reminder: {
    subject: 'Your Viewing Appointment Reminder',
    html: `
      <h2>Viewing Appointment Reminder</h2>
      <p>Your scheduled viewing is coming up on {{viewing_date}} at {{viewing_time}}.</p>
      <p><a href="https://sierra-estates.vercel.app/viewing-requests">Manage Appointment</a></p>
    `,
  },
};

async function getCampaignRecipients() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "'email_campaigns'!A:E",
  });
  const rows = response.data.values || [];
  return rows.slice(1).filter(row => row[3] === 'PENDING');
}

async function sendEmail(to, templateKey, variables = {}) {
  const template = EMAIL_TEMPLATES[templateKey];
  if (!template) return false;
  let html    = template.html;
  let subject = template.subject;
  Object.entries(variables).forEach(([key, value]) => {
    html    = html.replace(`{{${key}}}`, value);
    subject = subject.replace(`{{${key}}}`, value);
  });
  try {
    await sgMail.send({ to, from: FROM_EMAIL, subject, html });
    return true;
  } catch {
    return false;
  }
}

async function updateCampaignStatus(rowIndex, status) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `'email_campaigns'!D${rowIndex + 2}`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [[status]] },
  });
}

async function main() {
  const campaigns = await getCampaignRecipients();
  for (let i = 0; i < campaigns.length; i++) {
    const campaign   = campaigns[i];
    const variables  = campaign[2] ? JSON.parse(campaign[2]) : {};
    const sent       = await sendEmail(campaign[0], campaign[1], variables);
    await updateCampaignStatus(i, sent ? 'SENT' : 'ERROR');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  process.exit(0);
}

main();
