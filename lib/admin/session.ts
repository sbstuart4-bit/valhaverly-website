import { createHmac, timingSafeEqual } from 'crypto';
import type { AdminSession } from './types';
import { ADMIN_SESSION_MAX_AGE_MS } from './types';

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || 'valhaverly-demo-admin-secret-change-me';
}

export function createAdminSessionToken(session: AdminSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = createHmac('sha256', getSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function parseAdminSessionToken(token: string): AdminSession | null {
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
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AdminSession;
    if (new Date(session.expiresAt).getTime() < Date.now()) return null;
    if (session.role !== 'admin') return null;
    return session;
  } catch {
    return null;
  }
}

export function buildAdminSession(email: string, name: string): AdminSession {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + ADMIN_SESSION_MAX_AGE_MS);
  return {
    email: email.toLowerCase(),
    role: 'admin',
    name,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}
