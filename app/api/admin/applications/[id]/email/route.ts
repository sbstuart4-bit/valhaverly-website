import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin/api';
import { buildPartnerEmail, sendEmail, type EmailTemplate } from '@/lib/email/partner-emails';
import { errorResponse, jsonResponse } from '@/lib/partner/api';
import { getApplication, seedDemoApplications } from '@/lib/partner/store';
import { trim } from '@/lib/partner/utils';

const ALLOWED_TEMPLATES: EmailTemplate[] = [
  'application-received',
  'approved',
  'rejected',
  'suspended',
  'reinstated',
  'custom',
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = requireAdmin(request);
  if (!admin) return errorResponse('Unauthorized.', 401);

  try {
    await seedDemoApplications();
    const { id } = await params;
    const body = await request.json();
    const template = (trim(body.template) || 'custom') as EmailTemplate;
    const customBody = trim(body.body);
    const customSubject = trim(body.subject);
    const reason = trim(body.reason);

    if (!ALLOWED_TEMPLATES.includes(template)) {
      return errorResponse('Invalid email template.');
    }

    const app = await getApplication(id);
    if (!app) return errorResponse('Application not found.', 404);
    if (!app.personal.email) return errorResponse('Applicant has no email on file.');

    const mail = buildPartnerEmail(template, {
      firstName: app.personal.firstName,
      partnerId: app.partnerProfile?.partnerId,
      referralUrl: app.partnerProfile?.referralUrl,
      reason,
      customBody: customBody ? `<p>${customBody.replace(/\n/g, '</p><p>')}</p>` : undefined,
    });

    const emailResult = await sendEmail({
      to: app.personal.email,
      subject: customSubject || mail.subject,
      html: mail.html,
      text: mail.text,
    });

    return jsonResponse({ success: true, email: emailResult, template });
  } catch (err) {
    console.error('Admin email error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Failed to send email.', 500);
  }
}
