export type PartnerStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Suspended';

export interface PartnerPersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedIn?: string;
}

export interface PartnerProfessionalInfo {
  brokerageName: string;
  licenseNumber: string;
  provinceState: string;
  primaryMarket: string;
  specialties: string[];
  yearsInRealEstate: string;
  annualTransactions: string;
}

export interface PartnerMarketInfo {
  primaryRegion: string;
  secondaryRegions?: string;
  serviceRadius: string;
}

export interface PartnerFitInfo {
  interestReason: string;
  postClosingSupport: string;
  recreationalPropertiesAnnually: string;
}

export interface PartnerVerificationFiles {
  businessCard?: string;
  headshot?: string;
  license?: string;
  brokerageVerification?: string;
}

export interface PartnerAgreement {
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  certifiedAccurate: boolean;
  acceptedAt?: string;
}

export interface PartnerProfile {
  partnerId: string;
  referralCode: string;
  referralUrl: string;
}

export interface AuditEntry {
  action: string;
  timestamp: string;
  actor?: string;
}

export interface PartnerApplication {
  id: string;
  status: PartnerStatus;
  passwordHash?: string;
  personal: PartnerPersonalInfo;
  professional: PartnerProfessionalInfo;
  market: PartnerMarketInfo;
  partnerFit: PartnerFitInfo;
  verification: PartnerVerificationFiles;
  agreement: PartnerAgreement;
  partnerProfile?: PartnerProfile;
  auditTrail: AuditEntry[];
  applicationDate?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  emailVerified?: boolean;
}

export interface PartnerSession {
  applicationId: string;
  email: string;
  role: 'agent';
  status: PartnerStatus;
  partnerId?: string;
  issuedAt: string;
  expiresAt: string;
}

export const PARTNER_STATUSES: PartnerStatus[] = [
  'Draft',
  'Submitted',
  'Under Review',
  'Approved',
  'Rejected',
  'Suspended',
];

export const PROPERTY_SPECIALTIES = [
  'Cottage Properties',
  'Lake Houses',
  'Cabins',
  'Recreational Land',
  'Family Farms',
  'Luxury Properties',
  'Shared Ownership Properties',
  'Vacation Homes',
] as const;

export const ALLOWED_UPLOAD_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const SESSION_COOKIE = 'valhaverly_partner_session';
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
