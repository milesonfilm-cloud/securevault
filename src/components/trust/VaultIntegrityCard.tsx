'use client';

import React, { useState } from 'react';
import { CheckCircle2, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { verifyAuditIntegrity, type AuditIntegrityResult } from '@/lib/auditLog';

export default function VaultIntegrityCard() {
  const [result, setResult] = useState<AuditIntegrityResult | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      setResult(await verifyAuditIntegrity());
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="neo-card mb-5 rounded-2xl p-5 sm:p-6">
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-vault-elevated text-vault-warm">
          <ShieldCheck size={18} aria-hidden />
        </div>
        <h2 className="text-lg font-bold text-vault-text">Vault integrity</h2>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-vault-muted">
        The activity log uses a SHA-256 hash chain. Verify that no entries were altered on this
        device.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void run()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#4338C9] px-3.5 py-2 text-sm font-700 text-white disabled:opacity-50"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
          Verify integrity
        </button>
        <Link href="/settings-export" className="text-sm font-600 text-vault-warm hover:text-vault-text">
          Open activity log
        </Link>
      </div>
      {result ? (
        <div
          className={`mt-4 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm ${
            result.ok
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800'
              : 'border-red-500/30 bg-red-500/10 text-red-800'
          }`}
          role="status"
        >
          {result.ok ? (
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          ) : (
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
          )}
          <div>
            <p className="font-600">{result.ok ? 'Pass' : 'Fail'}</p>
            <p className="mt-0.5 text-xs opacity-90">{result.message}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
