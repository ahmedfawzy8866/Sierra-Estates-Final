import express from 'express';
import pino from 'pino';
import { OpenClawAgent } from '@sierra-estates/agents';

const router = express.Router();
const logger = pino({ name: 'whatsapp-webhook' });

// Initialize OpenClaw Agent
const openClaw = new OpenClawAgent({
  airtableApiKey: process.env.AIRTABLE_API_KEY || '',
  airtableBaseId: process.env.AIRTABLE_BASE_ID || '',
  airtableTableName: process.env.AIRTABLE_TABLE_NAME || 'Units',
  aiApiKey: process.env.AI_API_KEY || ''
});

/**
 * Webhook endpoint to receive messages from WhatsApp (e.g., Twilio, Meta API)
 */
router.post('/webhook', async (req, res) => {
  logger.info({ body: req.body, msg: 'Incoming WhatsApp Webhook' });

  try {
    // 1. Extract message details from payload. 
    // Format depends on your provider (Twilio vs Meta Cloud API)
    // Assuming a generic format for this example:
    const messageText = req.body.Body || req.body.message || req.body.text?.body || req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;
    const sender = req.body.From || req.body.sender || req.body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id;

    if (!messageText) {
      logger.warn('No text found in incoming message payload');
      res.status(200).send('No text found'); // always return 200 to WhatsApp
      return;
    }

    // 2. Pass to OpenClaw Agent
    const reply = await openClaw.handleWhatsAppMessage(messageText, sender);

    // 3. Send reply back to WhatsApp (Using Twilio TwiML as an example)
    // If using Meta API, you would make a POST request to their Messages API here.
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(`
      <Response>
        <Message>${reply}</Message>
      </Response>
    `);
  } catch (error) {
    logger.error({ err: error, msg: 'Error processing webhook' });
    res.status(500).send('Internal Server Error');
  }
});

// GET endpoint for Meta API webhook verification
router.get('/webhook', (req, res) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      logger.info('Webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.status(400).send('Missing parameters');
  }
});

export default router;
