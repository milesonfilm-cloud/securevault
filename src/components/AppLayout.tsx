'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import DocumentExpiryAlerts from './DocumentExpiryAlerts';
import { useTheme } from '@/context/ThemeContext';

interface AppLayoutProps {
  children: React.ReactNode;
  activePath: string;
}

export default function AppLayout({ children, activePath }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useTheme();

  return (
    <div className="flex h-screen overflow-hidden relative neo-bg">
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
        <main className="flex-1 flex flex-col overflow-y-auto pb-20 lg:pb-0">
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
