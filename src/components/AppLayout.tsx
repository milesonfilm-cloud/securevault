'use client';

import React from 'react';
import MobileFabMenu from '@/components/MobileFabMenu';
import AppWalkthrough from '@/components/ui/AppWalkthrough';
import DocumentExpiryAlerts from './DocumentExpiryAlerts';
import GamificationCheckIn from '@/components/gamification/GamificationCheckIn';
import PastelAccentCssSync from '@/components/PastelAccentCssSync';
import GlassThemeBackdrop from '@/components/GlassThemeBackdrop';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  activePath: string;
}

export default function AppLayout({ children, activePath }: AppLayoutProps) {
  return (
    <AppWalkthrough activePath={activePath}>
      <div className={cn('relative flex h-screen overflow-hidden', 'vault-shell-bg')}>
        <GlassThemeBackdrop />
        <PastelAccentCssSync />
        <GamificationCheckIn />

        <div className="relative z-[1] flex flex-1 flex-col overflow-hidden">
          <main
            id="main-content"
            className={cn(
              'flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden',
              'pt-[max(0.75rem,env(safe-area-inset-top,0px))]',
              'pb-[calc(7.25rem+env(safe-area-inset-bottom,0px))]'
            )}
          >
            {activePath !== '/document-vault' && <DocumentExpiryAlerts />}
            <div className="min-h-0 flex-1">{children}</div>
          </main>
          <MobileFabMenu activePath={activePath} />
        </div>
      </div>
    </AppWalkthrough>
  );
}
