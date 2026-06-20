export interface AdminSession {
  email: string;
  role: 'admin';
  name: string;
  issuedAt: string;
  expiresAt: string;
}

export const ADMIN_SESSION_COOKIE = 'valhaverly_admin_session';
export const ADMIN_SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

export interface ApplicationSummary {
  id: string;
  status: string;
  email: string;
  firstName: string;
  lastName: string;
  brokerageName: string;
  primaryMarket: string;
  partnerId?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}
