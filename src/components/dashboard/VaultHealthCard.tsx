'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  FilePlus2,
  FolderOpen,
  Loader2,
} from 'lucide-react';
import { useVaultHealth } from '@/hooks/useVaultHealth';
import type { VaultData } from '@/lib/storage';
import { getMissingCriticalDocs } from '@/lib/vaultHealth/scoreCalculator';

interface VaultHealthCardProps {
  vaultData: VaultData;
  loading: boolean;
}

export default function VaultHealthCard({ vaultData, loading }: VaultHealthCardProps) {
  const { score, suggestions, aiLoading, aiError, refreshAi } = useVaultHealth(vaultData, loading);
  const [expanded, setExpanded] = useState(true);
  const missing = getMissingCriticalDocs(vaultData);

  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score.score / 100);

  return (
    <div className="rounded-2xl border border-border bg-vault-panel shadow-vault overflow-hidden">
      <div className="p-5 flex flex-col sm:flex-row gap-5 sm:items-center">
        <div className="relative w-[120px] h-[120px] shrink-0 mx-auto sm:mx-0">
          <svg width="120" height="120" className="-rotate-90">
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="color-mix(in srgb, var(--vault-c-elevated) 90%, transparent)"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="var(--vault-c-warm)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${c} ${c}`}
              strokeDashoffset={offset}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-800 text-vault-text tabular-nums">{score.score}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-vault-faint">
              Health
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-800 uppercase tracking-[0.18em] text-vault-faint">
                Vault health
              </p>
              <p className="text-sm text-vault-muted mt-1">
                Based on critical documents, required fields, expiries, and photo attachments — plus
                optional AI tips (no sensitive values sent).
              </p>
            </div>
            <button
              type="button"
              onClick={() => refreshAi()}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-vault-elevated px-3 py-2 text-xs font-700 text-vault-text hover:bg-vault-elevated/80 disabled:opacity-50"
            >
              {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Refresh tips
            </button>
          </div>

          {missing.length > 0 && (
            <p className="text-xs text-amber-200/90 mt-3">
              Missing checklist items for {missing.length} member{missing.length === 1 ? '' : 's'} —
              open suggestions below.
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-center gap-2 py-2 text-xs font-700 text-vault-muted border-t border-border hover:bg-vault-elevated/40"
      >
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {expanded ? 'Hide suggestions' : 'Show suggestions'}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-border bg-vault-elevated/25">
          {aiLoading && suggestions.length === 0 ? (
            <div className="space-y-2 pt-4 animate-pulse">
              <div className="h-4 rounded bg-vault-elevated w-full" />
              <div className="h-4 rounded bg-vault-elevated w-5/6" />
              <div className="h-4 rounded bg-vault-elevated w-4/6" />
            </div>
          ) : aiError ? (
            <p className="text-xs text-red-300 pt-4">
              Could not load AI suggestions ({aiError}). Check ANTHROPIC_API_KEY and try refresh.
            </p>
          ) : (
            <ul className="pt-4 space-y-3">
              {suggestions.map((s, i) => (
                <li
                  key={`sug-${i}`}
                  className="flex gap-3 rounded-xl border border-border bg-vault-panel px-3 py-3"
                >
                  <Sparkles size={18} className="text-vault-warm shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-vault-text leading-snug">{s}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Link
                        href="/document-vault"
                        className="inline-flex items-center gap-1.5 text-[11px] font-800 uppercase tracking-wide text-vault-warm hover:text-vault-text"
                      >
                        <FilePlus2 size={14} />
                        Add document
                      </Link>
                      <Link
                        href="/document-vault"
                        className="inline-flex items-center gap-1.5 text-[11px] font-800 uppercase tracking-wide text-vault-muted hover:text-vault-warm"
                      >
                        <FolderOpen size={14} />
                        Open vault
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
              {suggestions.length === 0 && !aiLoading && (
                <li className="text-xs text-vault-muted py-2">No suggestions yet — try refresh.</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
