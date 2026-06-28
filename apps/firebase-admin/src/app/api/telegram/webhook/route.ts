import { NextResponse } from 'next/server';
import { adminDb, isAdminInitialized } from '@/lib/server/firebase-admin';

/**
 * POST /api/telegram/webhook
 *
 * Handles incoming Telegram bot updates. Verifies the request is genuinely
 * from Telegram using the X-Telegram-Bot-Api-Secret-Token header before
 * processing any commands.
 */
export async function POST(req: Request) {
  // ── Webhook signature verification ─────────────────────────────────────
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (webhookSecret) {
    const providedSecret = req.headers.get('x-telegram-bot-api-secret-token');
    if (!providedSecret || providedSecret !== webhookSecret) {
      console.warn('[Telegram Webhook] Rejected: invalid or missing secret token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else {
    // In development, log a warning but allow through
    if (process.env.NODE_ENV === 'production') {
      console.error('[Telegram Webhook] TELEGRAM_WEBHOOK_SECRET not set in production — rejecting all requests');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }
    console.warn('[Telegram Webhook] No TELEGRAM_WEBHOOK_SECRET set — skipping verification (dev mode)');
  }

  try {
    const body = await req.json();
    const { message } = body;

    if (!message || !message.text) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text.toLowerCase();

    const token = process.env.TELEGRAM_BOT_TOKEN;

    const sendMessage = async (msg: string) => {
      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: msg,
            parse_mode: 'HTML'
          }),
        });
      } catch (err) {
        console.error("Failed to send Telegram message:", err instanceof Error ? err.message : 'Unknown');
      }
    };

    // Sanitize user input for safe inclusion in Telegram HTML
    const sanitize = (str: string): string =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const isMockMode = !isAdminInitialized;

    if (isMockMode && text === '/diag') {
      // Allow diagnostics even in mock mode
    } else if (isMockMode && (text === '/stats' || text === '/leads' || text === '/listings')) {
      await sendMessage("💡 <b>System Notice:</b> Operating in <b>MOCK MODE</b> (Firebase Admin not initialized). Showing high-fidelity demonstration data.");
    }

    if (text === '/start') {
      await sendMessage(`
<b>Welcome to Sierra Estates Realty Bot</b>

Your Chat ID is: <code>${chatId}</code>
Please add this to your <code>.env.local</code> as <code>TELEGRAM_CHAT_ID</code> to enable operational notifications.

Commands:
/stats - View executive performance
/leads - View latest 5 leads
/listings - View market inventory
/diag - System diagnostics
/ag [order] - Give orders to Antigravity Intelligence
      `);
    } else if (text === '/diag') {
      await sendMessage(`
<b>🛠 SYSTEM DIAGNOSTICS</b>
<b>Firebase Ready:</b> ${isAdminInitialized ? '✅' : '❌'}
<b>Bot Token:</b> ${token ? '✅' : '❌'}
<b>Collection Units:</b> <code>listings</code>
<b>Collection Leads:</b> <code>leads</code>
<b>Timestamp:</b> ${new Date().toISOString()}
      `);
    } else if (text === '/stats') {
      if (isMockMode) {
        await sendMessage(`
<b>📊 Sierra Estates - Portfolio Stats (MOCK)</b>
<b>Total Inventory:</b> 124 units
<b>Total Leads:</b> 89 profiles
<b>Operational Status:</b> OPTIMUM
        `);
        return NextResponse.json({ ok: true });
      }
      try {
        const snap = await adminDb.collection('listings').limit(100).get();
        const activeCount = snap.size;

        const leadsSnap = await adminDb.collection('leads').get();
        const leadCount = leadsSnap.size;

        await sendMessage(`
<b>📊 Sierra Estates - Portfolio Stats</b>
<b>Total Inventory:</b> ${activeCount} units
<b>Total Leads:</b> ${leadCount} profiles
<b>Operational Status:</b> OPTIMUM
        `);
      } catch (err: unknown) {
        await sendMessage('❌ <b>Database Error:</b> Failed to fetch stats. Check server logs.');
        console.error('[Telegram /stats] Error:', err instanceof Error ? err.message : err);
      }
    } else if (text === '/leads') {
      if (isMockMode) {
        await sendMessage(`
<b>Latest 5 Leads (MOCK):</b>

👤 Ahmed Mansour (+20 102 334 5567)
📅 4/28/2026
---
👤 Sarah Jenkins (+44 778 990 1234)
📅 4/27/2026
---
👤 Khalid Al-Sayed (+971 50 123 4567)
📅 4/27/2026
---
👤 Maria Garcia (+1 415 555 0199)
📅 4/26/2026
---
👤 John Doe (+20 111 222 3333)
📅 4/25/2026
---
        `);
        return NextResponse.json({ ok: true });
      }
      try {
        const snap = await adminDb.collection('leads')
          .orderBy('createdAt', 'desc')
          .limit(5)
          .get();

        if (snap.empty) {
          await sendMessage("<b>PIPELINE STATUS</b>\n\nNo recent leads found.");
          return NextResponse.json({ ok: true });
        }

        let leadText = "<b>Latest 5 Leads:</b>\n\n";
        snap.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => {
            const d = doc.data();
            const dateStr = d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString() : 'N/A';
            leadText += `👤 ${sanitize(String(d.name || 'Unknown'))} (${sanitize(String(d.phone || 'No Phone'))})\n📅 ${dateStr}\n---\n`;
        });
        await sendMessage(leadText);
      } catch (err: unknown) {
        await sendMessage('❌ <b>Database Error:</b> Failed to fetch leads. Check server logs.');
        console.error('[Telegram /leads] Error:', err instanceof Error ? err.message : err);
      }
    } else if (text === '/listings') {
      if (isMockMode) {
        await sendMessage(`
<b>Latest 5 Listings (MOCK):</b>

🏢 <b>Marassi Marina Penthouse</b> - EGP 45,000,000
📍 North Coast, Egypt
---
🏢 <b>Burj Khalifa Sky Villa</b> - AED 12,500,000
📍 Downtown Dubai
---
🏢 <b>New Giza Modern Mansion</b> - EGP 28,000,000
📍 6th of October City
---
🏢 <b>ZED Towers Apartment</b> - EGP 8,500,000
📍 Sheikh Zayed
---
🏢 <b>Palm Hills Extension Villa</b> - EGP 15,000,000
📍 October City
---
        `);
        return NextResponse.json({ ok: true });
      }
      try {
        const snap = await adminDb.collection('listings')
          .orderBy('createdAt', 'desc')
          .limit(5)
          .get();

        if (snap.empty) {
          await sendMessage("<b>INVENTORY STATUS</b>\n\nNo listings found.");
          return NextResponse.json({ ok: true });
        }

        let listingText = "<b>Latest 5 Listings:</b>\n\n";
        snap.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => {
            const d = doc.data();
            listingText += `🏢 ${sanitize(String(d.title || 'Untitled'))} - EGP ${sanitize(String(d.price || 0))}\n📍 ${sanitize(String(d.location || 'Unknown'))}\n---\n`;
        });
        await sendMessage(listingText);
      } catch (err: unknown) {
        await sendMessage('❌ <b>Database Error:</b> Failed to fetch listings. Check server logs.');
        console.error('[Telegram /listings] Error:', err instanceof Error ? err.message : err);
      }
    } else if (text.startsWith('/ag') || text.includes('antigravity')) {
        const queryText = text.replace('/ag', '').trim();

        await fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
        });

        const { processAgentCommand } = await import('@/lib/services/antigravity-agent');
        const response = await processAgentCommand(chatId, queryText || "Hello! I am Antigravity. How can I assist your operations today?");
        await sendMessage(response.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("Telegram webhook error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}