import { NextRequest } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/admin/api';
import { jsonResponse } from '@/lib/partner/api';

export async function GET(request: NextRequest) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return jsonResponse({ authenticated: false });
  }
  return jsonResponse({
    authenticated: true,
    admin: { email: session.email, name: session.name },
  });
}
