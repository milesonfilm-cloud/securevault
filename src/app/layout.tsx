import React from 'react';
import type { Metadata, Viewport } from 'next';
import {
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  DM_Sans,
  DM_Serif_Display,
  Roboto_Condensed,
  Urbanist,
} from 'next/font/google';
import '../styles/tailwind.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { PastelMemberAccentProvider } from '@/context/PastelMemberAccentContext';
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

/** Urbanist — Pastel / light “Family Vault” home theme. */
const fontUrbanist = Urbanist({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-urbanist',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f5fa' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export const metadata: Metadata = {
  title: 'SecureVault — Private Document Storage for Families',
  description:
    'SecureVault app — store and organize family documents offline on your device. Zero cloud vault sync, zero tracking.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/brand/securevault-app-icon.png',
        type: 'image/png',
        sizes: '512x512',
      },
      {
        url: '/brand/securevault-app-icon.png',
        type: 'image/png',
        sizes: '192x192',
      },
      { url: '/brand/vault-mark.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
    apple: [{ url: '/brand/securevault-app-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: [{ url: '/brand/securevault-app-icon.png', type: 'image/png', sizes: '192x192' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
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
        fontUrbanist.variable,
        'font-sans'
      )}
      data-theme="neon"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='sv_ui_theme';var t=localStorage.getItem(k);document.documentElement.setAttribute('data-theme',t==='pastel'?'pastel':'neon');}catch(e){document.documentElement.setAttribute('data-theme','neon');}})();`,
          }}
        />
      </head>
      <body className="overflow-x-hidden antialiased [text-size-adjust:100%]">
        <a
          href="#main-content"
          className="fixed left-4 top-0 z-[10000] block translate-y-[-120%] rounded-xl bg-vault-warm px-4 py-2 text-sm font-700 text-vault-ink shadow-lg transition-transform focus:translate-y-4 focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <PastelMemberAccentProvider>
            <SupabaseSessionBootstrap />
            {children}
          </PastelMemberAccentProvider>
        </ThemeProvider>
        <VaultToaster />
      </body>
    </html>
  );
}
