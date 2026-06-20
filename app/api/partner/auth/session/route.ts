import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, jsonResponse } from '@/lib/partner/api';
import {
  applicationToPortalAgent,
  getApplication,
  isPortalAccessible,
  seedDemoApplications,
} from '@/lib/partner/store';

export async function GET(request: NextRequest) {
  await seedDemoApplications();

  const session = getSessionFromRequest(request);
  if (!session) {
    return jsonResponse({ success: true, authenticated: false });
  }

  const app = await getApplication(session.applicationId);
  if (!app) {
    const response = NextResponse.json({ success: true, authenticated: false });
    return response;
  }

  const agent = isPortalAccessible(app.status) ? applicationToPortalAgent(app) : null;

  return jsonResponse({
    success: true,
    authenticated: true,
    session: {
      applicationId: app.id,
      email: app.personal.email,
      status: app.status,
      role: 'agent',
      partnerId: app.partnerProfile?.partnerId,
    },
    agent,
    application: {
      id: app.id,
      status: app.status,
      partnerProfile: app.partnerProfile,
      personal: {
        firstName: app.personal.firstName,
        lastName: app.personal.lastName,
        email: app.personal.email,
      },
      applicationDate: app.applicationDate || app.submittedAt,
      submittedAt: app.submittedAt,
      reviewedAt: app.reviewedAt,
    },
  });
}
