import { createHmac, timingSafeEqual } from 'crypto';
import type { PartnerSession } from './types';
import { SESSION_MAX_AGE_MS } from './types';

function getSecret(): string {
  return process.env.PARTNER_SESSION_SECRET || 'valhaverly-demo-partner-secret-change-me';
}

export function createSessionToken(session: PartnerSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = createHmac('sha256', getSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function parseSessionToken(token: string): PartnerSession | null {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = createHmac('sha256', getSecret()).update(payload).digest('base64url');
  try {
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as PartnerSession;
    if (new Date(session.expiresAt).getTime() < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function buildSession(
  applicationId: string,
  email: string,
  status: PartnerSession['status'],
  partnerId?: string,
): PartnerSession {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + SESSION_MAX_AGE_MS);
  return {
    applicationId,
    email: email.toLowerCase(),
    role: 'agent',
    status,
    partnerId,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}
