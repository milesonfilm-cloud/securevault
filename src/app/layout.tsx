import React from 'react';
import type { Metadata, Viewport } from 'next';
import {
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  DM_Sans,
  DM_Serif_Display,
  Urbanist,
} from 'next/font/google';
import '../styles/tailwind.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { PastelMemberAccentProvider } from '@/context/PastelMemberAccentContext';
import VaultToaster from '@/components/VaultToaster';
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

/** Urbanist — Family Vault home theme. */
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
    { media: '(prefers-color-scheme: dark)', color: '#f6f5fa' },
  ],
};

export const metadata: Metadata = {
  title: 'Strong Vault — Private Document Storage for Families',
  description:
    'Strong Vault — Android and iOS app for encrypted family document storage on your device. No cloud vault sync.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/brand/strongvault-app-icon.png',
        type: 'image/png',
        sizes: '512x512',
      },
      {
        url: '/brand/strongvault-app-icon.png',
        type: 'image/png',
        sizes: '192x192',
      },
      { url: '/brand/vault-mark.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
    apple: [{ url: '/brand/strongvault-app-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: [{ url: '/brand/strongvault-app-icon.png', type: 'image/png', sizes: '192x192' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Strong Vault',
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
        fontUrbanist.variable,
        'font-sans'
      )}
      data-theme="glass"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{localStorage.setItem('sv_ui_theme','glass');document.documentElement.setAttribute('data-theme','glass');}catch(e){document.documentElement.setAttribute('data-theme','glass');}})();`,
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
            {children}
          </PastelMemberAccentProvider>
        </ThemeProvider>
        <VaultToaster />
      </body>
    </html>
  );
}
