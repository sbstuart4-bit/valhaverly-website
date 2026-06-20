import { NextRequest, NextResponse } from 'next/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trim(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function buildAgentPartnerNotes(body: Record<string, unknown>): string {
  const lines = [
    '[Agent Partner Application]',
    `Brokerage: ${trim(body.brokerage)}`,
    `Region: ${trim(body.region)}`,
    `Website: ${trim(body.website) || '—'}`,
    `Transactions annually: ${trim(body.transactionsAnnually)}`,
    `Property specialties: ${trim(body.propertySpecialties)}`,
    `Interest: ${trim(body.interestReason)}`,
  ];
  return lines.join('\n');
}

function validateAgentPartner(body: Record<string, unknown>) {
  const firstName = trim(body.firstName);
  const lastName = trim(body.lastName);
  const email = trim(body.email);
  const phone = trim(body.phone);
  const brokerage = trim(body.brokerage);
  const region = trim(body.region);
  const transactionsAnnually = trim(body.transactionsAnnually);
  const propertySpecialties = trim(body.propertySpecialties);
  const interestReason = trim(body.interestReason);

  if (!firstName || firstName.length < 2) {
    return { error: 'Please enter your first name.' };
  }

  if (!lastName || lastName.length < 2) {
    return { error: 'Please enter your last name.' };
  }

  if (!email || !EMAIL_RE.test(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  if (!phone) {
    return { error: 'Please enter your phone number.' };
  }

  if (!brokerage) {
    return { error: 'Please enter your brokerage.' };
  }

  if (!region) {
    return { error: 'Please enter your region.' };
  }

  if (!transactionsAnnually) {
    return { error: 'Please select your annual transaction volume.' };
  }

  if (!propertySpecialties) {
    return { error: 'Please select at least one property specialty.' };
  }

  if (!interestReason || interestReason.length < 10) {
    return { error: 'Please tell us why you are interested in Valhaverly.' };
  }

  return {
    payload: {
      name: `${firstName} ${lastName}`,
      email,
      phone,
      assetType: 'Agent Partner Application',
      location: region,
      circleSize: transactionsAnnually,
      role: 'Real Estate Agent',
      bookingMethod: propertySpecialties,
      contributions: brokerage,
      biggestChallenge: trim(body.website) || '—',
      notes: buildAgentPartnerNotes(body),
      formType: 'agent-partner',
    },
  };
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const formType = trim(body.formType) || 'early-access';
  let payload: Record<string, string>;

  if (formType === 'agent-partner') {
    const result = validateAgentPartner(body);
    if ('error' in result) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }
    payload = result.payload;
  } else {
    const name = trim(body.name);
    const email = trim(body.email);

    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please enter your full name.' },
        { status: 400 },
      );
    }

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 },
      );
    }

    payload = {
      name,
      email,
      phone: trim(body.phone),
      assetType: trim(body.assetType),
      location: trim(body.location),
      circleSize: trim(body.circleSize),
      role: trim(body.role),
      bookingMethod: trim(body.bookingMethod),
      contributions: trim(body.contributions),
      biggestChallenge: trim(body.biggestChallenge),
      notes: trim(body.notes),
      formType: 'early-access',
    };
  }

  const sheetUrl = process.env.INTAKE_SHEET_URL;
  if (sheetUrl) {
    try {
      const sheetRes = await fetch(sheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!sheetRes.ok) {
        return NextResponse.json(
          { success: false, error: 'Unable to save your submission. Please try again.' },
          { status: 502 },
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Unable to save your submission. Please try again.' },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({ success: true });
}
