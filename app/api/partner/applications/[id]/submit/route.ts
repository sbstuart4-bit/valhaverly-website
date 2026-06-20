import { NextRequest } from 'next/server';
import { errorResponse, jsonResponse } from '@/lib/partner/api';
import { getApplication, saveApplication } from '@/lib/partner/store';

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const app = await getApplication(id);
  if (!app) return errorResponse('Application not found.', 404);
  if (app.status !== 'Draft') return errorResponse('Application has already been submitted.', 403);

  const required = [
    app.personal.firstName,
    app.personal.lastName,
    app.personal.email,
    app.personal.phone,
    app.professional.brokerageName,
    app.professional.licenseNumber,
    app.market.primaryRegion,
    app.partnerFit.interestReason,
    app.agreement.acceptedTerms,
    app.agreement.acceptedPrivacy,
    app.agreement.certifiedAccurate,
  ];

  if (required.some((v) => !v)) {
    return errorResponse('Please complete all required steps before submitting.');
  }

  const hasVerification =
    app.verification.businessCard &&
    app.verification.headshot &&
    app.verification.license &&
    app.verification.brokerageVerification;

  if (!hasVerification) {
    return errorResponse('Please upload all required verification documents.');
  }

  if (!app.passwordHash) {
    return errorResponse('Please set your portal password before submitting.');
  }

  const now = new Date().toISOString();
  app.status = 'Submitted';
  app.submittedAt = now;
  app.applicationDate = now.split('T')[0];
  app.auditTrail.push({ action: 'Application submitted', timestamp: now, actor: 'applicant' });
  app.auditTrail.push({ action: 'Application under review', timestamp: now, actor: 'system' });

  // Demo: auto-transition to Under Review
  app.status = 'Under Review';

  await saveApplication(app);

  return jsonResponse({
    success: true,
    application: {
      id: app.id,
      status: app.status,
      submittedAt: app.submittedAt,
    },
  });
}
