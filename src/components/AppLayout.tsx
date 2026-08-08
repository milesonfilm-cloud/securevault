'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MobileFabMenu from '@/components/MobileFabMenu';
import DocumentExpiryAlerts from './DocumentExpiryAlerts';
import GamificationCheckIn from '@/components/gamification/GamificationCheckIn';
import PastelAccentCssSync from '@/components/PastelAccentCssSync';
import DemoModeBanner from '@/components/DemoModeBanner';
import ShareIntakeListener from '@/components/ShareIntakeListener';
import TrustFooter from '@/components/trust/TrustFooter';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  activePath: string;
}

export default function AppLayout({ children, activePath }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={cn('relative flex h-screen overflow-hidden', 'vault-app-bg')}>
      <PastelAccentCssSync />
      <GamificationCheckIn />
      <ShareIntakeListener />
      {/* Desktop Sidebar — logo lives here; hidden on mobile/tablet */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          activePath={activePath}
        />
      </div>

      {/* Main content — no centered logo header on mobile/tablet */}
      <div className="flex flex-1 flex-col overflow-hidden pt-[env(safe-area-inset-top)] lg:pt-0">
        <main
          id="main-content"
          className={cn(
            'flex min-h-0 flex-1 flex-col overflow-hidden',
            /* Single FAB + margin + safe area (see MobileFabMenu) */
            'max-lg:pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))]',
            'lg:pb-0'
          )}
        >
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <DemoModeBanner />
            {activePath === '/family-management' && <DocumentExpiryAlerts />}
            <div className="min-h-0">{children}</div>
          </div>
          <TrustFooter />
        </main>
        <MobileFabMenu activePath={activePath} />
      </div>
    </div>
  );
}
