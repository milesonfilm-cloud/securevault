'use client';

import React from 'react';
import { History, FileJson, FileText } from 'lucide-react';
import { ExportRecord } from '@/lib/storage';
import { useVaultData } from '@/context/VaultDataContext';

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
  const { vaultData } = useVaultData();
  const history: ExportRecord[] = vaultData.exportHistory ?? [];

  return (
    <div className="neo-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-vault-elevated border border-border rounded-2xl flex items-center justify-center">
          <History size={20} className="text-vault-warm" />
        </div>
        <div>
          <h3 className="text-base font-700 text-vault-text">Export History</h3>
          <p className="text-xs text-vault-faint">Last 10 exports from this device</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8">
          <History size={28} className="mx-auto text-vault-elevated mb-2" />
          <p className="text-sm text-vault-muted">No exports yet</p>
          <p className="text-xs text-vault-faint mt-0.5">Your export history will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((record) => (
            <div
              key={`history-${record.id}`}
              className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl neo-inset hover:opacity-90 transition-opacity"
            >
              <div className="flex items-center gap-2.5">
                {record.format === 'JSON' ? (
                  <FileJson size={16} className="text-vault-warm flex-shrink-0" />
                ) : (
                  <FileText size={16} className="text-vault-warm flex-shrink-0" />
                )}
                <div>
                  <span className="text-sm font-700 text-vault-text">{record.format} backup</span>
                  <p className="text-xs text-vault-faint">{formatDate(record.exportedAt)}</p>
                </div>
              </div>
              <span className="text-xs font-800 text-vault-muted tabular-nums flex-shrink-0">
                {record.documentCount} docs
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
