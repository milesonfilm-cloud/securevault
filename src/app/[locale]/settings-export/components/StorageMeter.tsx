'use client';

import React, { useEffect, useState } from 'react';
import { HardDrive, AlertTriangle } from 'lucide-react';
import { getStorageSizeAsync } from '@/lib/storage';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function StorageMeter() {
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 50 * 1024 * 1024, percent: 0 });

  useEffect(() => {
    getStorageSizeAsync().then(setStorageInfo);
  }, []);

  const isWarning = storageInfo.percent > 70;
  const isDanger = storageInfo.percent > 90;

  const barColor = isDanger ? '#EF4444' : isWarning ? 'var(--vault-c-coral)' : 'var(--vault-c-warm)';

  return (
    <div className="neo-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-vault-elevated border border-border">
          {isDanger || isWarning ? (
            <AlertTriangle size={20} className={isDanger ? 'text-red-400' : 'text-vault-warm'} />
          ) : (
            <HardDrive size={20} className="text-vault-warm" />
          )}
        </div>
        <div>
          <h3 className="text-base font-700 text-vault-text">Local Storage (IndexedDB)</h3>
          <p className="text-xs text-vault-faint">
            Data persists in IndexedDB — survives cache clearing
          </p>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-vault-muted mb-1.5">
          <span>{formatBytes(storageInfo.used)} used</span>
          <span>{formatBytes(storageInfo.total)} available</span>
        </div>
        <div className="h-3 bg-vault-elevated rounded-full overflow-hidden border border-border">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${storageInfo.percent}%`, backgroundColor: barColor }}
          />
        </div>
        <p className="text-xs text-vault-faint mt-1.5 text-right">{storageInfo.percent}% used</p>
      </div>

      {isDanger && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 text-xs text-red-300 font-600">
          Storage nearly full — export and clear old data to free space
        </div>
      )}
      {isWarning && !isDanger && (
        <div className="bg-[rgba(241,170,155,0.12)] border border-[rgba(241,170,155,0.25)] rounded-xl px-3 py-2 text-xs text-vault-coral font-600">
          Storage above 70% — consider exporting a backup soon
        </div>
      )}
      {!isWarning && (
        <div className="bg-[rgba(240,195,142,0.12)] border border-[rgba(240,195,142,0.25)] rounded-xl px-3 py-2 text-xs text-vault-warm font-600">
          Storage healthy — all documents saved in IndexedDB
        </div>
      )}
    </div>
  );
}
