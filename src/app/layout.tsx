import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import '../styles/tailwind.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/context/ThemeContext';
import ConditionalAuthGuard from '@/components/ConditionalAuthGuard';
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#312C51',
};

export const metadata: Metadata = {
  title: 'SecureVault — Private Document Storage for Families',
  description:
    'Store, organize, and access your personal and family documents 100% offline. Zero cloud, zero tracking. Your data stays on your device.',
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
      className={cn(fontSans.variable, fontMono.variable, 'font-sans')}
      data-theme="vault"
    >
      <body>
        <ThemeProvider>
          <ConditionalAuthGuard>{children}</ConditionalAuthGuard>
        </ThemeProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-sans), system-ui, sans-serif',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
