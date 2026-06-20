import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';
import type { PartnerApplication } from './types';
import {
  approveApplicationFile,
  createApplicationFile,
  getApplicationByEmailFile,
  getApplicationFile,
  getUploadsDir,
  listApplicationsFile,
  seedDemoApplicationsFile,
  saveApplicationFile,
  uploadVerificationFileLocal,
} from './store-file';
import {
  approveApplicationSupabase,
  applicationToPortalAgent,
  createApplicationSupabase,
  getApplicationByEmailSupabase,
  getApplicationSupabase,
  isPortalAccessible,
  isUsingSupabase,
  listApplicationsSupabase,
  saveApplicationSupabase,
  seedDemoApplicationsSupabase,
  uploadVerificationFileSupabase,
} from './store-supabase';

export { applicationToPortalAgent, isPortalAccessible, isUsingSupabase };

let supabaseReady: boolean | null = null;

async function shouldUseSupabase(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  if (supabaseReady === true) return true;
  if (supabaseReady === false) return false;

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('partner_meta').select('key').limit(1);
    if (error) {
      console.warn('[partner] Supabase configured but tables missing — using local files. Run supabase/schema.sql');
      supabaseReady = false;
      return false;
    }
    supabaseReady = true;
    return true;
  } catch (err) {
    console.warn('[partner] Supabase unavailable — using local files.', err);
    supabaseReady = false;
    return false;
  }
}

export async function seedDemoApplications() {
  if (await shouldUseSupabase()) {
    return seedDemoApplicationsSupabase();
  }
  return seedDemoApplicationsFile();
}

export async function listApplications(options?: {
  status?: string;
  search?: string;
}) {
  if (await shouldUseSupabase()) {
    return listApplicationsSupabase(options);
  }
  return listApplicationsFile(options);
}

export async function getApplication(id: string): Promise<PartnerApplication | null> {
  if (await shouldUseSupabase()) {
    return getApplicationSupabase(id);
  }
  return getApplicationFile(id);
}

export async function getApplicationByEmail(email: string): Promise<PartnerApplication | null> {
  if (await shouldUseSupabase()) {
    return getApplicationByEmailSupabase(email);
  }
  return getApplicationByEmailFile(email);
}

export async function saveApplication(app: PartnerApplication): Promise<PartnerApplication> {
  if (await shouldUseSupabase()) {
    return saveApplicationSupabase(app);
  }
  return saveApplicationFile(app);
}

export async function createApplication(email = ''): Promise<PartnerApplication> {
  if (await shouldUseSupabase()) {
    return createApplicationSupabase(email);
  }
  return createApplicationFile(email);
}

export async function approveApplication(id: string): Promise<PartnerApplication | null> {
  if (await shouldUseSupabase()) {
    return approveApplicationSupabase(id);
  }
  return approveApplicationFile(id);
}

export async function uploadVerificationFile(
  applicationId: string,
  field: string,
  file: File,
): Promise<string> {
  if (await shouldUseSupabase()) {
    return uploadVerificationFileSupabase(applicationId, field, file);
  }
  return uploadVerificationFileLocal(applicationId, field, file);
}

export { getUploadsDir };
