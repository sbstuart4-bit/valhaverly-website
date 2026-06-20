import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin/api';
import { buildPartnerEmail, sendEmail } from '@/lib/email/partner-emails';
import { reinstateApplication } from '@/lib/partner/admin-actions';
import { errorResponse, jsonResponse } from '@/lib/partner/api';
import { getApplication, saveApplication, seedDemoApplications } from '@/lib/partner/store';

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
    const sendNotification = body.sendEmail !== false;

    const app = await getApplication(id);
    if (!app) return errorResponse('Application not found.', 404);

    const updated = await reinstateApplication(app, admin.email);
    const saved = await saveApplication(updated);

    let emailResult = null;
    if (sendNotification && saved.personal.email) {
      const mail = buildPartnerEmail('reinstated', {
        firstName: saved.personal.firstName,
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
    console.error('Admin reinstate error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Reinstatement failed.', 500);
  }
}
