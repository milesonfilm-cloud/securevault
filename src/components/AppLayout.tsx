'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import DocumentExpiryAlerts from './DocumentExpiryAlerts';
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
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          activePath={activePath}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex flex-1 flex-col overflow-y-auto pb-28 lg:pb-0">
          {activePath !== '/document-vault' && <DocumentExpiryAlerts />}
          <div className="flex-1 min-h-0">{children}</div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MobileNav activePath={activePath} />
      </div>
    </div>
  );
}
