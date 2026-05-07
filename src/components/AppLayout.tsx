'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/navigation';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import AppLogo from './ui/AppLogo';
import DocumentExpiryAlerts from './DocumentExpiryAlerts';
import GamificationCheckIn from '@/components/gamification/GamificationCheckIn';
import PastelAccentCssSync from '@/components/PastelAccentCssSync';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  activePath: string;
}

export default function AppLayout({ children, activePath }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme } = useTheme();

  return (
    <div className={cn('relative flex h-screen overflow-hidden', 'neon-vault-bg')}>
      <PastelAccentCssSync />
      <GamificationCheckIn />
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          activePath={activePath}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {activePath !== '/family-management' ? (
          <header
            className={cn(
              'flex h-12 shrink-0 items-center justify-between gap-2 border-b border-[color:var(--color-border)] bg-vault-panel/95 px-4 backdrop-blur-sm',
              'lg:hidden pt-[env(safe-area-inset-top)]'
            )}
            style={
              theme === 'pastel'
                ? {
                    borderBottomColor: 'color-mix(in srgb, var(--pastel-member-ink) 24%, transparent)',
                  }
                : undefined
            }
          >
            <Link
              href="/family-management"
              className="flex min-w-0 max-w-full items-center gap-2 rounded-lg py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-vault-warm/50"
            >
              <AppLogo size={36} className="flex-shrink-0" />
              <span className="truncate text-[10px] font-bold uppercase leading-snug tracking-[0.2em] text-vault-text min-[380px]:text-[11px]">
                Secure Vault
              </span>
            </Link>
          </header>
        ) : null}
        <main
          id="main-content"
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden lg:pb-0"
          style={{
            paddingBottom:
              // Keep scrollable content clear of the fixed bottom nav + safe-area.
              // (MobileNav is ~52px tall; add extra breathing room for touch targets.)
              'calc(92px + env(safe-area-inset-bottom))',
          }}
        >
          {activePath !== '/document-vault' && <DocumentExpiryAlerts />}
          <div className="min-h-0 flex-1">{children}</div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MobileNav activePath={activePath} />
      </div>
    </div>
  );
}
