import type { ApplicationSummary } from '@/lib/admin/types';
import type { AuditEntry, PartnerApplication, PartnerStatus } from './types';

function audit(action: string, actor = 'admin'): AuditEntry {
  return { action, timestamp: new Date().toISOString(), actor };
}

export function toApplicationSummary(app: PartnerApplication): ApplicationSummary {
  return {
    id: app.id,
    status: app.status,
    email: app.personal.email,
    firstName: app.personal.firstName,
    lastName: app.personal.lastName,
    brokerageName: app.professional.brokerageName,
    primaryMarket: app.professional.primaryMarket || app.market.primaryRegion,
    partnerId: app.partnerProfile?.partnerId,
    submittedAt: app.submittedAt,
    reviewedAt: app.reviewedAt,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  };
}

export async function rejectApplication(
  app: PartnerApplication,
  reason: string,
  actor: string,
): Promise<PartnerApplication> {
  app.status = 'Rejected';
  app.reviewedAt = new Date().toISOString();
  app.auditTrail.push(audit(`Application rejected${reason ? ` — ${reason}` : ''}`, actor));
  return app;
}

export async function suspendApplication(
  app: PartnerApplication,
  reason: string,
  actor: string,
): Promise<PartnerApplication> {
  if (app.status !== 'Approved') {
    throw new Error('Only approved partners can be suspended.');
  }
  app.status = 'Suspended';
  app.reviewedAt = new Date().toISOString();
  app.auditTrail.push(audit(`Partner suspended${reason ? ` — ${reason}` : ''}`, actor));
  return app;
}

export async function reinstateApplication(
  app: PartnerApplication,
  actor: string,
): Promise<PartnerApplication> {
  if (app.status !== 'Suspended') {
    throw new Error('Only suspended partners can be reinstated.');
  }
  if (!app.partnerProfile) {
    throw new Error('Partner profile missing — cannot reinstate.');
  }
  app.status = 'Approved';
  app.reviewedAt = new Date().toISOString();
  app.auditTrail.push(audit('Partner reinstated — portal access restored', actor));
  return app;
}

export async function markUnderReview(
  app: PartnerApplication,
  actor: string,
): Promise<PartnerApplication> {
  app.status = 'Under Review';
  app.auditTrail.push(audit('Moved to Under Review', actor));
  return app;
}

export function canTransition(from: PartnerStatus, to: PartnerStatus): boolean {
  const allowed: Record<PartnerStatus, PartnerStatus[]> = {
    Draft: ['Under Review'],
    Submitted: ['Under Review', 'Approved', 'Rejected'],
    'Under Review': ['Approved', 'Rejected'],
    Approved: ['Suspended'],
    Rejected: [],
    Suspended: ['Approved'],
  };
  return allowed[from]?.includes(to) ?? false;
}
