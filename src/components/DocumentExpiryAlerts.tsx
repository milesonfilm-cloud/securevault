'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useVaultData } from '@/context/VaultDataContext';
import {
  collectExpiryAlerts,
  DEFAULT_EXPIRY_WARN_DAYS,
  formatExpirySummary,
  type DocumentExpiryAlert,
} from '@/lib/documentExpiry';
const TOAST_SESSION_KEY = 'sv_expiry_toast_session';
const DISMISS_DAY_KEY = 'sv_expiry_banner_dismissed_day';

function localDayKey(): string {
  const n = new Date();
  return `${n.getFullYear()}-${n.getMonth() + 1}-${n.getDate()}`;
}

export default function DocumentExpiryAlerts() {
  const { vaultData } = useVaultData();
  const [dismissedToday, setDismissedToday] = useState(false);

  useEffect(() => {
    try {
      if (
        typeof sessionStorage !== 'undefined' &&
        sessionStorage.getItem(DISMISS_DAY_KEY) === localDayKey()
      ) {
        setDismissedToday(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const names = useMemo(
    () => new Map(vaultData.members.map((m) => [m.id, m.name])),
    [vaultData.members]
  );

  const alerts: DocumentExpiryAlert[] = useMemo(
    () => collectExpiryAlerts(vaultData.documents, DEFAULT_EXPIRY_WARN_DAYS),
    [vaultData.documents]
  );

  useEffect(() => {
    if (alerts.length === 0) return;
    try {
      if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(TOAST_SESSION_KEY)) {
        sessionStorage.setItem(TOAST_SESSION_KEY, '1');
        const expired = alerts.filter((a) => a.daysUntil < 0).length;
        const soon = alerts.length - expired;
        const parts: string[] = [];
        if (expired) parts.push(`${expired} expired`);
        if (soon) parts.push(`${soon} expiring within ${DEFAULT_EXPIRY_WARN_DAYS} days`);
        toast.warning('Document expiry reminder', {
          description: parts.join(' · ') + '. Open Document Vault to review.',
          duration: 10_000,
        });
      }
    } catch {
      /* private mode */
    }
  }, [alerts]);

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_DAY_KEY, localDayKey());
    } catch {
      /* ignore */
    }
    setDismissedToday(true);
  };

  if (alerts.length === 0 || dismissedToday) return null;

  const expiredCount = alerts.filter((a) => a.daysUntil < 0).length;
  const upcomingCount = alerts.length - expiredCount;

  return (
    <div
      className="shrink-0 border-b border-border bg-amber-500/12 px-4 py-3 lg:px-6"
      role="alert"
    >
      <div className="max-w-screen-2xl mx-auto flex gap-3">
        <AlertTriangle
          className={`mt-0.5 flex-shrink-0 ${expiredCount > 0 ? 'text-red-400' : 'text-amber-300'}`}
          size={20}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-700 text-vault-text">
            {expiredCount > 0 && upcomingCount > 0
              ? `${expiredCount} expired · ${upcomingCount} expiring soon`
              : expiredCount > 0
                ? `${expiredCount} document${expiredCount === 1 ? '' : 's'} with expired dates`
                : `${upcomingCount} document${upcomingCount === 1 ? '' : 's'} expiring within ${DEFAULT_EXPIRY_WARN_DAYS} days`}
          </p>
          <ul className="mt-2 space-y-1 text-xs text-vault-muted max-h-28 overflow-y-auto">
            {alerts.slice(0, 6).map((a) => (
              <li key={`${a.docId}-${a.fieldKey}`} className="truncate">
                <span className="font-600">{a.title}</span>
                <span className="text-vault-muted">
                  {' '}
                  · {a.fieldLabel}
                  {names.has(a.memberId) ? ` · ${names.get(a.memberId)}` : ''} —{' '}
                </span>
                <span className={a.daysUntil < 0 ? 'text-red-300 font-600' : 'text-amber-200/95'}>
                  {formatExpirySummary(a.daysUntil)}
                </span>
              </li>
            ))}
            {alerts.length > 6 && <li className="text-vault-faint">+{alerts.length - 6} more…</li>}
          </ul>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/document-vault"
              className="text-xs font-700 text-vault-warm hover:text-vault-text transition-colors"
            >
              Open Document Vault →
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="text-xs font-600 text-vault-muted hover:text-vault-text transition-colors"
            >
              Dismiss for today
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="flex-shrink-0 rounded-lg p-1 text-vault-muted transition-colors hover:bg-vault-elevated hover:text-vault-text"
          aria-label="Dismiss expiry alert"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
