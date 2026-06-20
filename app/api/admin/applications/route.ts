import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin/api';
import { errorResponse, jsonResponse } from '@/lib/partner/api';
import { listApplications, seedDemoApplications } from '@/lib/partner/store';

export async function GET(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) return errorResponse('Unauthorized.', 401);

  try {
    await seedDemoApplications();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('q') || '';

    const [applications, allApps] = await Promise.all([
      listApplications({ status, search }),
      listApplications(),
    ]);
    const counts = allApps.reduce(
      (acc, app) => {
        acc.all++;
        acc[app.status as keyof typeof acc] = (acc[app.status as keyof typeof acc] || 0) + 1;
        return acc;
      },
      { all: 0, Draft: 0, Submitted: 0, 'Under Review': 0, Approved: 0, Rejected: 0, Suspended: 0 } as Record<string, number>,
    );

    return jsonResponse({ success: true, applications, counts });
  } catch (err) {
    console.error('Admin list error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Failed to load applications.', 500);
  }
}
