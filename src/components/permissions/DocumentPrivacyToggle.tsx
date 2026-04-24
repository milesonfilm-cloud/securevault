'use client';

import React from 'react';
import { Lock, Users } from 'lucide-react';
import type { Document } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface DocumentPrivacyToggleProps {
  document: Document;
  disabled?: boolean;
  onChange: (nextPrivate: boolean) => void;
}

/**
 * Owner toggles whether a document is hidden from admins ("private") vs visible in the family vault.
 */
export default function DocumentPrivacyToggle({
  document: doc,
  disabled = false,
  onChange,
}: DocumentPrivacyToggleProps) {
  const isPrivate = !!doc.isPrivate;

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-xl border border-border bg-vault-elevated/50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[11px] font-700 uppercase tracking-wider text-vault-muted">
        Family visibility
      </p>
      <div className="flex rounded-xl border border-border p-0.5 bg-vault-panel">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(true)}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200',
            isPrivate
              ? 'bg-vault-warm text-vault-ink shadow-sm'
              : 'text-vault-muted hover:text-vault-text'
          )}
        >
          <Lock size={14} className="shrink-0" />
          Private (hidden from admin)
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(false)}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200',
            !isPrivate
              ? 'bg-vault-warm text-vault-ink shadow-sm'
              : 'text-vault-muted hover:text-vault-text'
          )}
        >
          <Users size={14} className="shrink-0" />
          Shared with family
        </button>
      </div>
    </div>
  );
}
