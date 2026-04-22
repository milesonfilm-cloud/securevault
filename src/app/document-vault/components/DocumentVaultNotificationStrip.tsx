'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { AlertOctagon, AlertTriangle, Compass, Info, Moon, Palette, Sun, Zap } from 'lucide-react';
import { getNextTheme, THEME_LABEL, useTheme } from '@/context/ThemeContext';
import type { Document } from '@/lib/storage';
import {
  DEFAULT_EXPIRY_WARN_DAYS,
  listDocIdsByExpirySeverity,
  summarizeExpiryDocCounts,
} from '@/lib/documentExpiry';

interface DocumentVaultNotificationStripProps {
  documents: Document[];
  /** Scroll to document and highlight row; clears filters should be done by parent before this. */
  onGoToDocument: (docId: string, variant: 'critical' | 'warning') => void;
  /** Optional: scroll document list into view */
  onInfoClick?: () => void;
}

/**
 * Top-centre status strip: critical (expired), warning (expiring), informational (vault).
 * Click cycles through matching documents and navigates the list.
 */
export default function DocumentVaultNotificationStrip({
  documents,
  onGoToDocument,
  onInfoClick,
}: DocumentVaultNotificationStripProps) {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = getNextTheme(theme);
  const DestIcon =
    nextTheme === 'vault'
      ? Moon
      : nextTheme === 'wellness'
        ? Sun
        : nextTheme === 'neon'
          ? Zap
          : nextTheme === 'pastel'
            ? Palette
            : Compass;
  const { expired, soon } = useMemo(
    () => summarizeExpiryDocCounts(documents, DEFAULT_EXPIRY_WARN_DAYS),
    [documents]
  );

  const { expired: expiredIds, soon: soonIds } = useMemo(
    () => listDocIdsByExpirySeverity(documents, DEFAULT_EXPIRY_WARN_DAYS),
    [documents]
  );

  const [critIdx, setCritIdx] = useState(0);
  const [warnIdx, setWarnIdx] = useState(0);

  const handleCritical = useCallback(() => {
    if (expiredIds.length === 0) return;
    const id = expiredIds[critIdx % expiredIds.length];
    setCritIdx((c) => c + 1);
    onGoToDocument(id, 'critical');
  }, [expiredIds, critIdx, onGoToDocument]);

  const handleWarning = useCallback(() => {
    if (soonIds.length === 0) return;
    const id = soonIds[warnIdx % soonIds.length];
    setWarnIdx((c) => c + 1);
    onGoToDocument(id, 'warning');
  }, [soonIds, warnIdx, onGoToDocument]);

  const baseBtn =
    'flex h-10 w-10 items-center justify-center rounded-xl border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-vault-warm/60 focus-visible:ring-offset-2 focus-visible:ring-offset-vault-panel';

  return (
    <div className="flex w-full justify-center mb-4 pointer-events-auto">
      <div
        role="group"
        aria-label="Vault expiry, status, and theme"
        className="inline-flex items-center gap-1 sm:gap-2 rounded-2xl border border-[color:var(--color-border)] bg-vault-panel/95 px-2 py-1.5 shadow-vault backdrop-blur-sm"
      >
        {expired > 0 ? (
          <button
            type="button"
            onClick={handleCritical}
            className={`${baseBtn} border-red-500 bg-red-600/25 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.25)] hover:bg-red-600/35`}
            title={`Critical: ${expired} document${expired === 1 ? '' : 's'} with expired dates — click to open in list`}
            aria-label={`Critical: ${expired} expired — go to document in list`}
          >
            <AlertOctagon size={20} strokeWidth={2.5} className="text-red-500" aria-hidden />
          </button>
        ) : (
          <span
            role="img"
            className={`${baseBtn} border-[color:var(--color-border)] bg-transparent text-vault-faint/40 cursor-default`}
            title="Critical: no expired documents"
            aria-label="Critical: no expired documents"
          >
            <AlertOctagon size={20} strokeWidth={2.25} aria-hidden />
          </span>
        )}

        {soon > 0 ? (
          <button
            type="button"
            onClick={handleWarning}
            className={`${baseBtn} border-amber-400/45 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25`}
            title={`Warning: ${soon} document${soon === 1 ? '' : 's'} expiring within ${DEFAULT_EXPIRY_WARN_DAYS} days — click to open in list`}
            aria-label={`Warning: ${soon} expiring soon — go to document in list`}
          >
            <AlertTriangle size={20} strokeWidth={2.25} aria-hidden />
          </button>
        ) : (
          <span
            role="img"
            className={`${baseBtn} border-[color:var(--color-border)] bg-transparent text-vault-faint/40 cursor-default`}
            title={`Warning: no documents expiring within ${DEFAULT_EXPIRY_WARN_DAYS} days`}
            aria-label={`Warning: no documents expiring within ${DEFAULT_EXPIRY_WARN_DAYS} days`}
          >
            <AlertTriangle size={20} strokeWidth={2.25} aria-hidden />
          </span>
        )}

        <button
          type="button"
          onClick={onInfoClick}
          className={`${baseBtn} border-sky-400/25 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20`}
          title="Informational: vault data is stored only on this device; works offline. Click to scroll to documents."
          aria-label="Informational: local vault — scroll to document list"
        >
          <Info size={20} strokeWidth={2.25} aria-hidden />
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className={`${baseBtn} border-vault-warm/35 bg-vault-warm/10 text-vault-warm hover:bg-vault-warm/20`}
          title={`Current: ${THEME_LABEL[theme]} — switch to ${THEME_LABEL[nextTheme]}`}
          aria-label={`Current theme ${THEME_LABEL[theme]}, switch to ${THEME_LABEL[nextTheme]}`}
        >
          <DestIcon size={20} strokeWidth={2.25} aria-hidden />
        </button>
      </div>
    </div>
  );
}
