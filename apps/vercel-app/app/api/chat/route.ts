import { applyRateLimit, publicEndpointLimiter } from "@/lib/server/rate-limit";
import { NextRequest, NextResponse } from 'next/server';
import { OmnichannelChatService } from '@/lib/services/OmnichannelChatService';

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

/**
 * SIERRA ESTATES WEB CONCIERGE CHAT API
 * Serves as the dynamic gateway between the web-based LeilaConcierge widget and OmnichannelChatService.
 */
export async function POST(req: NextRequest) {
  const limited = applyRateLimit(req, publicEndpointLimiter);
  if (limited) return limited;
  try {
    const body = await req.json();
    const { sessionId, message, name } = body;

    if (!sessionId || !message) {
      return NextResponse.json({ error: "Missing sessionId or message payload" }, { status: 400 });
    }

    // Validate types
    if (typeof sessionId !== 'string' || typeof message !== 'string') {
      return NextResponse.json({ error: "Invalid payload types" }, { status: 400 });
    }

    // Validate lengths
    if (sessionId.length > 128 || message.length > 4000) {
      return NextResponse.json({ error: "Payload exceeds maximum length" }, { status: 400 });
    }

    // Sanitize name before forwarding (prevents XSS in Telegram notifications)
    const sanitizedName = name ? sanitizeForOutput(String(name)) : 'Web Guest';

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
