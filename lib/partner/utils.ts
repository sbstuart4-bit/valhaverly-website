import { createHash, randomBytes } from 'crypto';

const DEMO_PASSWORD = 'Partner2025!';

export function hashPassword(password: string): string {
  const salt = 'valhaverly-partner-v1';
  return createHash('sha256').update(`${salt}:${password}`).digest('hex');
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  return hashPassword(password) === passwordHash;
}

export function getDemoPasswordHash(): string {
  return hashPassword(DEMO_PASSWORD);
}

export function generateApplicationId(): string {
  return `app_${randomBytes(12).toString('hex')}`;
}

export function generatePartnerId(sequence: number): string {
  return `VAL-${String(sequence).padStart(4, '0')}`;
}

export function generateReferralCode(firstName: string, lastName: string, sequence: number): string {
  const first = firstName.trim().charAt(0).toUpperCase();
  const last = lastName.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
  return `${first}${last}${String(sequence).padStart(3, '0')}`;
}

export function buildReferralUrl(referralCode: string): string {
  return `https://valhaverly.com/agent/${referralCode}`;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^[+()\-.\s\d]{10,20}$/;

export function trim(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
