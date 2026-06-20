/**
 * Bootstrap Supabase for the Steward Partner Program.
 * Loads .env.local, tests connection, seeds demo partners.
 *
 * Usage: node scripts/bootstrap.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const PLACEHOLDER = new Set(['', 'your-service-role-key-here', 'your-anon-key-here']);

function loadEnvLocal() {
  const path = '.env.local';
  if (!existsSync(path)) {
    console.error('Missing .env.local — copy .env.example and add your Supabase keys.');
    process.exit(1);
  }
  const lines = readFileSync(path, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function resolveConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let keyType = 'service_role';
  if (!key || PLACEHOLDER.has(key)) {
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    keyType = 'anon';
  }
  if (!url || !key || PLACEHOLDER.has(key)) {
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and a valid key in .env.local');
    process.exit(1);
  }
  return { url, key, keyType };
}

loadEnvLocal();
const { url, key, keyType } = resolveConfig();
const supabase = createClient(url, key, { auth: { persistSession: false } });

console.log(`Connecting to ${url} (${keyType} key)…`);

const { error: pingError } = await supabase.from('partner_meta').select('key').limit(1);
if (pingError) {
  console.error('\n✗ Database not ready:', pingError.message);
  console.error('\nRun supabase/schema.sql in your Supabase SQL Editor first:');
  console.error('  https://supabase.com/dashboard/project/nsbdalprzmrmexztowaf/sql/new');
  process.exit(1);
}

console.log('✓ Connected to Supabase');

const seedRes = await fetch('http://localhost:3000/api/partner/setup', { method: 'POST' });
if (seedRes.ok) {
  const data = await seedRes.json();
  console.log('✓', data.message || 'Demo partners seeded');
} else {
  console.log('⚠ Start dev server (npm run dev) then run: npm run db:seed');
}

console.log('\nDemo login: sarah.jones@valhaverly.com / Partner2025!');
