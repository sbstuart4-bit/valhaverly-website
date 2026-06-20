/**
 * Seed demo partner applications into Supabase via local API.
 * Requires dev server running OR use: npx next dev then npm run db:seed
 * Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.
 */

const base = process.env.SEED_API_URL || 'http://localhost:3000';

async function main() {
  const res = await fetch(`${base}/api/partner/setup`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) {
    console.error('Seed failed:', data.error || data);
    process.exit(1);
  }
  console.log('✓', data.message || 'Seeded successfully');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
