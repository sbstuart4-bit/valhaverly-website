import { NextRequest } from 'next/server';
import { errorResponse, getSessionFromRequest, jsonResponse } from '@/lib/partner/api';
import { getApplication, saveApplication } from '@/lib/partner/store';
import { EMAIL_RE, PHONE_RE, hashPassword, trim } from '@/lib/partner/utils';
import { PROPERTY_SPECIALTIES } from '@/lib/partner/types';

type Params = { params: Promise<{ id: string }> };

function validateStep(step: number, body: Record<string, unknown>) {
  if (step === 1) {
    const firstName = trim(body.firstName);
    const lastName = trim(body.lastName);
    const email = trim(body.email);
    const phone = trim(body.phone);
    if (!firstName || firstName.length < 2) return 'Please enter your first name.';
    if (!lastName || lastName.length < 2) return 'Please enter your last name.';
    if (!email || !EMAIL_RE.test(email)) return 'Please enter a valid email address.';
    if (!phone || !PHONE_RE.test(phone)) return 'Please enter a valid mobile phone number.';
    return null;
  }

  if (step === 2) {
    if (!trim(body.brokerageName)) return 'Please enter your brokerage name.';
    if (!trim(body.licenseNumber)) return 'Please enter your license number.';
    if (!trim(body.provinceState)) return 'Please enter your province or state.';
    if (!trim(body.primaryMarket)) return 'Please enter your primary market.';
    const specialties = Array.isArray(body.specialties) ? body.specialties : [];
    if (specialties.length === 0) return 'Please select at least one property specialty.';
    if (!trim(body.yearsInRealEstate)) return 'Please select years in real estate.';
    if (!trim(body.annualTransactions)) return 'Please select annual transactions.';
    return null;
  }

  if (step === 3) {
    if (!trim(body.primaryRegion)) return 'Please enter your primary region.';
    if (!trim(body.serviceRadius)) return 'Please enter your service radius.';
    return null;
  }

  if (step === 4) {
    if (!trim(body.interestReason) || trim(body.interestReason).length < 20) {
      return 'Please share why you are interested (at least 20 characters).';
    }
    if (!trim(body.postClosingSupport) || trim(body.postClosingSupport).length < 20) {
      return 'Please describe how you support clients after closing.';
    }
    if (!trim(body.recreationalPropertiesAnnually)) {
      return 'Please estimate recreational properties sold annually.';
    }
    return null;
  }

  if (step === 6) {
    if (body.acceptedTerms !== true) return 'You must agree to the Partner Terms.';
    if (body.acceptedPrivacy !== true) return 'You must agree to the Privacy Policy.';
    if (body.certifiedAccurate !== true) return 'You must certify that your information is accurate.';
    const password = trim(body.password);
    const confirmPassword = trim(body.confirmPassword);
    if (!password || password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  }

  return null;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const app = await getApplication(id);
  if (!app) return errorResponse('Application not found.', 404);

  const session = getSessionFromRequest(_request);
  const isOwner = session?.applicationId === id;

  return jsonResponse({
    success: true,
    application: {
      id: app.id,
      status: app.status,
      personal: isOwner || app.status === 'Approved' ? app.personal : { email: app.personal.email },
      professional: isOwner ? app.professional : undefined,
      market: isOwner ? app.market : undefined,
      partnerFit: isOwner ? app.partnerFit : undefined,
      verification: isOwner ? Object.keys(app.verification) : undefined,
      agreement: isOwner ? app.agreement : undefined,
      partnerProfile: app.partnerProfile,
      applicationDate: app.applicationDate || app.submittedAt,
      submittedAt: app.submittedAt,
      reviewedAt: app.reviewedAt,
      auditTrail: isOwner ? app.auditTrail : undefined,
    },
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const app = await getApplication(id);
  if (!app) return errorResponse('Application not found.', 404);
  if (app.status !== 'Draft') return errorResponse('This application can no longer be edited.', 403);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid request body.');
  }

  const step = Number(body.step);
  if (!step || step < 1 || step > 6) return errorResponse('Invalid step.');

  const validationError = validateStep(step, body);
  if (validationError) return errorResponse(validationError);

  if (step === 1) {
    app.personal = {
      firstName: trim(body.firstName),
      lastName: trim(body.lastName),
      email: trim(body.email).toLowerCase(),
      phone: trim(body.phone),
      linkedIn: trim(body.linkedIn),
    };
  }

  if (step === 2) {
    const specialties = (Array.isArray(body.specialties) ? body.specialties : [])
      .map((s) => trim(s))
      .filter((s) => PROPERTY_SPECIALTIES.includes(s as (typeof PROPERTY_SPECIALTIES)[number]));
    app.professional = {
      brokerageName: trim(body.brokerageName),
      licenseNumber: trim(body.licenseNumber),
      provinceState: trim(body.provinceState),
      primaryMarket: trim(body.primaryMarket),
      specialties,
      yearsInRealEstate: trim(body.yearsInRealEstate),
      annualTransactions: trim(body.annualTransactions),
    };
  }

  if (step === 3) {
    app.market = {
      primaryRegion: trim(body.primaryRegion),
      secondaryRegions: trim(body.secondaryRegions),
      serviceRadius: trim(body.serviceRadius),
    };
  }

  if (step === 4) {
    app.partnerFit = {
      interestReason: trim(body.interestReason),
      postClosingSupport: trim(body.postClosingSupport),
      recreationalPropertiesAnnually: trim(body.recreationalPropertiesAnnually),
    };
  }

  if (step === 6) {
    app.agreement = {
      acceptedTerms: body.acceptedTerms === true,
      acceptedPrivacy: body.acceptedPrivacy === true,
      certifiedAccurate: body.certifiedAccurate === true,
      acceptedAt: new Date().toISOString(),
    };
    const password = trim(body.password);
    if (password) {
      app.passwordHash = hashPassword(password);
    }
  }

  app.auditTrail.push({
    action: `Step ${step} saved`,
    timestamp: new Date().toISOString(),
    actor: 'applicant',
  });

  await saveApplication(app);
  return jsonResponse({ success: true, application: { id: app.id, status: app.status, step } });
}
