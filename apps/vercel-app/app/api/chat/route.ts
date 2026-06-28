import { applyRateLimitAsync, publicEndpointLimiter } from "@/lib/server/rate-limit";
import { NextRequest, NextResponse } from 'next/server';
import { OmnichannelChatService } from '@/lib/services/OmnichannelChatService';
import { z } from 'zod';

/**
 * Sanitize user input to prevent XSS when values are forwarded to
 * Telegram HTML messages or other contexts. Strips HTML tags.
 */
function sanitizeForOutput(input: string, maxLength: number = 200): string {
  return input
    .replace(/<[^>]*>/g, '')  // Strip HTML tags
    .slice(0, maxLength)
    .trim();
}

// ─── Input Validation Schema ────────────────────────────────────────────────

const ChatMessageSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required').max(128, 'sessionId too long'),
  message: z.string().min(1, 'message is required').max(4000, 'message too long'),
  name: z.string().max(200, 'name too long').optional(),
});

/**
 * SIERRA ESTATES WEB CONCIERGE CHAT API
 * Serves as the dynamic gateway between the web-based LeilaConcierge widget and OmnichannelChatService.
 */
export async function POST(req: NextRequest) {
  const limited = await applyRateLimitAsync(req, publicEndpointLimiter);
  if (limited) return limited;
  try {
    const raw = await req.json();

    // Validate input with Zod
    const parseResult = ChatMessageSchema.safeParse(raw);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      );
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { sessionId, message, name } = parseResult.data;

    // Sanitize name before forwarding (prevents XSS in Telegram notifications)
    const sanitizedName = name ? sanitizeForOutput(name) : 'Web Guest';

    const result = await OmnichannelChatService.handleIncomingMessage({
      platform: 'web',
      senderId: sessionId.slice(0, 128),
      senderName: sanitizedName,
      text: message.slice(0, 4000)
    });

    return NextResponse.json({
      success: result.success,
      reply: result.replyText,
      stakeholderId: result.stakeholderId,
      action: result.actionTaken
    });
  } catch (error: unknown) {
    console.error("[Web Concierge] API Failure:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Failed to process concierge request" }, { status: 500 });
  }
}
