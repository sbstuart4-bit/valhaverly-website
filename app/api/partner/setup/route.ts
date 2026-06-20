import { getSupabaseKeyType, getSupabaseUrl, isSupabaseConfigured, getSupabaseAdmin } from '@/lib/supabase/server';
import { errorResponse, jsonResponse } from '@/lib/partner/api';
import { seedDemoApplications } from '@/lib/partner/store';

async function tablesReady(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await getSupabaseAdmin().from('partner_meta').select('key').limit(1);
    return !error;
  } catch {
    return false;
  }
}

export async function POST() {
  if (!isSupabaseConfigured()) {
    return errorResponse('Supabase is not configured in .env.local.', 503);
  }

  if (!(await tablesReady())) {
    return errorResponse(
      'Supabase tables not found. Run supabase/schema.sql in the SQL Editor first.',
      503,
    );
  }

  try {
    await seedDemoApplications();
    return jsonResponse({ success: true, message: 'Demo partner data seeded.' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Seed failed.';
    return errorResponse(message, 500);
  }
}

export async function GET() {
  const configured = isSupabaseConfigured();
  const ready = configured ? await tablesReady() : false;

  return jsonResponse({
    configured,
    ready,
    url: getSupabaseUrl(),
    keyType: configured ? getSupabaseKeyType() : null,
    storage: 'supabase',
  });
}
