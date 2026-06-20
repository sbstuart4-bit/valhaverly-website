import { NextRequest } from 'next/server';
import { parseAdminSessionToken } from './session';
import { ADMIN_SESSION_COOKIE } from './types';

export function getAdminSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return parseAdminSessionToken(token);
}

export function requireAdmin(request: NextRequest) {
  const session = getAdminSessionFromRequest(request);
  if (!session) return null;
  return session;
}
