'use client';

import React, { useEffect, useState } from 'react';
import { History, FileJson, FileText } from 'lucide-react';
import { loadVaultDataAsync, ExportRecord } from '@/lib/storage';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function ExportHistory() {
  const [history, setHistory] = useState<ExportRecord[]>([]);

  useEffect(() => {
    loadVaultDataAsync().then((data) => {
      setHistory(data.exportHistory || []);
    });
  }, []);

  return (
    <div className="bg-white rounded-[1.35rem] border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center">
          <History size={20} className="text-slate-700" />
        </div>
        <div>
          <h3 className="text-base font-700 text-slate-900">Export History</h3>
          <p className="text-xs text-slate-400">Last 10 exports from this device</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8">
          <History size={28} className="mx-auto text-slate-200 mb-2" />
          <p className="text-sm text-slate-400">No exports yet</p>
          <p className="text-xs text-slate-300 mt-0.5">Your export history will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((record) => (
            <div
              key={`history-${record.id}`}
              className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 transition-colors border border-slate-200/70"
            >
              <div className="flex items-center gap-2.5">
                {record.format === 'JSON' ? (
                  <FileJson size={16} className="text-slate-700 flex-shrink-0" />
                ) : (
                  <FileText size={16} className="text-slate-700 flex-shrink-0" />
                )}
                <div>
                  <span className="text-sm font-600 text-slate-700">{record.format} backup</span>
                  <p className="text-xs text-slate-400">{formatDate(record.exportedAt)}</p>
                </div>
              </div>
              <span className="text-xs font-600 text-slate-500 tabular-nums flex-shrink-0">
                {record.documentCount} docs
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
