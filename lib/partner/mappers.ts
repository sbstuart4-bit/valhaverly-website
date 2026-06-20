import type { PartnerApplicationRow } from '@/lib/supabase/server';
import type {
  AuditEntry,
  PartnerAgreement,
  PartnerApplication,
  PartnerFitInfo,
  PartnerMarketInfo,
  PartnerPersonalInfo,
  PartnerProfessionalInfo,
  PartnerProfile,
  PartnerStatus,
  PartnerVerificationFiles,
} from './types';

export function appIdFromRow(row: PartnerApplicationRow): string {
  return row.legacy_id || row.id;
}

export function rowToApplication(row: PartnerApplicationRow): PartnerApplication {
  return {
    id: appIdFromRow(row),
    status: row.status as PartnerStatus,
    passwordHash: row.password_hash || undefined,
    personal: row.personal as unknown as PartnerPersonalInfo,
    professional: row.professional as unknown as PartnerProfessionalInfo,
    market: row.market as unknown as PartnerMarketInfo,
    partnerFit: row.partner_fit as unknown as PartnerFitInfo,
    verification: row.verification as unknown as PartnerVerificationFiles,
    agreement: row.agreement as unknown as PartnerAgreement,
    partnerProfile: (row.partner_profile as unknown as PartnerProfile | null) || undefined,
    auditTrail: row.audit_trail as AuditEntry[],
    emailVerified: row.email_verified,
    applicationDate: row.application_date || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    submittedAt: row.submitted_at || undefined,
    reviewedAt: row.reviewed_at || undefined,
  };
}

export function applicationToRow(
  app: PartnerApplication,
  dbId?: string,
): Partial<PartnerApplicationRow> {
  const email = app.personal.email?.toLowerCase() || '';
  return {
    id: dbId,
    legacy_id: app.id.startsWith('app_') ? app.id : null,
    status: app.status,
    email,
    password_hash: app.passwordHash || null,
    personal: app.personal as unknown as Record<string, unknown>,
    professional: app.professional as unknown as Record<string, unknown>,
    market: app.market as unknown as Record<string, unknown>,
    partner_fit: app.partnerFit as unknown as Record<string, unknown>,
    verification: app.verification as unknown as Record<string, unknown>,
    agreement: app.agreement as unknown as Record<string, unknown>,
    partner_profile: (app.partnerProfile as unknown as Record<string, unknown>) || null,
    audit_trail: app.auditTrail,
    email_verified: app.emailVerified ?? false,
    application_date: app.applicationDate || null,
    submitted_at: app.submittedAt || null,
    reviewed_at: app.reviewedAt || null,
    updated_at: app.updatedAt,
  };
}
