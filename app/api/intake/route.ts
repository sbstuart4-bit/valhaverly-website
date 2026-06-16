import { NextRequest, NextResponse } from 'next/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trim(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
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

  const payload = {
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
  };

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
