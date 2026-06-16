import type { NextConfig } from 'next';

const htmlPages = [
  'early-access',
  'contact',
  'privacy',
  'terms',
  'hero-mockup',
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
      ],
    };
  },
};

export default nextConfig;
