'use client';

import React, { useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import type { Document } from '@/lib/storage';
import { useVaultData } from '@/context/VaultDataContext';
import { useVaultPermissions } from '@/hooks/useVaultPermissions';
import {
  downloadBlob,
  encryptPdfBytesWithPassword,
  encryptedBundleToDownloadBlob,
  generateEmergencyPDF,
  type EmergencyPdfRow,
} from '@/lib/emergency/pdfBundleGenerator';

interface EmergencyPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyPDFModal({ isOpen, onClose }: EmergencyPDFModalProps) {
  const { vaultData } = useVaultData();
  const { visibleDocuments } = useVaultPermissions();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const membersById = useMemo(
    () => new Map(vaultData.members.map((m) => [m.id, m.name])),
    [vaultData.members]
  );

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const selectAll = () => {
    const next: Record<string, boolean> = {};
    for (const d of visibleDocuments) next[d.id] = true;
    setSelected(next);
  };

  const handleDownload = async () => {
    const ids = visibleDocuments.filter((d) => selected[d.id]).map((d) => d.id);
    if (ids.length === 0) return;
    setBusy(true);
    try {
      const rows: EmergencyPdfRow[] = ids
        .map((id) => visibleDocuments.find((d) => d.id === id))
        .filter((d): d is Document => !!d)
        .map((d) => ({
          doc: d,
          memberName: membersById.get(d.memberId) ?? 'Member',
        }));
      const pdfBytes = await generateEmergencyPDF(rows);
      const stamp = new Date().toISOString().slice(0, 10);
      if (password.trim()) {
        const bundle = await encryptPdfBytesWithPassword(pdfBytes, password.trim());
        downloadBlob(
          encryptedBundleToDownloadBlob(bundle),
          `SecureVault_Emergency_${stamp}.pdf.enc.json`
        );
      } else {
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
        downloadBlob(blob, `SecureVault_Emergency_${stamp}.pdf`);
      }
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Emergency PDF bundle"
      subtitle="Exports selected documents into one PDF. Optional password wraps AES-256 encryption."
      size="lg"
    >
      <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="flex gap-2">
          <button type="button" className="btn-secondary text-xs py-1.5 px-3" onClick={selectAll}>
            Select all
          </button>
          <button
            type="button"
            className="btn-secondary text-xs py-1.5 px-3"
            onClick={() => setSelected({})}
          >
            Clear
          </button>
        </div>
        <ul className="space-y-2">
          {visibleDocuments.map((d) => (
            <li key={d.id}>
              <label className="flex items-center gap-3 cursor-pointer text-sm text-vault-text">
                <input
                  type="checkbox"
                  checked={!!selected[d.id]}
                  onChange={() => toggle(d.id)}
                  className="rounded border-border"
                />
                <span className="truncate">{d.title}</span>
              </label>
            </li>
          ))}
        </ul>
        <label className="block">
          <span className="text-[11px] font-700 text-vault-faint uppercase">
            Optional encryption password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave empty for plain PDF"
            className="mt-1 w-full rounded-xl border border-border bg-vault-elevated px-3 py-2 text-sm text-vault-text"
          />
        </label>
        <p className="text-xs text-vault-faint">
          With a password, you download a JSON envelope (.pdf.enc.json) compatible with SecureVault
          decryption (PBKDF2 + AES-GCM).
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={() => void handleDownload()} disabled={busy}>
            {busy ? 'Building…' : 'Download'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
