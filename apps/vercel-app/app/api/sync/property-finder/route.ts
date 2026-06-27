/**
 * POST /api/sync/property-finder
 * Trigger a PropertyFinder Atlas sync (listings + leads).
 * Protected by SBR_SECRET_KEY (via middleware).
 */

import { NextRequest, NextResponse } from 'next/server';
import { PFSyncEngine } from '@/lib/server/pf-sync-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { mode = 'full', pageSize, delayMs, dryRun } = body;

    let result;

    switch (mode) {
      case 'leads-only':
        result = await PFSyncEngine.syncLeadsOnly();
        break;

      case 'single': {
        const { reference } = body;
        if (!reference) {
          return NextResponse.json(
            { success: false, error: 'Missing "reference" for single listing sync' },
            { status: 400 }
          );
        }
        result = await PFSyncEngine.syncSingleListing(reference);
        break;
      }

      case 'full':
      default:
        result = await PFSyncEngine.runFullSync({
          pageSize: pageSize || 50,
          delayMs: delayMs || 500,
          dryRun: dryRun || false,
        });
        break;
    }

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown sync error';
    console.error('[PF-SYNC] Failed:', message);
    return NextResponse.json(
      { success: false, error: `PropertyFinder sync failed: ${message}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync/property-finder
 * Get the latest sync log entry.
 */
export async function GET() {
  try {
    const { adminDb } = await import('@/lib/server/firebase-admin');
    const { COLLECTIONS } = await import('@/lib/models/schema');

    const snapshot = await adminDb
      .collection(COLLECTIONS.syncLog)
      .orderBy('startedAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, lastSync: null });
    }

    const doc = snapshot.docs[0];
    return NextResponse.json({
      success: true,
      lastSync: { id: doc.id, ...doc.data() },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
