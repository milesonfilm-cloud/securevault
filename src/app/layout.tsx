import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/context/ThemeContext';
import AuthGuard from '@/components/AuthGuard';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0F172A',
};

export const metadata: Metadata = {
  title: 'SecureVault — Private Document Storage for Families',
  description:
    'Store, organize, and access your personal and family documents 100% offline. Zero cloud, zero tracking. Your data stays on your device.',
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SecureVault',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body>
        <ThemeProvider>
          <AuthGuard>{children}</AuthGuard>
        </ThemeProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '14px',
            },
          }}
        />

        {process.env.NODE_ENV === 'production' ? (
          <>
            <script
              type="module"
              async
              src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fsecurevaul6263back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.18"
            />
            <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" />
          </>
        ) : null}
      </body>
    </html>
  );
}
