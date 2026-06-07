import { NextRequest, NextResponse } from 'next/server';
import { adminAppCheck } from './firebase-admin';

/**
 * Verifies the Firebase App Check token from the request headers.
 * Returns an object with the verification result and an optional error response.
 */
export async function verifyAppCheck(req: NextRequest) {
  const appCheckToken = req.headers.get('X-Firebase-AppCheck');

  if (process.env.SKIP_APP_CHECK === 'true') {
    console.log('🛡️ [AppCheck] SKIP_APP_CHECK bypass active for:', req.nextUrl.pathname);
    return { isValid: true, token: { sub: 'dev-bypass' } };
  }

  if (!appCheckToken) {
    console.warn('[AppCheck] Missing token from:', req.nextUrl.pathname);
    return { 
      isValid: false, 
      errorResponse: NextResponse.json(
        { error: 'Unauthorized: Missing security attestation.' }, 
        { status: 401 }
      ) 
    };
  }

  try {
    const decodedToken = await adminAppCheck.verifyToken(appCheckToken);
    return { isValid: true, token: decodedToken };
  } catch (err) {
    console.error('[AppCheck] Verification failed:', err);
    return { 
      isValid: false, 
      errorResponse: NextResponse.json(
        { error: 'Unauthorized: Invalid security attestation.' }, 
        { status: 401 }
      ) 
    };
  }
}
