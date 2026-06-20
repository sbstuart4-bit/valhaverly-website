import { verifyPassword } from '@/lib/partner/utils';

export function getAdminCredentials() {
  const email = (process.env.ADMIN_EMAIL || 'admin@valhaverly.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin2025!';
  const name = process.env.ADMIN_NAME || 'Valhaverly Admin';
  return { email, password, name };
}

export function verifyAdminLogin(email: string, password: string): { ok: boolean; name: string } {
  const creds = getAdminCredentials();
  if (email.trim().toLowerCase() !== creds.email) {
    return { ok: false, name: creds.name };
  }

  const envHash = process.env.ADMIN_PASSWORD_HASH;
  if (envHash) {
    return { ok: verifyPassword(password, envHash), name: creds.name };
  }

  return { ok: password === creds.password, name: creds.name };
}
