'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, Loader2, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import {
  clearAuditLog,
  getAuditLog,
  verifyAuditIntegrity,
  type AuditEntry,
  type AuditIntegrityResult,
} from '@/lib/auditLog';
import { useVaultData } from '@/context/VaultDataContext';
import { getCategoryById } from '@/lib/categories';

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
  digilocker_connected: 'DigiLocker connected',
  share_import_received: 'Shared file received',
  audit_cleared: 'Activity log cleared',
};

export default function AuditLogPanel() {
  const { vaultData } = useVaultData();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [memberFilter, setMemberFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [integrity, setIntegrity] = useState<AuditIntegrityResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const PAGE_SIZE = 20;

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setEntries(await getAuditLog());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const memberName = useCallback(
    (id: string | null) => {
      if (!id) return null;
      return vaultData.members.find((m) => m.id === id)?.name ?? id;
    },
    [vaultData.members]
  );

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (memberFilter && e.actorMemberId !== memberFilter) return false;
      if (categoryFilter && (e.categoryId ?? '') !== categoryFilter) return false;
      if (dateFrom) {
        const from = new Date(`${dateFrom}T00:00:00`);
        if (new Date(e.timestamp) < from) return false;
      }
      if (dateTo) {
        const to = new Date(`${dateTo}T23:59:59.999`);
        if (new Date(e.timestamp) > to) return false;
      }
      return true;
    });
  }, [entries, memberFilter, categoryFilter, dateFrom, dateTo]);

  useEffect(() => {
    setPage(0);
  }, [memberFilter, categoryFilter, dateFrom, dateTo]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const categoriesInLog = useMemo(() => {
    const ids = new Set<string>();
    for (const e of entries) {
      if (e.categoryId) ids.add(e.categoryId);
    }
    return [...ids];
  }, [entries]);

  const handleClear = async () => {
    if (!window.confirm('Clear entire activity log? A cleared marker will start a new hash chain.'))
      return;
    await clearAuditLog();
    setIntegrity(null);
    await reload();
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      setIntegrity(await verifyAuditIntegrity());
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ClipboardList size={18} className="text-vault-warm" />
          <h2 className="text-sm font-700 text-vault-text">Activity log</h2>
          <span className="text-xs text-vault-muted">({filtered.length} shown)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleVerify()}
            disabled={verifying}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-vault-elevated px-2.5 py-1.5 text-xs font-600 text-vault-text transition-colors hover:bg-vault-panel disabled:opacity-50"
          >
            {verifying ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
            Verify integrity
          </button>
          {entries.length > 0 && (
            <button
              type="button"
              onClick={() => void handleClear()}
              className="flex items-center gap-1 text-xs text-red-400 transition-colors hover:text-red-300"
            >
              <Trash2 size={12} />
              Clear log
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-vault-faint leading-relaxed">
        Tamper-evident hash chain stored in IndexedDB on this device. Each entry seals the previous
        hash — edits break verification.
      </p>

      {integrity ? (
        <div
          className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm ${
            integrity.ok
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800'
              : 'border-red-500/30 bg-red-500/10 text-red-800'
          }`}
          role="status"
        >
          {integrity.ok ? (
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          ) : (
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
          )}
          <div>
            <p className="font-600">{integrity.ok ? 'Vault integrity: pass' : 'Vault integrity: fail'}</p>
            <p className="mt-0.5 text-xs opacity-90">{integrity.message}</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs text-vault-muted">
          Member
          <select
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className="input-field mt-1 text-sm"
          >
            <option value="">All members</option>
            {vaultData.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-vault-muted">
          Category
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field mt-1 text-sm"
          >
            <option value="">All categories</option>
            {categoriesInLog.map((id) => (
              <option key={id} value={id}>
                {getCategoryById(id as never)?.label ?? id}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-vault-muted">
          From
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input-field mt-1 text-sm"
          />
        </label>
        <label className="text-xs text-vault-muted">
          To
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input-field mt-1 text-sm"
          />
        </label>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-vault-muted">Loading activity…</p>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-vault-muted">No activity recorded yet.</p>
      ) : (
        <>
          <div className="space-y-1">
            {paged.map((entry) => {
              const cat = entry.categoryId ? getCategoryById(entry.categoryId as never) : null;
              const who = memberName(entry.actorMemberId);
              return (
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
                      {who ? ` · ${who}` : ''}
                      {cat ? ` · ${cat.shortLabel}` : ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length > PAGE_SIZE && (
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
                disabled={page >= totalPages - 1}
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
