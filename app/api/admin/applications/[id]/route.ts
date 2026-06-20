import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin/api';
import { errorResponse, jsonResponse } from '@/lib/partner/api';
import { getApplication, seedDemoApplications } from '@/lib/partner/store';

function sanitizeApplication(app: Awaited<ReturnType<typeof getApplication>>) {
  if (!app) return null;
  const { passwordHash: _, ...safe } = app;
  return safe;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = requireAdmin(request);
  if (!admin) return errorResponse('Unauthorized.', 401);

  try {
    await seedDemoApplications();
    const { id } = await params;
    const app = await getApplication(id);
    if (!app) return errorResponse('Application not found.', 404);
    return jsonResponse({ success: true, application: sanitizeApplication(app) });
  } catch (err) {
    console.error('Admin get application error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Failed to load application.', 500);
  }
}
