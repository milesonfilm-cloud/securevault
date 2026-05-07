'use client';

import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isDanger?: boolean;
  isLoading?: boolean;
  /**
   * Optional list of consequences shown as bullet points so the user
   * understands exactly what the action will do.
   */
  details?: React.ReactNode[];
  /**
   * If provided, the user must type this exact word (case-sensitive) before
   * the confirm button is enabled. Used for irreversible destructive actions.
   */
  requiredTypedText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  isDanger = false,
  isLoading = false,
  details,
  requiredTypedText,
}: ConfirmModalProps) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (isOpen) setTyped('');
  }, [isOpen]);

  const needsTyping = Boolean(requiredTypedText);
  const typedMatches = !needsTyping || typed === requiredTypedText;
  const confirmDisabled = isLoading || !typedMatches;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="p-6 text-center">
        <div
          className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 border border-border ${isDanger ? 'bg-red-500/15' : 'bg-vault-warm/15'}`}
        >
          <AlertTriangle size={24} className={isDanger ? 'text-red-400' : 'text-vault-warm'} />
        </div>
        <h3 className="text-lg font-700 text-vault-text mb-2">{title}</h3>
        <p className="text-sm text-vault-muted mb-4">{description}</p>

        {details && details.length > 0 && (
          <ul
            className={`mx-auto mb-5 max-w-sm space-y-1.5 rounded-xl border px-4 py-3 text-left text-xs ${isDanger ? 'border-red-500/25 bg-red-500/5 text-vault-text' : 'border-border bg-vault-elevated text-vault-text'}`}
          >
            {details.map((item, idx) => (
              <li key={idx} className="flex gap-2">
                <span className={isDanger ? 'text-red-400' : 'text-vault-warm'} aria-hidden>
                  •
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        )}

        {needsTyping && (
          <div className="mx-auto mb-5 max-w-sm text-left">
            <label
              htmlFor="confirm-typed-input"
              className="mb-1.5 block text-xs font-600 text-vault-muted"
            >
              Type{' '}
              <span className="rounded bg-red-500/15 px-1.5 py-0.5 font-800 tracking-wider text-red-400">
                {requiredTypedText}
              </span>{' '}
              to confirm
            </label>
            <input
              id="confirm-typed-input"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              disabled={isLoading}
              placeholder={requiredTypedText}
              className="w-full rounded-xl border border-border bg-vault-elevated px-3 py-2.5 text-center text-sm font-700 tracking-wider text-vault-text outline-none transition-colors focus:border-red-500/60"
            />
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="btn-secondary" disabled={isLoading}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={`${isDanger ? 'btn-danger' : 'btn-primary'} min-w-[100px] justify-center disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Working...
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
