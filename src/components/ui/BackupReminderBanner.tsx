'use client';

import React from 'react';
import { AlertTriangle, Download } from 'lucide-react';

interface BackupReminderBannerProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export default function BackupReminderBanner({
  variant = 'light',
  className = '',
}: BackupReminderBannerProps) {
  const isDark = variant === 'dark';

  return (
    <div
      className={[
        'rounded-2xl border px-4 py-3 flex items-start gap-3',
        isDark
          ? 'bg-[#3D3666] border-[rgba(255,255,255,0.07)] text-vault-muted'
          : 'bg-amber-50 border-amber-100 text-amber-900',
        className,
      ].join(' ')}
    >
      <div
        className={[
          'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
          isDark ? 'bg-[rgba(49,44,81,0.25)] text-[#F0C38E]' : 'bg-amber-100 text-amber-700',
        ].join(' ')}
      >
        <AlertTriangle size={18} />
      </div>
      <div className="min-w-0">
        <p className={['text-sm font-700', isDark ? 'text-white' : 'text-amber-900'].join(' ')}>
          Backup reminder (offline-only vault)
        </p>
        <p className={['text-xs mt-0.5', isDark ? 'text-vault-muted' : 'text-amber-700'].join(' ')}>
          If you forget your vault password and don&apos;t have a backup, your data cannot be
          recovered. Export encrypted backups regularly.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Download size={14} className={isDark ? 'text-vault-warm' : 'text-amber-700'} />
          <span
            className={['text-xs font-600', isDark ? 'text-vault-muted' : 'text-amber-800'].join(
              ' '
            )}
          >
            Settings → Export
          </span>
        </div>
      </div>
    </div>
  );
}
