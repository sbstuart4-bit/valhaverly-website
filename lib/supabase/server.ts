import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface PartnerApplicationRow {
  id: string;
  legacy_id: string | null;
  status: string;
  email: string;
  password_hash: string | null;
  personal: Record<string, unknown>;
  professional: Record<string, unknown>;
  market: Record<string, unknown>;
  partner_fit: Record<string, unknown>;
  verification: Record<string, unknown>;
  agreement: Record<string, unknown>;
  partner_profile: Record<string, unknown> | null;
  audit_trail: unknown[];
  email_verified: boolean;
  application_date: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

const PLACEHOLDER_KEYS = new Set([
  '',
  'your-service-role-key-here',
  'your-anon-key-here',
]);

let adminClient: SupabaseClient | null = null;

export function getSupabaseUrl(): string | null {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ||
    null
  );
}

export function getSupabaseServerKey(): string | null {
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (service && !PLACEHOLDER_KEYS.has(service)) return service;

  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (anon && !PLACEHOLDER_KEYS.has(anon)) return anon;

  return null;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseServerKey());
}

export function getSupabaseKeyType(): 'service_role' | 'anon' {
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (service && !PLACEHOLDER_KEYS.has(service)) return 'service_role';
  return 'anon';
}

export function getSupabaseAdmin(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabaseServerKey();

  if (!url || !key) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) to .env.local.',
    );
  }

  if (!adminClient) {
    adminClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return adminClient;
}

export const VERIFICATION_BUCKET = 'partner-verification';
