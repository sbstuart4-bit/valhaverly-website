import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin/api';
import { buildPartnerEmail, sendEmail } from '@/lib/email/partner-emails';
import { rejectApplication } from '@/lib/partner/admin-actions';
import { errorResponse, jsonResponse } from '@/lib/partner/api';
import { getApplication, saveApplication, seedDemoApplications } from '@/lib/partner/store';
import { trim } from '@/lib/partner/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = requireAdmin(request);
  if (!admin) return errorResponse('Unauthorized.', 401);

  try {
    await seedDemoApplications();
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = trim(body.reason);
    const sendNotification = body.sendEmail !== false;

    const app = await getApplication(id);
    if (!app) return errorResponse('Application not found.', 404);

    if (app.status === 'Approved') {
      return errorResponse('Approved partners must be suspended, not rejected.');
    }

    const updated = await rejectApplication(app, reason, admin.email);
    const saved = await saveApplication(updated);

    let emailResult = null;
    if (sendNotification && saved.personal.email) {
      const mail = buildPartnerEmail('rejected', {
        firstName: saved.personal.firstName,
        reason,
      });
      emailResult = await sendEmail({
        to: saved.personal.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });
    }

    const { passwordHash: _, ...application } = saved;
    return jsonResponse({ success: true, application, email: emailResult });
  } catch (err) {
    console.error('Admin reject error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Rejection failed.', 500);
  }
}
