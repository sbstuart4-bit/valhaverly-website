import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin/api';
import { buildPartnerEmail, sendEmail } from '@/lib/email/partner-emails';
import { errorResponse, jsonResponse } from '@/lib/partner/api';
import { approveApplication, seedDemoApplications } from '@/lib/partner/store';

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

    const approved = await approveApplication(id);
    if (!approved) return errorResponse('Application not found.', 404);

    let emailResult = null;
    if (sendNotification && approved.personal.email) {
      const mail = buildPartnerEmail('approved', {
        firstName: approved.personal.firstName,
        partnerId: approved.partnerProfile?.partnerId,
        referralUrl: approved.partnerProfile?.referralUrl,
      });
      emailResult = await sendEmail({
        to: approved.personal.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });
    }

    const { passwordHash: _, ...application } = approved;
    return jsonResponse({ success: true, application, email: emailResult });
  } catch (err) {
    console.error('Admin approve error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Approval failed.', 500);
  }
}
