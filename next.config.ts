import type { NextConfig } from 'next';

const htmlPages = [
  'early-access',
  'contact',
  'privacy',
  'terms',
  'demo',
  'hero-mockup',
  'agent-login',
  'agent-partners',
  'commons',
];

const partnerOnboardingPages = [
  'apply',
  'application-submitted',
  'onboarding',
  'pending-approval',
  'approved',
];

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/index.html' },
        ...htmlPages.map((page) => ({
          source: `/${page}`,
          destination: `/${page}.html`,
        })),
        ...partnerOnboardingPages.map((page) => ({
          source: `/agent-partners/${page}`,
          destination: `/agent-partners/${page}.html`,
        })),
        { source: '/agent-portal', destination: '/agent-portal/index.html' },
        { source: '/agent-portal/referrals', destination: '/agent-portal/referrals.html' },
        { source: '/agent-portal/settings', destination: '/agent-portal/settings.html' },
        { source: '/admin', destination: '/admin/index.html' },
        { source: '/admin/dashboard', destination: '/admin/dashboard.html' },
      ],
    };
  },
};

export default nextConfig;
