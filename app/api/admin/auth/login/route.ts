import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminLogin } from '@/lib/admin/auth';
import { buildAdminSession, createAdminSessionToken } from '@/lib/admin/session';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE_MS } from '@/lib/admin/types';
import { errorResponse } from '@/lib/partner/api';
import { trim } from '@/lib/partner/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = trim(body.email).toLowerCase();
    const password = trim(body.password);

    if (!email || !password) {
      return errorResponse('Email and password are required.');
    }

    const result = verifyAdminLogin(email, password);
    if (!result.ok) {
      return errorResponse('Invalid email or password.', 401);
    }

    const session = buildAdminSession(email, result.name);
    const token = createAdminSessionToken(session);

    const response = NextResponse.json({
      success: true,
      admin: { email: session.email, name: session.name },
      redirect: '/admin/dashboard',
    });

    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_SESSION_MAX_AGE_MS / 1000,
    });

    return response;
  } catch (err) {
    console.error('Admin login error:', err);
    return errorResponse('Login failed.', 500);
  }
}
