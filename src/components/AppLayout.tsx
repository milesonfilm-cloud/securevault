'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import AuthGuard from './AuthGuard';
import ThemeSwitcher from './ThemeSwitcher';
import { useTheme } from '@/context/ThemeContext';

interface AppLayoutProps {
  children: React.ReactNode;
  activePath: string;
}

export default function AppLayout({ children, activePath }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme } = useTheme();

  const shellBg =
    theme === 'neon'
      ? { background: '#000000' }
      : theme === 'pastel'
        ? { background: '#ffffff' }
        : { background: 'linear-gradient(135deg, #f8f7ff 0%, #f0f4ff 50%, #f5f0ff 100%)' };

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden relative" style={shellBg}>
        <div className="fixed top-3 right-3 z-[100] lg:top-4 lg:right-5 safe-top">
          <ThemeSwitcher />
        </div>
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
    </AuthGuard>
  );
}
