import { applyRateLimitAsync, publicEndpointLimiter } from "@/lib/server/rate-limit";
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { COLLECTIONS } from '@/lib/models/schema';
import { sendTelegramMessage } from '@/lib/telegram';
import { z } from 'zod';

// ─── Input Validation Schema ────────────────────────────────────────────────

const LeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  email: z.string().email('Invalid email format').max(254, 'Email too long').optional(),
  phone: z.string().min(1, 'Phone is required').max(50, 'Phone too long'),
  message: z.string().max(2000, 'Message too long').optional(),
  locale: z.enum(['ar', 'en']).optional(),
});

export async function POST(req: Request) {
  const limited = await applyRateLimitAsync(req, publicEndpointLimiter);
  if (limited) return limited;

  try {
    const raw = await req.json();

    // Validate input with Zod
    const parseResult = LeadSchema.safeParse(raw);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      );
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const { name, email, phone, message, locale } = parseResult.data;

    // 1. Add to Firestore
    const leadRef = await adminDb.collection(COLLECTIONS.stakeholders).add({
      name,
      email: email ?? '',
      phone,
      message: message ?? '',
      status: 'new',
      phase: 'acquisition',
      priority: 'warm',
      via: 'Website',
      interest: 'General Inquiry',
      capitalAllocation: 'To be determined',
      locale: locale ?? 'ar',
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

    // 2. Send Telegram Notification (sanitise inputs to prevent HTML injection)
    const safeName = name.replace(/[<>&"]/g, '');
    const safeEmail = (email ?? '').replace(/[<>&"]/g, '');
    const safePhone = phone.replace(/[<>&"]/g, '');
    const safeMessage = (message ?? '').replace(/[<>&"]/g, '').slice(0, 500);

    const text = `
<b>🚀 New Lead - Sierra Estates Realty</b>
<b>Name:</b> ${safeName}
<b>Email:</b> ${safeEmail}
<b>Phone:</b> ${safePhone}
<b>Interest:</b> General Inquiry
<b>Message:</b> ${safeMessage}
<b>Locale:</b> ${locale ?? 'ar'}
    `.trim();

    await sendTelegramMessage(text);

    return NextResponse.json({ success: true, id: leadRef.id });
  } catch (error) {
    console.error("Lead submission error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
