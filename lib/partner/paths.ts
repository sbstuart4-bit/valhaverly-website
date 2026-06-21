import os from 'os';
import path from 'path';

/** True on Vercel, Lambda, and similar read-only deploy targets. */
export function isServerlessEnv(): boolean {
  if (process.env.VERCEL === '1' || process.env.VERCEL === 'true') return true;
  if (process.env.VERCEL_ENV) return true;
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) return true;
  if (process.env.AWS_EXECUTION_ENV) return true;

  // Reliable runtime signal — Vercel/Lambda cwd is /var/task (read-only).
  const cwd = process.cwd();
  return cwd === '/var/task' || cwd.startsWith('/var/task/');
}

/** Writable partner data root — project `data/` locally, `/tmp` in serverless. */
export function getPartnerDataRoot(): string {
  if (isServerlessEnv()) {
    return path.join(os.tmpdir(), 'valhaverly-partner-data');
  }
  return path.join(process.cwd(), 'data');
}

export function partnerApplicationsDir(): string {
  return path.join(getPartnerDataRoot(), 'partner-applications');
}

export function partnerUploadsDir(): string {
  return path.join(getPartnerDataRoot(), 'partner-uploads');
}

export function partnerMetaFile(): string {
  return path.join(getPartnerDataRoot(), 'partner-meta.json');
}
