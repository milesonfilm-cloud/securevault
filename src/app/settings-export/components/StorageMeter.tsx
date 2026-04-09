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

  const barColor = isDanger ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981';

  return (
    <div className="bg-white rounded-[1.35rem] border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/5">
          {isDanger || isWarning ? (
            <AlertTriangle size={20} className={isDanger ? 'text-red-600' : 'text-amber-600'} />
          ) : (
            <HardDrive size={20} className="text-slate-700" />
          )}
        </div>
        <div>
          <h3 className="text-base font-700 text-slate-900">Local Storage (IndexedDB)</h3>
          <p className="text-xs text-slate-400">
            Data persists in IndexedDB — survives cache clearing
          </p>
        </div>
      </div>

      {/* Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>{formatBytes(storageInfo.used)} used</span>
          <span>{formatBytes(storageInfo.total)} available</span>
        </div>
        <div className="h-3 bg-black/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${storageInfo.percent}%`, backgroundColor: barColor }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1.5 text-right">{storageInfo.percent}% used</p>
      </div>

      {isDanger && (
        <div className="bg-red-50 border border-red-200/70 rounded-xl px-3 py-2 text-xs text-red-700 font-600">
          Storage nearly full — export and clear old data to free space
        </div>
      )}
      {isWarning && !isDanger && (
        <div className="bg-amber-50 border border-amber-200/70 rounded-xl px-3 py-2 text-xs text-amber-800 font-600">
          Storage above 70% — consider exporting a backup soon
        </div>
      )}
      {!isWarning && (
        <div className="bg-emerald-50 border border-emerald-200/70 rounded-xl px-3 py-2 text-xs text-emerald-800 font-600">
          Storage healthy — all documents saved in IndexedDB
        </div>
      )}
    </div>
  );
}
