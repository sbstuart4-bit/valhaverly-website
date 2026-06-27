import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Valhaverly',
  description:
    'Valhaverly — The OS for your lifestyle assets. Private governance for families sharing cottages, chalets, boats, and family compounds.',
  icons: {
    icon: [{ url: '/favicon.png?v=2', type: 'image/png' }],
    apple: [{ url: '/favicon.png?v=2', type: 'image/png' }],
    shortcut: [{ url: '/favicon.ico?v=2', type: 'image/x-icon' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
