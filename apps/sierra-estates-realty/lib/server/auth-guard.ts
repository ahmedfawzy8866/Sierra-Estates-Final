/**
 * sierra estates — SERVER-SIDE AUTH GUARD
 * Validates Firebase Auth tokens on API routes.
 *
 * Supports three auth methods:
 *   1. Firebase ID Token  →  Authorization: Bearer <token>
 *   2. SBR Secret Key     →  X-SBR-SECRET-KEY header
 *   3. Cron/Service key   →  Authorization: Bearer <CRON_SECRET>  (Vercel cron jobs)
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from './firebase-admin';

const SBR_SECRET = process.env.SBR_SECRET_KEY || process.env.CRON_SECRET || '';

export interface AuthResult {
  authenticated: boolean;
  uid?: string;
  email?: string;
  method: 'firebase' | 'secret-key' | 'cron-secret' | 'none';
}

/**
 * Verifies an incoming API request.
 */
export async function verifyRequest(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);

    // Vercel cron / internal service token (sent as Bearer)
    if (SBR_SECRET && token === SBR_SECRET) {
      return { authenticated: true, method: 'cron-secret' };
    }

    // Firebase JWT
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      return { authenticated: true, uid: decoded.uid, email: decoded.email, method: 'firebase' };
    } catch {
      // fall through
    }
  }

  // X-SBR-SECRET-KEY header (server-to-server / webhook calls)
  const secretHeader = req.headers.get('x-sbr-secret-key');
  if (SBR_SECRET && secretHeader === SBR_SECRET) {
    return { authenticated: true, method: 'secret-key' };
  }

  // x-cron-secret header variant
  const cronHeader = req.headers.get('x-cron-secret');
  if (SBR_SECRET && cronHeader === SBR_SECRET) {
    return { authenticated: true, method: 'cron-secret' };
  }

  return { authenticated: false, method: 'none' };
}

export function unauthorizedResponse(message = 'Authentication required') {
  return NextResponse.json({ error: message, code: 'UNAUTHORIZED' }, { status: 401 });
}

/**
 * Verifies request is from an authenticated admin user.
 * Checks Firebase token AND verifies `role` in Firestore.
 * Service/cron tokens are also accepted as admin-level.
 */
export async function verifyAdminRequest(req: NextRequest): Promise<AuthResult> {
  const result = await verifyRequest(req);
  if (!result.authenticated) return result;

  // Service/cron callers are trusted as admin-level
  if (result.method === 'secret-key' || result.method === 'cron-secret') {
    return result;
  }

  if (!result.uid) return { authenticated: false, method: 'none' };

  try {
    const { adminDb } = await import('./firebase-admin');
    const userDoc = await adminDb.collection('users').doc(result.uid).get();
    const role = userDoc.data()?.role;
    if (role !== 'admin' && role !== 'superadmin') {
      return { authenticated: false, method: 'none' };
    }
  } catch {
    return { authenticated: false, method: 'none' };
  }

  return result;
}
