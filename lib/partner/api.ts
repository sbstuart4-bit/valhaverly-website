import { NextRequest } from 'next/server';
import { parseSessionToken } from '@/lib/partner/session';
import { SESSION_COOKIE } from '@/lib/partner/types';

export function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return parseSessionToken(token);
}

export function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}
