/**
 * Sierra Estates — Server-side Auth Guard
 * Validates Firebase Auth tokens on API routes.
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from './firebase-admin';

const SECRET_KEY = process.env.SE_SECRET_KEY || '';

export interface AuthResult {
  authenticated: boolean;
  uid?: string;
  email?: string;
  method: 'firebase' | 'secret-key' | 'none';
}

export async function verifyRequest(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      return { authenticated: true, uid: decoded.uid, email: decoded.email, method: 'firebase' };
    } catch { /* fall through */ }
  }

  const secretHeader = req.headers.get('x-se-secret-key');
  if (SECRET_KEY && secretHeader === SECRET_KEY) {
    return { authenticated: true, method: 'secret-key' };
  }

  return { authenticated: false, method: 'none' };
}

export async function verifyAdminRequest(req: NextRequest): Promise<AuthResult> {
  const result = await verifyRequest(req);
  if (!result.authenticated || result.method === 'none') return result;
  if (result.uid) {
    try {
      const claims = (await adminAuth.getUser(result.uid)).customClaims;
      if (!claims?.admin && claims?.role !== 'admin') {
        return { authenticated: false, method: 'none' };
      }
    } catch { return { authenticated: false, method: 'none' }; }
  }
  return result;
}

export function unauthorizedResponse(message = 'Authentication required') {
  return NextResponse.json({ error: message, code: 'UNAUTHORIZED' }, { status: 401 });
}
