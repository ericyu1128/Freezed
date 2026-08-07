import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Snowfall from '@/components/Snowfall';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

export const metadata: Metadata = {
  title: 'Freezed — Ski & Snowboard Gear Matcher',
  description:
    'Freezed matches skis, snowboards, boots, helmets, goggles and outerwear to your body metrics, ability, riding style, conditions and budget. Made by Eric Yu.',
  keywords: [
    'ski gear matcher',
    'snowboard gear finder',
    'ski length calculator',
    'boot flex calculator',
    'goggle VLT',
    'Freezed',
  ],
  authors: [{ name: 'Eric Yu' }],
  creator: 'Eric Yu',
  openGraph: {
    title: 'Freezed — Ski & Snowboard Gear Matcher',
    description:
      'Dial in ski length, waist width, boot flex, lens VLT and jacket warmth from your own metrics. Made by Eric Yu.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#050a14',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">
        <LanguageProvider>
          <Snowfall />
          <div className="relative z-10 flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </LanguageProvider>
        <Analytics />

        {/*
          AvantLink affiliate site verification.
          Served over https:// — AvantLink's snippet ships as http://, which a
          browser blocks as mixed content on an https site, so the tag would
          never execute and verification would silently fail.
          Safe to delete once AvantLink has confirmed the site.
        */}
        <Script
          id="avantlink-affiliate-confirm"
          strategy="beforeInteractive"
          src="https://classic.avantlink.com/affiliate_app_confirm.php?mode=js&authResponse=da8bc28e34f9447aba250ea9907e997b6d624f53"
        />
      </body>
    </html>
  );
}
