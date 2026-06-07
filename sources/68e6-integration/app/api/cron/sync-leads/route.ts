import { NextRequest, NextResponse } from 'next/server';
import { PFIntegrationService } from '@/lib/services/PFIntegrationService';
import { adminDb } from '@/lib/server/firebase-admin';
import { hasValidBearerToken, unauthorizedResponse } from '@/lib/server/bearer-auth';
import { Timestamp } from 'firebase-admin/firestore';
import { COLLECTIONS } from '@/lib/models/schema';

/**
 * sierra estates — CRON: PROPERTY FINDER LEAD SYNC
 * Runs every 10 minutes via Vercel Cron to pull new leads.
 * This ensures "15-min response time" SLA compliance.
 */

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!hasValidBearerToken(authHeader, cronSecret)) {
    return unauthorizedResponse();
  }

  try {
    console.log("🔄 [CRON] Starting Property Finder lead sync...");

    const summary = await PFIntegrationService.syncIncomingLeads();

    // Log sync activity
    if (summary.created > 0 || summary.updated > 0) {
      await adminDb.collection(COLLECTIONS.activities).add({
        type: 'sync_completed',
        actorId: 'system',
        actorName: 'Sync Gateway',
        description: `Property Finder sync: **${summary.created} new** leads imported, **${summary.updated}** refreshed.`,
        text: `Property Finder sync: **${summary.created} new** leads imported, **${summary.updated}** refreshed.`,
        color: 'var(--blue-light)',
        createdAt: Timestamp.now(),
      });
    }

    console.log(`✅ [CRON] Sync complete: ${summary.created} created, ${summary.updated} updated, ${summary.skipped} skipped`);

    return NextResponse.json({
      success: true,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("🚨 [CRON] Sync failed:", error);

    return NextResponse.json({
      success: false,
      error: error.message || 'Sync pipeline interrupted',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
