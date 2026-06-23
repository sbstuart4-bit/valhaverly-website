import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How Fairness Works in 60 Seconds · Valhaverly',
  description:
    'The Valhaverly Fairness Engine — an interactive demo showing how shared property booking stays fair, automatic, and conflict-free.',
};

export default function FairnessLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Serif+Display:ital@0;1&family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&family=Overpass:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/styles.css?v=25" />
      <link rel="stylesheet" href="/fairness.css?v=2" />
      {children}
      <Script src="/script.js" strategy="afterInteractive" />
    </>
  );
}
