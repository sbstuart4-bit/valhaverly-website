import {
  getSupabaseAdmin,
  isSupabaseConfigured,
  VERIFICATION_BUCKET,
  type PartnerApplicationRow,
} from '@/lib/supabase/server';
import { applicationToRow, rowToApplication } from './mappers';
import type { ApplicationSummary } from '@/lib/admin/types';
import { toApplicationSummary } from './admin-actions';
import { getDemoApplications } from './seed-data';
import type { AuditEntry, PartnerApplication, PartnerStatus } from './types';
import {
  buildReferralUrl,
  generateApplicationId,
  generatePartnerId,
  generateReferralCode,
  getDemoPasswordHash,
  getInitials,
} from './utils';

function audit(action: string, actor = 'system'): AuditEntry {
  return { action, timestamp: new Date().toISOString(), actor };
}

function emptyApplication(email = '') {
  const now = new Date().toISOString();
  return {
    id: generateApplicationId(),
    status: 'Draft' as PartnerStatus,
    personal: {
      firstName: '',
      lastName: '',
      email,
      phone: '',
      linkedIn: '',
    },
    professional: {
      brokerageName: '',
      licenseNumber: '',
      provinceState: '',
      primaryMarket: '',
      specialties: [] as string[],
      yearsInRealEstate: '',
      annualTransactions: '',
    },
    market: {
      primaryRegion: '',
      secondaryRegions: '',
      serviceRadius: '',
    },
    partnerFit: {
      interestReason: '',
      postClosingSupport: '',
      recreationalPropertiesAnnually: '',
    },
    verification: {},
    agreement: {
      acceptedTerms: false,
      acceptedPrivacy: false,
      certifiedAccurate: false,
    },
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
    auditTrail: [audit('Application created', 'applicant')],
  } satisfies PartnerApplication;
}

async function findRowByAppId(id: string) {
  const supabase = getSupabaseAdmin();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (isUuid) {
  const { data } = await supabase
    .from('partner_applications')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (data) return data as PartnerApplicationRow;
  }

  const { data } = await supabase
    .from('partner_applications')
    .select('*')
    .eq('legacy_id', id)
    .maybeSingle();

  return (data as PartnerApplicationRow | null) ?? null;
}

async function readMeta(): Promise<{ nextPartnerSequence: number }> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('partner_meta')
    .select('value')
    .eq('key', 'next_partner_sequence')
    .maybeSingle();

  const value = (data as { value?: unknown } | null)?.value;
  if (typeof value === 'number') return { nextPartnerSequence: value };
  if (typeof value === 'string') return { nextPartnerSequence: parseInt(value, 10) || 3 };
  return { nextPartnerSequence: 3 };
}

async function writeMeta(nextPartnerSequence: number) {
  const supabase = getSupabaseAdmin();
  await supabase.from('partner_meta').upsert({
    key: 'next_partner_sequence',
    value: nextPartnerSequence,
  });
}

export async function seedDemoApplicationsSupabase() {
  const supabase = getSupabaseAdmin();

  const { data: meta, error: metaError } = await supabase
    .from('partner_meta')
    .select('value')
    .eq('key', 'demo_seeded')
    .maybeSingle();

  if (metaError) {
    throw new Error(metaError.message);
  }

  const seeded = (meta as { value?: unknown } | null)?.value;
  if (seeded === true || seeded === 'true') return;

  const now = new Date().toISOString();
  const demos = getDemoApplications(now);

  for (const app of demos) {
    const row = applicationToRow(app);
    await supabase.from('partner_applications').upsert(
      {
        legacy_id: app.id,
        status: row.status,
        email: row.email,
        password_hash: row.password_hash,
        personal: row.personal,
        professional: row.professional,
        market: row.market,
        partner_fit: row.partner_fit,
        verification: row.verification,
        agreement: row.agreement,
        partner_profile: row.partner_profile,
        audit_trail: row.audit_trail,
        email_verified: row.email_verified,
        application_date: row.application_date,
        submitted_at: row.submitted_at,
        reviewed_at: row.reviewed_at,
        created_at: app.createdAt,
        updated_at: app.updatedAt,
      },
      { onConflict: 'legacy_id' },
    );
  }

  await supabase.from('partner_meta').upsert({ key: 'demo_seeded', value: true });
  await supabase.from('partner_meta').upsert({ key: 'next_partner_sequence', value: 3 });
}

export async function listApplicationsSupabase(options?: {
  status?: string;
  search?: string;
}): Promise<ApplicationSummary[]> {
  await seedDemoApplicationsSupabase();
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('partner_applications')
    .select('*')
    .order('updated_at', { ascending: false });

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let rows = (data || []) as PartnerApplicationRow[];
  const summaries = rows.map((row) => toApplicationSummary(rowToApplication(row)));

  if (options?.search) {
    const q = options.search.toLowerCase();
    return summaries.filter(
      (a) =>
        a.email.toLowerCase().includes(q) ||
        a.firstName.toLowerCase().includes(q) ||
        a.lastName.toLowerCase().includes(q) ||
        a.brokerageName.toLowerCase().includes(q) ||
        (a.partnerId || '').toLowerCase().includes(q),
    );
  }

  return summaries;
}

export async function getApplicationSupabase(id: string): Promise<PartnerApplication | null> {
  await seedDemoApplicationsSupabase();
  const row = await findRowByAppId(id);
  return row ? rowToApplication(row) : null;
}

export async function getApplicationByEmailSupabase(
  email: string,
): Promise<PartnerApplication | null> {
  await seedDemoApplicationsSupabase();
  const supabase = getSupabaseAdmin();
  const normalized = email.trim().toLowerCase();

  const { data } = await supabase
    .from('partner_applications')
    .select('*')
    .eq('email', normalized)
    .maybeSingle();

  return data ? rowToApplication(data as PartnerApplicationRow) : null;
}

export async function saveApplicationSupabase(
  app: PartnerApplication,
): Promise<PartnerApplication> {
  const supabase = getSupabaseAdmin();
  app.updatedAt = new Date().toISOString();

  const existing = await findRowByAppId(app.id);
  const row = applicationToRow(app, existing?.id);

  if (existing) {
    const { data, error } = await supabase
      .from('partner_applications')
      .update(row)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return rowToApplication(data as PartnerApplicationRow);
  }

  const { data, error } = await supabase
    .from('partner_applications')
    .insert({
      legacy_id: app.id.startsWith('app_') ? app.id : null,
      status: row.status,
      email: row.email || app.personal.email.toLowerCase(),
      password_hash: row.password_hash,
      personal: row.personal,
      professional: row.professional,
      market: row.market,
      partner_fit: row.partner_fit,
      verification: row.verification,
      agreement: row.agreement,
      partner_profile: row.partner_profile,
      audit_trail: row.audit_trail,
      email_verified: row.email_verified,
      application_date: row.application_date,
      submitted_at: row.submitted_at,
      reviewed_at: row.reviewed_at,
      created_at: app.createdAt,
      updated_at: app.updatedAt,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToApplication(data);
}

export async function createApplicationSupabase(email = ''): Promise<PartnerApplication> {
  const app = emptyApplication(email);
  if (email) app.personal.email = email.toLowerCase();
  return saveApplicationSupabase(app);
}

export async function approveApplicationSupabase(
  id: string,
): Promise<PartnerApplication | null> {
  const app = await getApplicationSupabase(id);
  if (!app) return null;

  const meta = await readMeta();
  const sequence = meta.nextPartnerSequence;
  const partnerId = generatePartnerId(sequence);
  const referralCode = generateReferralCode(
    app.personal.firstName,
    app.personal.lastName,
    sequence,
  );

  app.status = 'Approved';
  app.reviewedAt = new Date().toISOString();
  app.partnerProfile = {
    partnerId,
    referralCode,
    referralUrl: buildReferralUrl(referralCode),
  };
  if (!app.passwordHash) app.passwordHash = getDemoPasswordHash();
  app.auditTrail.push(audit(`Application approved — ${partnerId}`, 'admin'));

  await writeMeta(sequence + 1);
  return saveApplicationSupabase(app);
}

export async function uploadVerificationFileSupabase(
  applicationId: string,
  field: string,
  file: File,
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const row = await findRowByAppId(applicationId);
  if (!row) throw new Error('Application not found.');

  const storageId = row.id;
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const storagePath = `${storageId}/${field}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(VERIFICATION_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (error) throw new Error(error.message);
  return storagePath;
}

export function isUsingSupabase() {
  return isSupabaseConfigured();
}

export function applicationToPortalAgent(app: PartnerApplication) {
  const profile = app.partnerProfile;
  if (!profile) return null;

  const isSarah = app.id.includes('sarah');

  return {
    id: app.id,
    name: `${app.personal.firstName} ${app.personal.lastName}`,
    email: app.personal.email,
    phone: app.personal.phone,
    region: app.market.primaryRegion,
    joinDate: app.reviewedAt
      ? new Date(app.reviewedAt).toLocaleDateString('en-CA', {
          month: 'long',
          year: 'numeric',
        })
      : 'Partner',
    initials: getInitials(app.personal.firstName, app.personal.lastName),
    referralCode: profile.referralCode,
    partnerId: profile.partnerId,
    referralUrl: profile.referralUrl,
    status: app.status,
    stats: {
      totalReferrals: app.status === 'Approved' ? 7 : 0,
      activeCircles: app.status === 'Approved' ? 5 : 0,
      pendingCircles: app.status === 'Approved' ? 2 : 0,
      conversionRate: 71,
      totalCommission: isSarah ? 2940 : 2100,
      pendingCommission: isSarah ? 560 : 350,
    },
    referrals: isSarah
      ? [
          {
            id: 'r1',
            circleName: 'Lake of Bays Retreat',
            propertyType: 'Lake House',
            status: 'active',
            plan: 'Premium',
            referralDate: 'Jan 2026',
            commission: 420,
            commissionStatus: 'paid',
          },
          {
            id: 'r2',
            circleName: 'Muskoka Point Cottage',
            propertyType: 'Cottage',
            status: 'active',
            plan: 'Standard',
            referralDate: 'Feb 2026',
            commission: 280,
            commissionStatus: 'paid',
          },
          {
            id: 'r3',
            circleName: 'Rosseau Family Lodge',
            propertyType: 'Lake House',
            status: 'pending',
            plan: 'Premium',
            referralDate: 'May 2026',
            commission: 560,
            commissionStatus: 'pending',
          },
        ]
      : [
          {
            id: 'r1',
            circleName: 'Georgian Bay Harbour House',
            propertyType: 'Lake House',
            status: 'active',
            plan: 'Premium',
            referralDate: 'Mar 2026',
            commission: 490,
            commissionStatus: 'paid',
          },
          {
            id: 'r2',
            circleName: 'Penetang Cottage Circle',
            propertyType: 'Cottage',
            status: 'pending',
            plan: 'Standard',
            referralDate: 'Jun 2026',
            commission: 350,
            commissionStatus: 'pending',
          },
        ],
  };
}

export function isPortalAccessible(status: PartnerStatus): boolean {
  return status === 'Approved';
}
