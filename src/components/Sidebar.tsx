'use client';

import React from 'react';
import Link from 'next/link';
import AppLogo from './ui/AppLogo';
import { FolderLock, Users, Settings, ChevronLeft, ChevronRight, Lock, LogOut } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/document-vault',
    label: 'Document Vault',
    icon: <FolderLock size={18} />,
  },
  {
    href: '/family-management',
    label: 'Family Members',
    icon: <Users size={18} />,
  },
  {
    href: '/settings-export',
    label: 'Settings & Export',
    icon: <Settings size={18} />,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activePath: string;
}

function handleLockVault() {
  sessionStorage.removeItem('sv_session_unlocked');
  window.location.reload();
}

function navItemClasses(
  theme: 'light' | 'neon' | 'pastel',
  isActive: boolean,
  collapsed: boolean
): string {
  const base = `sidebar-item ${collapsed ? 'justify-center px-0' : ''}`;
  if (theme === 'neon') {
    return `${base} ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`;
  }
  if (theme === 'pastel') {
    if (isActive) {
      return `${base} bg-black/[0.06] text-slate-900 font-600 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]`;
    }
    return `${base} text-slate-500 hover:text-slate-900 hover:bg-slate-100`;
  }
  /* light */
  if (isActive) {
    return `${base} bg-violet-100/90 text-violet-800 font-600 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.2)]`;
  }
  return `${base} text-slate-600 hover:text-slate-900 hover:bg-slate-100/90`;
}

function navIconClass(theme: 'light' | 'neon' | 'pastel', isActive: boolean): string {
  if (theme === 'neon') {
    return isActive ? 'text-violet-400' : 'text-slate-500';
  }
  if (theme === 'pastel') {
    return isActive ? 'text-slate-900' : 'text-slate-400';
  }
  return isActive ? 'text-violet-600' : 'text-slate-500';
}

export default function Sidebar({ collapsed, onToggleCollapse, activePath }: SidebarProps) {
  const { theme } = useTheme();

  const shell =
    theme === 'neon'
      ? {
          background: '#000000',
          borderColor: 'rgba(255,255,255,0.08)',
          divider: 'rgba(255,255,255,0.08)',
        }
      : theme === 'pastel'
        ? {
            background: '#ffffff',
            borderColor: 'rgba(15,23,42,0.08)',
            divider: 'rgba(15,23,42,0.08)',
          }
        : {
            background: 'linear-gradient(180deg, #faf8ff 0%, #f3f0ff 55%, #f5f3ff 100%)',
            borderColor: 'rgba(15,23,42,0.08)',
            divider: 'rgba(15,23,42,0.08)',
          };

  const titleClass =
    theme === 'neon' ? 'text-white' : theme === 'pastel' ? 'text-slate-900' : 'text-slate-900';
  const subtitleClass =
    theme === 'neon'
      ? 'text-violet-400/60'
      : theme === 'pastel'
        ? 'text-slate-400'
        : 'text-violet-600/80';
  const navLabelClass =
    theme === 'neon' ? 'text-zinc-500' : theme === 'pastel' ? 'text-slate-400' : 'text-slate-500';

  const chevronClass = theme === 'neon' ? 'text-zinc-500' : 'text-slate-500';

  return (
    <div
      className="flex flex-col h-full border-r transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? 64 : 240,
        background: shell.background,
        borderColor: shell.borderColor,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center h-16 px-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${shell.divider}` }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex-shrink-0">
            <AppLogo size={32} />
          </div>
          {!collapsed && (
            <div>
              <span
                className={`font-bold text-base tracking-tight truncate block leading-tight ${titleClass}`}
              >
                SecureVault
              </span>
              <span className={`text-[10px] font-medium tracking-widest uppercase ${subtitleClass}`}>
                Private
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className={`px-3 mb-3 text-[10px] font-700 uppercase tracking-widest ${navLabelClass}`}>
            Navigation
          </p>
        )}
        {NAV_ITEMS.map((item) => {
          const isActive = activePath === item.href;
          return (
            <Link
              key={`nav-${item.href}`}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={navItemClasses(theme, isActive, collapsed)}
            >
              <span className={`flex-shrink-0 transition-colors ${navIconClass(theme, isActive)}`}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge && item.badge > 0 ? (
                <span
                  className={
                    theme === 'neon'
                      ? 'ml-auto bg-violet-500/20 text-violet-400 text-xs font-600 px-1.5 py-0.5 rounded-full tabular-nums'
                      : 'ml-auto bg-violet-100 text-violet-700 text-xs font-600 px-1.5 py-0.5 rounded-full tabular-nums'
                  }
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 space-y-1" style={{ borderTop: `1px solid ${shell.divider}` }}>
        {!collapsed && (
          <div
            className="px-3 py-2.5 rounded-xl mb-2"
            style={
              theme === 'neon'
                ? {
                    background: 'rgba(52,211,153,0.08)',
                    border: '1px solid rgba(52,211,153,0.18)',
                  }
                : {
                    background: 'rgba(52,211,153,0.1)',
                    border: '1px solid rgba(52,211,153,0.2)',
                  }
            }
          >
            <div className="flex items-center gap-2">
              <Lock size={11} className={theme === 'neon' ? 'text-emerald-400' : 'text-emerald-600'} />
              <span
                className={`text-xs font-600 ${theme === 'neon' ? 'text-emerald-400' : 'text-emerald-700'}`}
              >
                100% Offline
              </span>
            </div>
            <p
              className={`text-[11px] mt-0.5 ${theme === 'neon' ? 'text-zinc-500' : 'text-slate-600'}`}
            >
              Data never leaves this device
            </p>
          </div>
        )}

        {/* Lock vault button */}
        <button
          onClick={handleLockVault}
          className={`sidebar-item w-full ${
            theme === 'neon'
              ? 'sidebar-item-inactive text-red-400/70 hover:text-red-400'
              : 'text-red-600/80 hover:text-red-600 hover:bg-red-50'
          } ${collapsed ? 'justify-center px-0' : ''}`}
          title="Lock vault"
        >
          <LogOut size={15} className="flex-shrink-0" />
          {!collapsed && <span className="text-xs">Lock Vault</span>}
        </button>

        <button
          onClick={onToggleCollapse}
          className={`sidebar-item w-full ${navItemClasses(theme, false, collapsed)}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className={`flex-shrink-0 ${chevronClass}`}>
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </span>
          {!collapsed && (
            <span className={`text-xs ${theme === 'neon' ? 'text-zinc-500' : 'text-slate-500'}`}>
              Collapse
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
