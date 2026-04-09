'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { useTheme } from '@/context/ThemeContext';

interface AppLayoutProps {
  children: React.ReactNode;
  activePath: string;
}

export default function AppLayout({ children, activePath }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useTheme(); // keep provider mounted; single-theme mode (pastel)
  const shellBg = { background: '#ffffff' };

  return (
    <div className="flex h-screen overflow-hidden relative" style={shellBg}>
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
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MobileNav activePath={activePath} />
      </div>
    </div>
  );
}
