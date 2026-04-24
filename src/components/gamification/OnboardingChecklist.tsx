'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { Check, X } from 'lucide-react';
import type { VaultData } from '@/lib/storage';
import { cn } from '@/lib/utils';

const STORAGE_STATE = 'sv_onboarding_checklist_v1';

type ChecklistPersist = {
  dismissed: boolean;
  /** User tapped through Progress link at least once. */
  visitedProgress: boolean;
};

function readPersist(): ChecklistPersist {
  if (typeof window === 'undefined') {
    return { dismissed: false, visitedProgress: false };
  }
  try {
    const raw = localStorage.getItem(STORAGE_STATE);
    if (!raw) return { dismissed: false, visitedProgress: false };
    const p = JSON.parse(raw) as Partial<ChecklistPersist>;
    return {
      dismissed: !!p.dismissed,
      visitedProgress: !!p.visitedProgress,
    };
  } catch {
    return { dismissed: false, visitedProgress: false };
  }
}

function writePersist(p: ChecklistPersist) {
  try {
    localStorage.setItem(STORAGE_STATE, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

interface OnboardingChecklistProps {
  vaultData: VaultData;
  className?: string;
}

export default function OnboardingChecklist({ vaultData, className }: OnboardingChecklistProps) {
  const [persist, setPersist] = useState<ChecklistPersist>({
    dismissed: false,
    visitedProgress: false,
  });

  useEffect(() => {
    setPersist(readPersist());
  }, []);

  const steps = useMemo(() => {
    const hasMember = vaultData.members.length >= 1;
    const hasDoc = vaultData.documents.length >= 1;
    const backup =
      vaultData.exportHistory.length >= 1 ||
      vaultData.settings.cloudSyncEnabled === true;
    return [
      { id: 'member', label: 'Add a family member', done: hasMember },
      { id: 'document', label: 'Add your first document', done: hasDoc },
      { id: 'progress', label: 'Open the Progress page', done: persist.visitedProgress },
      { id: 'backup', label: 'Export once or enable cloud sync', done: backup },
    ];
  }, [vaultData.members.length, vaultData.documents.length, vaultData.exportHistory.length, vaultData.settings.cloudSyncEnabled, persist.visitedProgress]);

  const allDone = steps.every((s) => s.done);

  const dismiss = useCallback(() => {
    const next = { ...persist, dismissed: true };
    setPersist(next);
    writePersist(next);
  }, [persist]);

  if (persist.dismissed) return null;

  return (
    <div
      className={cn(
        'relative rounded-2xl border border-[color:var(--color-border)] bg-vault-panel p-4 shadow-vault',
        className
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-800 uppercase tracking-wider text-vault-warm">Getting started</p>
          <h2 className="mt-0.5 text-base font-800 text-vault-text">Vault checklist</h2>
        </div>
        {allDone ? (
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg p-1.5 text-vault-faint hover:bg-vault-elevated hover:text-vault-text"
            aria-label="Dismiss checklist"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>
      <ul className="space-y-2">
        {steps.map((s) => (
          <li key={s.id}>
            {s.id === 'progress' && !s.done ? (
              <Link
                href="/progress"
                onClick={() => {
                  const next = { ...readPersist(), visitedProgress: true };
                  setPersist(next);
                  writePersist(next);
                }}
                className="flex items-center gap-3 rounded-xl border border-border bg-vault-elevated/50 px-3 py-2.5 text-left transition-colors hover:bg-vault-elevated"
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-800',
                    'border-vault-warm/40 text-vault-warm'
                  )}
                >
                  Go
                </span>
                <span className="text-sm font-semibold text-vault-text">{s.label}</span>
              </Link>
            ) : (
              <div
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-3 py-2.5',
                  s.done
                    ? 'border-vault-warm/35 bg-vault-warm/10'
                    : 'border-border bg-vault-elevated/30'
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
                    s.done
                      ? 'border-vault-warm bg-vault-warm/20 text-vault-warm'
                      : 'border-border text-vault-faint'
                  )}
                >
                  {s.done ? <Check size={16} strokeWidth={2.5} /> : <span className="text-xs tabular-nums"> </span>}
                </span>
                <span
                  className={cn(
                    'text-sm font-semibold',
                    s.done ? 'text-vault-text line-through opacity-80' : 'text-vault-muted'
                  )}
                >
                  {s.label}
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
      {allDone ? (
        <p className="mt-3 text-center text-xs text-vault-muted">You&apos;re all set — close this card anytime.</p>
      ) : null}
    </div>
  );
}

/** Call from Progress page mount to mark the progress step without requiring link click. */
export function markProgressChecklistVisited() {
  if (typeof window === 'undefined') return;
  const cur = readPersist();
  writePersist({ ...cur, visitedProgress: true });
}
