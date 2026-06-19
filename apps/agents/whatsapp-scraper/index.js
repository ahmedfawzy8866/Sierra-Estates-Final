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

const API_URL = process.env.API_URL || 'http://localhost:3000/api/webhooks/whatsapp';

const client = new Client({ authStrategy: new LocalAuth() });

client.on('qr', (qr) => {
  console.log('\n--- SCAN QR CODE WITH WHATSAPP ---');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ Sierra Estates WhatsApp Intelligence Bot: Online & Syncing.');
});

client.on('message', async msg => {
  const chat      = await msg.getChat();
  const groupName = chat.isGroup ? chat.name : 'Direct Message';

  try {
    await axios.post(API_URL, {
      from:      msg.from,
      Body:      msg.body,
      groupName,
      timestamp: msg.timestamp,
    });
  } catch (error) {
    console.error('❌ Failed to forward message:', error.message);
  }

  if (msg.body === '!status') {
    msg.reply('🤖 Sierra Estates Intelligence Bot: Online & Syncing.');
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
