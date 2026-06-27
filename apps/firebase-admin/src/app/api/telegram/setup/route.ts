import { NextResponse } from 'next/server';

/**
 * GET /api/telegram/setup?url=<base-url>
 *
 * Registers a Telegram webhook. Requires the SBR_SECRET_KEY for authentication.
 * The `url` parameter must be HTTPS-only and match an allowed origin pattern
 * to prevent SSRF attacks.
 */
export async function GET(req: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secretKey = process.env.SBR_SECRET_KEY;

  // ── Auth check: require internal secret key ────────────────────────────
  if (!secretKey) {
    return NextResponse.json({ error: 'Server misconfiguration: missing SBR_SECRET_KEY' }, { status: 500 });
  }

  const providedKey = req.headers.get('x-sbr-secret-key');
  if (!providedKey || providedKey !== secretKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!token) return NextResponse.json({ error: 'Telegram bot token not configured' }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing required "url" query parameter' }, { status: 400 });
  }

  // ── SSRF prevention: validate URL format and protocol ──────────────────
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  // Only allow HTTPS
  if (parsedUrl.protocol !== 'https:') {
    return NextResponse.json({ error: 'Only HTTPS URLs are allowed' }, { status: 400 });
  }

  // Block internal/private IP ranges (prevent SSRF to cloud metadata, etc.)
  const hostname = parsedUrl.hostname.toLowerCase();
  const blockedPatterns = [
    'localhost', '127.0.0.1', '0.0.0.0', '::1',
    '169.254.169.254',  // AWS/GCP metadata
    'metadata.google.internal',
    '100.64.',         // CGNAT
  ];

  if (blockedPatterns.some(blocked => hostname === blocked || hostname.startsWith(blocked))) {
    console.warn(`[Telegram Setup] SSRF blocked: ${hostname}`);
    return NextResponse.json({ error: 'URL not allowed' }, { status: 400 });
  }

  // Optional: restrict to known allowed domains
  const allowedDomains = (process.env.TELEGRAM_WEBHOOK_ALLOWED_DOMAINS || '').split(',').filter(Boolean);
  if (allowedDomains.length > 0) {
    const isAllowed = allowedDomains.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
    if (!isAllowed) {
      return NextResponse.json({ error: 'Domain not in allowlist' }, { status: 400 });
    }
  }

  try {
    const webhookUrl = `${url}/api/telegram/webhook`;
    const response = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`,
      { signal: AbortSignal.timeout(10000) }
    );
    const data = await response.json();

    if (!data.ok) {
      console.warn('[Telegram Setup] Webhook registration failed:', data.description);
    }

    return NextResponse.json({ ok: data.ok, description: data.description });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Telegram Setup] Error:', message);
    return NextResponse.json({ error: 'Failed to register webhook' }, { status: 500 });
  }
}