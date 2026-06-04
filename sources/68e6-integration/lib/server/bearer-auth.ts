import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

function isSecretMatch(provided: string | null, expected: string | undefined) {
  if (!provided || !expected) {
    return false;
  }

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

export function hasValidBearerToken(authHeader: string | null, secret: string | undefined) {
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }

  return isSecretMatch(authHeader.slice(7), secret);
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}
