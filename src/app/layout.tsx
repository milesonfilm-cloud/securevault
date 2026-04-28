import React from 'react';
import type { Metadata, Viewport } from 'next';
import {
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  DM_Sans,
  DM_Serif_Display,
  Roboto_Condensed,
  Inter,
} from 'next/font/google';
import '../styles/tailwind.css';
import { ThemeProvider } from '@/context/ThemeContext';
import VaultToaster from '@/components/VaultToaster';
import SupabaseSessionBootstrap from '@/components/SupabaseSessionBootstrap';
import { cn } from '@/lib/utils';

/** Bundled at build time — no runtime request to font CDNs (offline-capable after `next build`). */
const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'monospace'],
});

const fontWellnessSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-wellness-sans',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const fontWellnessSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-wellness-serif',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
});

/** Matches reference dashboard: condensed geometric sans (Roboto Condensed). */
const fontNeonStack = Roboto_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-neon-stack',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

/** Inter — Voyager demo gallery only (app themes use Plus Jakarta / DM Sans / Roboto Condensed). */
const fontPastel = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-pastel',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#09090b',
};

export const metadata: Metadata = {
  title: 'SecureVault — Private Document Storage for Families',
  description:
    'SecureVault app — store and organize family documents offline on your device. Zero cloud vault sync, zero tracking.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/brand/vault-mark.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
    apple: '/brand/vault-mark.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SecureVault',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        fontSans.variable,
        fontMono.variable,
        fontWellnessSans.variable,
        fontWellnessSerif.variable,
        fontNeonStack.variable,
        fontPastel.variable,
        'font-sans'
      )}
      data-theme="neon"
    >
      <body className="overflow-x-hidden antialiased [text-size-adjust:100%]">
        <a
          href="#main-content"
          className="fixed left-4 top-0 z-[10000] block translate-y-[-120%] rounded-xl bg-vault-warm px-4 py-2 text-sm font-700 text-vault-ink shadow-lg transition-transform focus:translate-y-4 focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <SupabaseSessionBootstrap />
          {children}
        </ThemeProvider>
        <VaultToaster />
      </body>
    </html>
  );
}
