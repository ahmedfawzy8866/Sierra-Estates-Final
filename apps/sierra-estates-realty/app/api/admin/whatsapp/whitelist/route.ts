import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/server/auth-guard';
import { logger } from '@/lib/logger';

// Relative path to the whitelist.json configuration of the whatsapp-bot agent
const whitelistPath = path.resolve(process.cwd(), '../agents/whatsapp-bot/whitelist.json');

interface WhitelistConfig {
  enabled: boolean;
  numbers: string[];
}

function loadWhitelist(): WhitelistConfig {
  try {
    if (fs.existsSync(whitelistPath)) {
      return JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));
    }
  } catch (err) {
    logger.error('Failed to read whitelist.json in API:', err);
  }
  return { enabled: true, numbers: [] };
}

function saveWhitelist(config: WhitelistConfig) {
  // Ensure the parent directories exist (just in case)
  const dir = path.dirname(whitelistPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(whitelistPath, JSON.stringify(config, null, 2), 'utf8');
}

const updateSchema = z.object({
  enabled: z.boolean().optional(),
  numbers: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const authResult = await verifyAdminRequest(req);
  if (!authResult.authenticated) return unauthorizedResponse();

  try {
    const config = loadWhitelist();
    return NextResponse.json(config);
  } catch (err) {
    logger.error('Error fetching whitelist:', err);
    return NextResponse.json(
      { error: 'Failed to fetch whitelist', details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const authResult = await verifyAdminRequest(req);
  if (!authResult.authenticated) return unauthorizedResponse();

  try {
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const config = loadWhitelist();
    const data = parsed.data;

    if (data.enabled !== undefined) {
      config.enabled = data.enabled;
    }

    if (data.numbers !== undefined) {
      // Normalize numbers (digits only) before saving
      config.numbers = data.numbers
        .map((num) => num.replace(/\D/g, ''))
        .filter(Boolean);
    }

    saveWhitelist(config);
    logger.info('WhatsApp Bot Whitelist configuration updated via Admin API');

    return NextResponse.json({ success: true, config });
  } catch (err) {
    logger.error('Error updating whitelist:', err);
    return NextResponse.json(
      { error: 'Failed to update whitelist', details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
