import { applyRateLimit, publicEndpointLimiter } from "@/lib/server/rate-limit";
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { COLLECTIONS } from '@/lib/models/schema';
import { sendTelegramMessage } from '@/lib/telegram';
import { z } from 'zod';

// ── Input Validation Schema ────────────────────────────────────────────
const leadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200, 'Name too long'),
  email: z.string().email('Invalid email format').max(200, 'Email too long').optional().or(z.literal('')),
  phone: z.string().trim().min(1, 'Phone is required').max(50, 'Phone too long'),
  message: z.string().max(5000, 'Message too long').optional().default(''),
  locale: z.string().max(10, 'Invalid locale').optional().default('en'),
});

// ── HTML Sanitizer for Telegram ────────────────────────────────────────
// Strips HTML tags and escapes special characters for safe inclusion
// in Telegram HTML messages (prevents stored XSS via bot notifications)
function sanitizeForTelegram(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, ' ')
    .trim();
}

export async function POST(req: Request) {
  const limited = applyRateLimit(req, publicEndpointLimiter);
  if (limited) return limited;

  try {
    const raw = await req.json();

    // ── Validate input with Zod ────────────────────────────────────────
    const parsed = leadSchema.safeParse(raw);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid input';
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      );
    }

    const { name, email, phone, message, locale } = parsed.data;

    // 1. Add to Firestore
    const leadRef = await adminDb.collection(COLLECTIONS.stakeholders).add({
      name,
      email: email || null,
      phone,
      message,
      status: 'new',
      phase: 'acquisition',
      priority: 'warm',
      via: 'Website',
      interest: 'General Inquiry',
      capitalAllocation: 'To be determined',
      locale,
      aiProfiling: {
        interests: ['General Inquiry'],
        topMatches: [],
        lastAnalyzedAt: Timestamp.now(),
      },
      automation: {
        followupReminderEnabled: true,
        interactionFrequency: 'medium',
      },
      createdAt: Timestamp.now()
    });

    // 2. Send Telegram Notification (sanitized — no raw user input in HTML)
    const safeName = sanitizeForTelegram(name);
    const safeEmail = sanitizeForTelegram(email || 'Not provided');
    const safePhone = sanitizeForTelegram(phone);
    const safeMessage = sanitizeForTelegram(message);
    const safeLocale = sanitizeForTelegram(locale);

    const text = [
      '<b>🚀 New Lead - Sierra Estates Realty</b>',
      `<b>Name:</b> ${safeName}`,
      `<b>Email:</b> ${safeEmail}`,
      `<b>Phone:</b> ${safePhone}`,
      '<b>Interest:</b> General Inquiry',
      `<b>Message:</b> ${safeMessage}`,
      `<b>Locale:</b> ${safeLocale}`,
    ].join('\n');

    await sendTelegramMessage(text);

    return NextResponse.json({ success: true, id: leadRef.id });
  } catch (error: unknown) {
    console.error("Lead submission error:", error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}