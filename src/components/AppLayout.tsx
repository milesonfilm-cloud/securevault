'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import DocumentExpiryAlerts from './DocumentExpiryAlerts';
import MemberSwitcher from '@/components/vault/MemberSwitcher';
import GamificationCheckIn from '@/components/gamification/GamificationCheckIn';
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
    <div
      className={cn(
        'relative flex h-screen overflow-hidden',
        theme === 'neon'
          ? 'neon-vault-bg'
          : theme === 'pastel'
            ? 'pastel-vault-bg'
            : theme === 'voyager'
              ? 'voyager-vault-bg'
              : 'neo-bg'
      )}
    >
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
        <header className="flex flex-shrink-0 items-center justify-end gap-3 border-b border-[color:var(--color-border)] bg-vault-panel/90 px-3 py-2 backdrop-blur-md lg:px-4">
          <MemberSwitcher />
        </header>
        <main className="flex flex-1 flex-col overflow-y-auto pb-28 lg:pb-0">
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
