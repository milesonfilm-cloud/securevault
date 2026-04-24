'use client';

import React, { useState } from 'react';
import { getCategoryById } from '@/lib/categories';
import type { CategoryId } from '@/lib/storage';
import type { SharePayload } from '@/lib/sharing/shareCrypto';
import ConfirmModal from '@/components/ui/ConfirmModal';

function isPasswordFieldKey(key: string): boolean {
  return key.trim().toLowerCase() === 'password';
}

function maskSensitiveLastFour(value: string): string {
  const compact = value.replace(/\s+/g, '');
  if (compact.length <= 4) return 'XXXX';
  const last4 = compact.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

export default function SharedDocumentView({ payload }: { payload: SharePayload }) {
  const [showFull, setShowFull] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cat = getCategoryById(payload.categoryId as CategoryId);

  const displayValue = (key: string, raw: string): string => {
    if (!showFull && isPasswordFieldKey(key)) return '••••••••';
    if (!showFull && payload.sensitiveKeys.includes(key)) return maskSensitiveLastFour(raw);
    return raw;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-vault-panel p-5 shadow-vault">
        {cat && (
          <p
            className="text-[10px] font-bold uppercase tracking-[1.5px] mb-1"
            style={{ color: cat.color }}
          >
            {cat.shortLabel}
          </p>
        )}
        <h1 className="text-xl font-bold text-vault-text">{payload.docTitle}</h1>
        <p className="mt-3 text-xs text-vault-faint italic border-t border-border pt-3">
          Shared by SecureVault — View only
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-vault-panel overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {Object.entries(payload.fields).map(([key, val]) => {
              const fieldCfg = cat?.fields.find((f) => f.key === key);
              const label = fieldCfg?.label ?? key;
              return (
                <tr key={key} className="border-b border-border last:border-0">
                  <th className="text-left py-3 px-4 font-600 text-vault-muted w-[40%] align-top">
                    {label}
                  </th>
                  <td className="py-3 px-4 text-vault-text break-words">{displayValue(key, val)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!showFull && (
        <button
          type="button"
          className="w-full rounded-xl border border-border bg-vault-elevated py-3 text-sm font-600 text-vault-text hover:bg-vault-elevated/80"
          onClick={() => setConfirmOpen(true)}
        >
          Show full values
        </button>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setShowFull(true);
          setConfirmOpen(false);
        }}
        title="Show sensitive values?"
        description="Anyone who can see this screen will be able to read full IDs and passwords. Only continue if you trust this environment."
        confirmLabel="Show values"
        isDanger
      />
    </div>
  );
}
