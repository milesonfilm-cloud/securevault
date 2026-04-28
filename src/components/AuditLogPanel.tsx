'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardList, Trash2 } from 'lucide-react';
import { getAuditLog, clearAuditLog, type AuditEntry } from '@/lib/auditLog';

const ACTION_LABELS: Record<string, string> = {
  document_created: 'Document added',
  document_updated: 'Document edited',
  document_deleted: 'Document deleted',
  document_viewed: 'Document viewed',
  document_exported: 'Document exported',
  document_shared: 'Document shared',
  member_created: 'Member added',
  member_updated: 'Member updated',
  member_deleted: 'Member removed',
  vault_unlocked: 'Vault unlocked',
  vault_exported: 'Vault exported',
  emergency_pdf_generated: 'Emergency PDF created',
  handover_link_created: 'Handover link created',
  digilocker_connected: 'DigiLocker connected',
};

export default function AuditLogPanel() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    setEntries(getAuditLog());
  }, []);

  const paged = entries.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(entries.length / PAGE_SIZE);

  const handleClear = () => {
    if (!window.confirm('Clear entire audit log? This cannot be undone.')) return;
    clearAuditLog();
    setEntries([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList size={18} className="text-vault-warm" />
          <h2 className="text-sm font-700 text-vault-text">Activity log</h2>
          <span className="text-xs text-vault-muted">({entries.length} entries)</span>
        </div>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-red-400 transition-colors hover:text-red-300"
          >
            <Trash2 size={12} />
            Clear log
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="py-8 text-center text-sm text-vault-muted">No activity recorded yet.</p>
      ) : (
        <>
          <div className="space-y-1">
            {paged.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-vault-elevated/30"
              >
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-vault-warm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-vault-text">
                    {ACTION_LABELS[entry.action] ?? entry.action}
                    {entry.targetTitle ? (
                      <span className="text-vault-muted"> — &ldquo;{entry.targetTitle}&rdquo;</span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-xs text-vault-faint">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-xs text-vault-muted transition-colors hover:text-vault-text disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-vault-faint">
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="text-xs text-vault-muted transition-colors hover:text-vault-text disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
