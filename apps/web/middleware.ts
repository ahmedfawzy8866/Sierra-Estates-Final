import { NextRequest, NextResponse } from 'next/server';

const VALID_SECRET = process.env.SBR_SECRET_KEY;

export function middleware(request: NextRequest) {
  if (!VALID_SECRET) {
    return NextResponse.json(
      { error: 'Server misconfiguration: missing SBR_SECRET_KEY' },
      { status: 500 }
    );
  }

  const secretKey = request.headers.get('x-sbr-secret-key');

  if (!secretKey || secretKey !== VALID_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing X-SBR-SECRET-KEY header' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/orchestrate',
};
