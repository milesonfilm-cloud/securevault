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
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/context/ThemeContext';
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

/** Studio / pastel theme — Inter per design reference */
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
  themeColor: '#312C51',
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
      data-theme="vault"
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster
          position="bottom-right"
          closeButton
          duration={5000}
          toastOptions={{
            duration: 5000,
            closeButton: true,
            style: {
              fontFamily: 'inherit',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
