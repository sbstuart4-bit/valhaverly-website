export type EmailTemplate =
  | 'application-received'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'reinstated'
  | 'custom';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  sent: boolean;
  id?: string;
  devMode?: boolean;
  error?: string;
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM || 'Valhaverly <partners@valhaverly.com>';
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log('\n--- [DEV EMAIL] ---');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Body:', options.text || options.html.replace(/<[^>]+>/g, ' ').slice(0, 500));
    console.log('---\n');
    return { sent: false, devMode: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromAddress(),
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = (data as { message?: string }).message || `Email API error (${res.status})`;
      return { sent: false, error: message };
    }

    return { sent: true, id: (data as { id?: string }).id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send email.';
    return { sent: false, error: message };
  }
}

function wrapEmail(content: string): string {
  return `<!DOCTYPE html><html><body style="font-family:Georgia,serif;color:#1a2238;line-height:1.6;max-width:560px;margin:0 auto;padding:24px;">
    <div style="border-bottom:2px solid #f0b429;padding-bottom:16px;margin-bottom:24px;">
      <strong style="font-size:20px;">Valhaverly</strong>
      <span style="color:#5a9a9a;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;margin-left:12px;">Steward Partners</span>
    </div>
    ${content}
    <p style="margin-top:32px;font-size:13px;color:#4a5568;">— The Valhaverly Partner Team</p>
  </body></html>`;
}

export function buildPartnerEmail(
  template: EmailTemplate,
  data: {
    firstName: string;
    lastName?: string;
    partnerId?: string;
    referralUrl?: string;
    reason?: string;
    customBody?: string;
  },
): { subject: string; html: string; text: string } {
  const name = data.firstName || 'Partner';

  switch (template) {
    case 'application-received':
      return {
        subject: 'Your Valhaverly Partner Application Has Been Received',
        html: wrapEmail(`
          <p>Dear ${name},</p>
          <p>Thank you for applying to the Valhaverly Steward Partner Network. We have received your application and verification documents.</p>
          <p>Our team typically reviews applications within <strong>2–5 business days</strong>. You will receive an email when your status changes.</p>
          <p>You can check your status anytime at <a href="https://valhaverly.com/agent-login">valhaverly.com/agent-login</a>.</p>
        `),
        text: `Dear ${name}, thank you for applying. We will review your application within 2-5 business days.`,
      };

    case 'approved':
      return {
        subject: 'Welcome to the Valhaverly Steward Partner Network',
        html: wrapEmail(`
          <p>Dear ${name},</p>
          <p>Congratulations — your application has been <strong>approved</strong>. Welcome to the Valhaverly Steward Partner Network.</p>
          ${data.partnerId ? `<p><strong>Partner ID:</strong> ${data.partnerId}</p>` : ''}
          ${data.referralUrl ? `<p><strong>Your referral link:</strong> <a href="${data.referralUrl}">${data.referralUrl}</a></p>` : ''}
          <p>Sign in to your Partner Portal to access your referral dashboard, QR code, and resources.</p>
          <p><a href="https://valhaverly.com/agent-login" style="display:inline-block;background:#f0b429;color:#121a2e;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:600;">Sign In to Partner Portal</a></p>
        `),
        text: `Dear ${name}, your partner application has been approved. Partner ID: ${data.partnerId || 'N/A'}. Sign in at valhaverly.com/agent-login`,
      };

    case 'rejected':
      return {
        subject: 'Update on Your Valhaverly Partner Application',
        html: wrapEmail(`
          <p>Dear ${name},</p>
          <p>Thank you for your interest in the Valhaverly Steward Partner Network. After careful review, we are unable to approve your application at this time.</p>
          ${data.reason ? `<p><strong>Note from our team:</strong> ${data.reason}</p>` : ''}
          <p>If you believe this was made in error or your circumstances have changed, please contact us at <a href="mailto:partners@valhaverly.com">partners@valhaverly.com</a>.</p>
        `),
        text: `Dear ${name}, we are unable to approve your application at this time.${data.reason ? ` Note: ${data.reason}` : ''}`,
      };

    case 'suspended':
      return {
        subject: 'Your Valhaverly Partner Account Has Been Suspended',
        html: wrapEmail(`
          <p>Dear ${name},</p>
          <p>Your Valhaverly Steward Partner account has been <strong>suspended</strong> and portal access has been disabled.</p>
          ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
          <p>Please contact <a href="mailto:partners@valhaverly.com">partners@valhaverly.com</a> if you have questions.</p>
        `),
        text: `Dear ${name}, your partner account has been suspended.${data.reason ? ` Reason: ${data.reason}` : ''}`,
      };

    case 'reinstated':
      return {
        subject: 'Your Valhaverly Partner Account Has Been Reinstated',
        html: wrapEmail(`
          <p>Dear ${name},</p>
          <p>Your Valhaverly Steward Partner account has been <strong>reinstated</strong>. Portal access has been restored.</p>
          <p><a href="https://valhaverly.com/agent-login" style="display:inline-block;background:#f0b429;color:#121a2e;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:600;">Sign In to Partner Portal</a></p>
        `),
        text: `Dear ${name}, your partner account has been reinstated. Sign in at valhaverly.com/agent-login`,
      };

    case 'custom':
      return {
        subject: 'Message from Valhaverly Partner Team',
        html: wrapEmail(`<p>Dear ${name},</p>${data.customBody || '<p></p>'}`),
        text: `Dear ${name}, ${(data.customBody || '').replace(/<[^>]+>/g, '')}`,
      };

    default:
      return { subject: 'Valhaverly Partner Update', html: wrapEmail(`<p>Dear ${name},</p>`), text: `Dear ${name},` };
  }
}
