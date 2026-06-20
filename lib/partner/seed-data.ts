import type { AuditEntry, PartnerApplication } from './types';
import { getDemoPasswordHash } from './utils';

function audit(action: string, actor = 'system'): AuditEntry {
  return { action, timestamp: new Date().toISOString(), actor };
}

export function getDemoApplications(now: string): PartnerApplication[] {
  const passwordHash = getDemoPasswordHash();

  return [
    {
      id: 'app_demo_sarah_jones',
      status: 'Approved',
      passwordHash,
      personal: {
        firstName: 'Sarah',
        lastName: 'Jones',
        email: 'sarah.jones@valhaverly.com',
        phone: '+1 (705) 555-0101',
        linkedIn: 'https://linkedin.com/in/sarahjones',
      },
      professional: {
        brokerageName: 'Muskoka Legacy Realty',
        licenseNumber: 'ON-4829103',
        provinceState: 'Ontario',
        primaryMarket: 'Muskoka',
        specialties: ['Cottage Properties', 'Lake Houses', 'Vacation Homes'],
        yearsInRealEstate: '12',
        annualTransactions: '16–30',
      },
      market: {
        primaryRegion: 'Muskoka',
        secondaryRegions: 'Haliburton, Kawartha Lakes',
        serviceRadius: '120 km',
      },
      partnerFit: {
        interestReason:
          'My clients often purchase cottages for multi-generational use and need stewardship guidance after closing.',
        postClosingSupport:
          'I provide seasonal checklists, local vendor introductions, and family ownership planning resources.',
        recreationalPropertiesAnnually: '8–12',
      },
      verification: {},
      agreement: {
        acceptedTerms: true,
        acceptedPrivacy: true,
        certifiedAccurate: true,
        acceptedAt: now,
      },
      partnerProfile: {
        partnerId: 'VAL-0001',
        referralCode: 'SJONES001',
        referralUrl: 'https://valhaverly.com/agent/SJONES001',
      },
      auditTrail: [
        audit('Application created', 'applicant'),
        audit('Application submitted', 'applicant'),
        audit('Application under review', 'admin'),
        audit('Application approved — VAL-0001', 'admin'),
      ],
      applicationDate: '2025-11-12',
      emailVerified: true,
      createdAt: '2025-11-10T14:00:00.000Z',
      updatedAt: now,
      submittedAt: '2025-11-12T09:30:00.000Z',
      reviewedAt: '2025-11-14T16:00:00.000Z',
    },
    {
      id: 'app_demo_michael_reid',
      status: 'Approved',
      passwordHash,
      personal: {
        firstName: 'Michael',
        lastName: 'Reid',
        email: 'michael.reid@valhaverly.com',
        phone: '+1 (416) 555-0202',
        linkedIn: 'https://linkedin.com/in/michaelreid',
      },
      professional: {
        brokerageName: 'Georgian Bay Estates',
        licenseNumber: 'ON-3910284',
        provinceState: 'Ontario',
        primaryMarket: 'Georgian Bay',
        specialties: ['Lake Houses', 'Luxury Properties', 'Shared Ownership Properties'],
        yearsInRealEstate: '9',
        annualTransactions: '11–20',
      },
      market: {
        primaryRegion: 'Georgian Bay',
        secondaryRegions: 'Muskoka',
        serviceRadius: '90 km',
      },
      partnerFit: {
        interestReason:
          'I specialize in legacy recreational properties and want a trusted platform to recommend post-closing.',
        postClosingSupport:
          'Quarterly owner briefings and shared-ownership education for buyer families.',
        recreationalPropertiesAnnually: '6–10',
      },
      verification: {},
      agreement: {
        acceptedTerms: true,
        acceptedPrivacy: true,
        certifiedAccurate: true,
        acceptedAt: now,
      },
      partnerProfile: {
        partnerId: 'VAL-0002',
        referralCode: 'MREID002',
        referralUrl: 'https://valhaverly.com/agent/MREID002',
      },
      auditTrail: [
        audit('Application created', 'applicant'),
        audit('Application submitted', 'applicant'),
        audit('Application approved — VAL-0002', 'admin'),
      ],
      applicationDate: '2025-12-03',
      emailVerified: true,
      createdAt: '2025-12-01T10:00:00.000Z',
      updatedAt: now,
      submittedAt: '2025-12-03T11:00:00.000Z',
      reviewedAt: '2025-12-05T14:00:00.000Z',
    },
    {
      id: 'app_demo_amanda_chen',
      status: 'Under Review',
      passwordHash,
      personal: {
        firstName: 'Amanda',
        lastName: 'Chen',
        email: 'amanda.chen@valhaverly.com',
        phone: '+1 (613) 555-0303',
        linkedIn: '',
      },
      professional: {
        brokerageName: 'Kawartha Shoreline Group',
        licenseNumber: 'ON-5829104',
        provinceState: 'Ontario',
        primaryMarket: 'Kawartha Lakes',
        specialties: ['Cottage Properties', 'Cabins', 'Recreational Land'],
        yearsInRealEstate: '6',
        annualTransactions: '6–15',
      },
      market: {
        primaryRegion: 'Kawartha Lakes',
        secondaryRegions: 'Prince Edward County',
        serviceRadius: '75 km',
      },
      partnerFit: {
        interestReason: 'Many of my buyers are families purchasing their first shared cottage.',
        postClosingSupport: 'I host annual owner roundtables and share maintenance calendars.',
        recreationalPropertiesAnnually: '4–6',
      },
      verification: {},
      agreement: {
        acceptedTerms: true,
        acceptedPrivacy: true,
        certifiedAccurate: true,
        acceptedAt: now,
      },
      auditTrail: [
        audit('Application created', 'applicant'),
        audit('Application submitted', 'applicant'),
        audit('Application under review', 'admin'),
      ],
      applicationDate: '2026-06-10',
      emailVerified: false,
      createdAt: '2026-06-08T12:00:00.000Z',
      updatedAt: now,
      submittedAt: '2026-06-10T09:00:00.000Z',
    },
    {
      id: 'app_demo_david_miller',
      status: 'Rejected',
      passwordHash,
      personal: {
        firstName: 'David',
        lastName: 'Miller',
        email: 'david.miller@valhaverly.com',
        phone: '+1 (905) 555-0404',
        linkedIn: '',
      },
      professional: {
        brokerageName: 'Urban Property Partners',
        licenseNumber: 'ON-1029384',
        provinceState: 'Ontario',
        primaryMarket: 'Toronto',
        specialties: ['Luxury Properties'],
        yearsInRealEstate: '3',
        annualTransactions: '1–5',
      },
      market: {
        primaryRegion: 'Toronto',
        secondaryRegions: '',
        serviceRadius: '25 km',
      },
      partnerFit: {
        interestReason: 'Looking for referral income opportunities.',
        postClosingSupport: 'Minimal follow-up after closing.',
        recreationalPropertiesAnnually: '0–1',
      },
      verification: {},
      agreement: {
        acceptedTerms: true,
        acceptedPrivacy: true,
        certifiedAccurate: true,
        acceptedAt: now,
      },
      auditTrail: [
        audit('Application created', 'applicant'),
        audit('Application submitted', 'applicant'),
        audit('Application rejected — insufficient recreational property focus', 'admin'),
      ],
      applicationDate: '2026-05-20',
      emailVerified: false,
      createdAt: '2026-05-18T08:00:00.000Z',
      updatedAt: now,
      submittedAt: '2026-05-20T10:00:00.000Z',
      reviewedAt: '2026-05-22T11:00:00.000Z',
    },
  ];
}
