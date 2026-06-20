import { NextRequest, NextResponse } from 'next/server';
import { buildSession, createSessionToken } from '@/lib/partner/session';
import { errorResponse } from '@/lib/partner/api';
import {
  applicationToPortalAgent,
  getApplicationByEmail,
  isPortalAccessible,
  seedDemoApplications,
} from '@/lib/partner/store';
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from '@/lib/partner/types';
import { trim, verifyPassword } from '@/lib/partner/utils';

export async function POST(request: NextRequest) {
  try {
    await seedDemoApplications();

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid request body.');
    }

    const email = trim(body.email).toLowerCase();
    const password = trim(body.password);
    const rememberMe = body.rememberMe === true;

    if (!email || !password) {
      return errorResponse('Please enter your email and password.');
    }

    const app = await getApplicationByEmail(email);
    if (!app || !app.passwordHash) {
      return errorResponse('Invalid email or password.', 401);
    }

    if (!verifyPassword(password, app.passwordHash)) {
      return errorResponse('Invalid email or password.', 401);
    }

    if (app.status === 'Suspended') {
      return errorResponse('Your partner account has been suspended. Contact support.', 403);
    }

    const session = buildSession(app.id, app.personal.email, app.status, app.partnerProfile?.partnerId);
    const token = createSessionToken(session);
    const maxAge = rememberMe ? SESSION_MAX_AGE_MS / 1000 : 24 * 60 * 60;
    const redirect = getRedirectForStatus(app.status);

    const response = NextResponse.json({
      success: true,
      status: app.status,
      redirect,
      agent: isPortalAccessible(app.status) ? applicationToPortalAgent(app) : null,
      application: {
        id: app.id,
        status: app.status,
        partnerProfile: app.partnerProfile,
        applicationDate: app.applicationDate || app.submittedAt,
        submittedAt: app.submittedAt,
      },
    });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return response;
  } catch (err) {
    console.error('Partner login error:', err);
    const message = err instanceof Error ? err.message : 'Login failed.';
    return errorResponse(message, 500);
  }
}

function getRedirectForStatus(status: string): string {
  switch (status) {
    case 'Approved':
      return '/agent-partners/approved';
    case 'Submitted':
    case 'Under Review':
      return '/agent-partners/pending-approval';
    case 'Rejected':
      return '/agent-partners/pending-approval?status=rejected';
    case 'Draft':
      return '/agent-partners/apply';
    default:
      return '/agent-login';
  }
}
