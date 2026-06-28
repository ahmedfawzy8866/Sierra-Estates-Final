import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import path from 'path';
import { router } from './router';

// Load environment variables from the root .env and .env.local files
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

// Verify that the Gemini API Key is present
const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  console.error('\n❌ ERROR: GOOGLE_AI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY is not defined in your environment.');
  console.error('Please configure it in H:\\Sierra-Estates-Final\\.env.local and try again.');
  process.exit(1);
}

// Initialize the WhatsApp Web Client
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'whatsapp-bot-client' // Unique session namespace
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// QR Code Generation
client.on('qr', (qr) => {
  console.log('\n============================================================');
  console.log('🤖 SCAN THIS QR CODE WITH YOUR WHATSAPP APP TO LOG IN THE BOT');
  console.log('============================================================\n');
  qrcode.generate(qr, { small: true });
});

// Client Ready State
client.on('ready', () => {
  console.log('\n============================================================');
  console.log('✅ Sierra Estates Multi-Agent Chat Bot is ONLINE & READY!');
  console.log('============================================================\n');
  console.log('Text the bot directly from any WhatsApp number to interact.');
  console.log('Currently running in direct message mode (will ignore group chats to prevent spam).');
  console.log('------------------------------------------------------------\n');
});

// Incoming Message Handler
client.on('message', async (msg) => {
  try {
    const chat = await msg.getChat();
    
    // Ignore group chats to prevent spamming WhatsApp groups
    if (chat.isGroup) {
      return;
    }

    const phone = msg.from.replace('@c.us', '');
    const clientName = chat.name || phone;

    console.log(`\n📥 [Message Received] From: ${clientName} (${phone})`);
    console.log(`   Content: "${msg.body}"`);

    // Prepare incoming message payload for the router
    const incomingMsg = {
      from: msg.from,
      body: msg.body,
      groupName: 'Direct Message',
      timestamp: msg.timestamp,
      messageId: msg.id.id
    };

    console.log(`🤖 [Router] Dispatching message to multi-agent pipeline...`);
    
    // Run the pipeline (Liela -> Sierra -> OpenClaw -> Hermes)
    const reply = await router.handle(incomingMsg);

    console.log(`📤 [Response Sent] To: ${clientName}`);
    console.log(`   Content: "${reply}"`);

    // Reply to the user on WhatsApp
    await msg.reply(reply);

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`❌ [Error] Failed to process message:`, errorMsg);
    
    try {
      await msg.reply('عذراً، حدث خطأ مؤقت في خوادمنا. سيتواصل معك أحد ممثلينا قريباً.');
    } catch (replyErr) {
      console.error('❌ [Error] Failed to send fallback message:', replyErr);
    }
  }
});

// Initialize connection
console.log('🤖 Starting WhatsApp Bot...');
client.initialize();
