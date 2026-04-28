'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import DocumentExpiryAlerts from './DocumentExpiryAlerts';
import GamificationCheckIn from '@/components/gamification/GamificationCheckIn';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  activePath: string;
}

export default function AppLayout({ children, activePath }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={cn('relative flex h-screen overflow-hidden', 'neon-vault-bg')}>
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
        <main
          id="main-content"
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden pb-28 lg:pb-0"
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
