/**
 * WhatsApp Scraper Bot
 * Monitors WhatsApp broker groups for property listings
 * Forwards messages to the Sierra Estates backend API
 *
 * Usage: node index.js
 * Env vars:
 *   - SE_API_URL: Backend API URL (default: http://localhost:3000)
 *   - X_SE_SECRET_KEY: Service auth key
 */

require('dotenv').config();

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios  = require('axios');

const API_URL   = process.env.SE_API_URL      || 'http://localhost:3000';
const SECRET    = process.env.X_SE_SECRET_KEY || '';
const HEARTBEAT = parseInt(process.env.HEARTBEAT_INTERVAL_MS || '60000');

// Groups to monitor (Arabic group names from New Cairo broker circles)
const WATCHED_GROUPS = [
  'مجموعة وسطاء التجمع',
  'عقارات القاهرة الجديدة',
  'وسطاء شرق القاهرة',
  'وسطاء التجمع والحي',
];

const client = new Client({ authStrategy: new LocalAuth() });

client.on('qr', qr => {
  console.log('[WhatsApp Scraper] Scan this QR code:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('[WhatsApp Scraper] Ready. Monitoring groups:', WATCHED_GROUPS);
  startHeartbeat();
});

client.on('auth_failure', msg => {
  console.error('[WhatsApp Scraper] Auth failed:', msg);
  process.exit(1);
});

client.on('message', async msg => {
  const groupName = msg._data?.notifyName || msg.from || '';
  const isWatched = WATCHED_GROUPS.some(g => msg.from.includes(g) || groupName.includes(g));

  if (!isWatched) return;

  try {
    await axios.post(
      `${API_URL}/api/whatsapp/webhook`,
      {
        message:     msg.body,
        groupName:   msg.from,
        senderPhone: msg.author || msg.from,
        timestamp:   new Date().toISOString(),
      },
      {
        headers: {
          'x-se-secret-key': SECRET,
          'Content-Type':    'application/json',
        },
        timeout: 10000,
      }
    );
  } catch (err) {
    console.error('[WhatsApp Scraper] Forward failed:', err.message);
  }
});

function startHeartbeat() {
  setInterval(async () => {
    try {
      await axios.post(
        `${API_URL}/api/whatsapp/heartbeat`,
        { status: 'alive', timestamp: new Date().toISOString() },
        { headers: { 'x-se-secret-key': SECRET }, timeout: 5000 }
      );
    } catch {
      // Heartbeat failures are non-critical
    }
  }, HEARTBEAT);
}

client.initialize();
