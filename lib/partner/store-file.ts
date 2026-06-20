import { mkdir, readFile, readdir, writeFile } from 'fs/promises';
import path from 'path';
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
} from './utils';

const DATA_DIR = path.join(process.cwd(), 'data', 'partner-applications');
const UPLOADS_DIR = path.join(process.cwd(), 'data', 'partner-uploads');
const META_FILE = path.join(process.cwd(), 'data', 'partner-meta.json');

function audit(action: string, actor = 'system'): AuditEntry {
  return { action, timestamp: new Date().toISOString(), actor };
}

async function ensureDirs() {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(UPLOADS_DIR, { recursive: true });
}

async function readMeta(): Promise<{ nextPartnerSequence: number }> {
  try {
    const raw = await readFile(META_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { nextPartnerSequence: 3 };
  }
}

async function writeMeta(meta: { nextPartnerSequence: number }) {
  await writeFile(META_FILE, JSON.stringify(meta, null, 2), 'utf8');
}

function applicationPath(id: string) {
  return path.join(DATA_DIR, `${id}.json`);
}

export async function listApplicationsFile(options?: {
  status?: string;
  search?: string;
}): Promise<ApplicationSummary[]> {
  await ensureDirs();
  await seedDemoApplicationsFile();
  const files = await readdir(DATA_DIR);
  const apps: PartnerApplication[] = [];

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    try {
      const app = JSON.parse(await readFile(path.join(DATA_DIR, file), 'utf8')) as PartnerApplication;
      apps.push(app);
    } catch {
      // skip corrupt files
    }
  }

  return filterSummaries(apps.map(toApplicationSummary), options);
}

function filterSummaries(
  summaries: ApplicationSummary[],
  options?: { status?: string; search?: string },
): ApplicationSummary[] {
  let result = summaries;

  if (options?.status && options.status !== 'all') {
    result = result.filter((a) => a.status === options.status);
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    result = result.filter(
      (a) =>
        a.email.toLowerCase().includes(q) ||
        a.firstName.toLowerCase().includes(q) ||
        a.lastName.toLowerCase().includes(q) ||
        a.brokerageName.toLowerCase().includes(q) ||
        (a.partnerId || '').toLowerCase().includes(q),
    );
  }

  return result.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function getApplicationFile(id: string): Promise<PartnerApplication | null> {
  await ensureDirs();
  try {
    const raw = await readFile(applicationPath(id), 'utf8');
    return JSON.parse(raw) as PartnerApplication;
  } catch {
    return null;
  }
}

export async function getApplicationByEmailFile(
  email: string,
): Promise<PartnerApplication | null> {
  await ensureDirs();
  await seedDemoApplicationsFile();
  const normalized = email.trim().toLowerCase();
  const files = await readdir(DATA_DIR);
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const app = JSON.parse(await readFile(path.join(DATA_DIR, file), 'utf8')) as PartnerApplication;
    if (app.personal.email.toLowerCase() === normalized) return app;
  }
  return null;
}

export async function saveApplicationFile(app: PartnerApplication): Promise<PartnerApplication> {
  await ensureDirs();
  app.updatedAt = new Date().toISOString();
  await writeFile(applicationPath(app.id), JSON.stringify(app, null, 2), 'utf8');
  return app;
}

export async function createApplicationFile(email = ''): Promise<PartnerApplication> {
  const now = new Date().toISOString();
  const app: PartnerApplication = {
    id: generateApplicationId(),
    status: 'Draft',
    personal: { firstName: '', lastName: '', email, phone: '', linkedIn: '' },
    professional: {
      brokerageName: '',
      licenseNumber: '',
      provinceState: '',
      primaryMarket: '',
      specialties: [],
      yearsInRealEstate: '',
      annualTransactions: '',
    },
    market: { primaryRegion: '', secondaryRegions: '', serviceRadius: '' },
    partnerFit: {
      interestReason: '',
      postClosingSupport: '',
      recreationalPropertiesAnnually: '',
    },
    verification: {},
    agreement: { acceptedTerms: false, acceptedPrivacy: false, certifiedAccurate: false },
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
    auditTrail: [audit('Application created', 'applicant')],
  };
  return saveApplicationFile(app);
}

export async function approveApplicationFile(id: string): Promise<PartnerApplication | null> {
  const app = await getApplicationFile(id);
  if (!app) return null;

  const meta = await readMeta();
  const sequence = meta.nextPartnerSequence;
  const referralCode = generateReferralCode(app.personal.firstName, app.personal.lastName, sequence);
  app.status = 'Approved';
  app.reviewedAt = new Date().toISOString();
  app.partnerProfile = {
    partnerId: generatePartnerId(sequence),
    referralCode,
    referralUrl: buildReferralUrl(referralCode),
  };
  if (!app.passwordHash) app.passwordHash = getDemoPasswordHash();
  app.auditTrail.push(audit(`Application approved — ${app.partnerProfile.partnerId}`, 'admin'));
  await writeMeta({ nextPartnerSequence: sequence + 1 });
  return saveApplicationFile(app);
}

export function getUploadsDir(applicationId: string) {
  return path.join(UPLOADS_DIR, applicationId);
}

export async function seedDemoApplicationsFile() {
  await ensureDirs();
  const marker = path.join(DATA_DIR, '.seeded');
  try {
    await readFile(marker, 'utf8');
    return;
  } catch {
    // seed
  }

  const now = new Date().toISOString();
  for (const app of getDemoApplications(now)) {
    await writeFile(applicationPath(app.id), JSON.stringify(app, null, 2), 'utf8');
  }
  await writeMeta({ nextPartnerSequence: 3 });
  await writeFile(marker, now, 'utf8');
}

export async function uploadVerificationFileLocal(
  applicationId: string,
  field: string,
  file: File,
): Promise<string> {
  const uploadDir = getUploadsDir(applicationId);
  await mkdir(uploadDir, { recursive: true });
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const safeName = `${field}-${Date.now()}.${ext}`;
  const filePath = path.join(uploadDir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);
  return safeName;
}

export function isPortalAccessibleFile(status: PartnerStatus): boolean {
  return status === 'Approved';
}
