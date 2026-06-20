import { NextRequest } from 'next/server';
import { errorResponse, jsonResponse } from '@/lib/partner/api';
import { createApplication, getApplicationByEmail, saveApplication, seedDemoApplications } from '@/lib/partner/store';
import { EMAIL_RE, trim } from '@/lib/partner/utils';

export async function POST(request: NextRequest) {
  await seedDemoApplications();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid request body.');
  }

  const email = trim(body.email).toLowerCase();
  if (email && !EMAIL_RE.test(email)) {
    return errorResponse('Please enter a valid email address.');
  }

  if (email) {
    const existing = await getApplicationByEmail(email);
    if (existing && existing.status !== 'Draft') {
      return jsonResponse({
        success: true,
        application: {
          id: existing.id,
          status: existing.status,
          existing: true,
        },
      });
    }
    if (existing) {
      return jsonResponse({ success: true, application: { id: existing.id, status: existing.status } });
    }
  }

  const app = await createApplication(email);
  if (email) {
    app.personal.email = email;
    await saveApplication(app);
  }

  return jsonResponse({ success: true, application: { id: app.id, status: app.status } });
}
