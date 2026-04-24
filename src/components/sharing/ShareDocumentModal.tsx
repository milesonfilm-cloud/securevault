'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import type { CategoryId, Document, ShareLink } from '@/lib/storage';
import { getCategoryById } from '@/lib/categories';
import { useVaultData } from '@/context/VaultDataContext';
import {
  encryptSharePayload,
  importShareKeyMaterial,
  randomShareKeyB64Url,
} from '@/lib/sharing/shareCrypto';

const EXPIRY_OPTIONS = [
  { label: '24 hours', ms: 24 * 60 * 60 * 1000 },
  { label: '7 days', ms: 7 * 24 * 60 * 60 * 1000 },
  { label: '30 days', ms: 30 * 24 * 60 * 60 * 1000 },
] as const;

function buildSensitiveKeys(
  categoryId: CategoryId,
  includedKeys: Set<string>
): string[] {
  const cat = getCategoryById(categoryId);
  if (!cat) return [];
  const keys: string[] = [];
  for (const f of cat.fields) {
    if (!includedKeys.has(f.key)) continue;
    if (f.sensitive || f.key.trim().toLowerCase() === 'password') keys.push(f.key);
  }
  return keys;
}

interface ShareDocumentModalProps {
  doc: Document;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareDocumentModal({ doc, isOpen, onClose }: ShareDocumentModalProps) {
  const { vaultData, persistVaultData } = useVaultData();
  const cat = getCategoryById(doc.categoryId);
  const [expiryIdx, setExpiryIdx] = useState(0);
  const [included, setIncluded] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);

  const fieldKeys = useMemo(() => cat?.fields.map((f) => f.key) ?? [], [cat]);

  React.useEffect(() => {
    if (!isOpen || !cat) return;
    const init: Record<string, boolean> = {};
    for (const f of cat.fields) {
      init[f.key] = true;
    }
    setIncluded(init);
    setExpiryIdx(0);
  }, [isOpen, cat, doc.id]);

  const toggleField = (key: string) => {
    setIncluded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreate = async () => {
    if (!cat) return;
    const keys = new Set(fieldKeys.filter((k) => included[k]));
    if (keys.size === 0) {
      toast.error('Select at least one field to share');
      return;
    }
    const fields: Record<string, string> = {};
    for (const k of keys) {
      fields[k] = doc.fields[k] ?? '';
    }
    const sensitiveKeys = buildSensitiveKeys(doc.categoryId, keys);
    const shareId = crypto.randomUUID();
    const keyMaterial = randomShareKeyB64Url();
    setBusy(true);
    try {
      const cryptoKey = await importShareKeyMaterial(keyMaterial);
      const { ivB64, ctB64 } = await encryptSharePayload(cryptoKey, {
        docTitle: doc.title,
        categoryId: doc.categoryId,
        fields,
        sensitiveKeys,
      });
      const cipherB64 = btoa(JSON.stringify({ ivB64, ctB64 }));
      const ms = EXPIRY_OPTIONS[expiryIdx].ms;
      const expiresAt = new Date(Date.now() + ms).toISOString();
      const res = await fetch('/api/share/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: shareId, cipherB64, expiresAt }),
      });
      if (!res.ok) throw new Error('publish_failed');
      const link: ShareLink = {
        id: crypto.randomUUID(),
        shareId,
        docId: doc.id,
        docTitle: doc.title,
        categoryId: doc.categoryId,
        createdAt: new Date().toISOString(),
        expiresAt,
        views: [],
      };
      await persistVaultData({
        ...vaultData,
        shareLinks: [...vaultData.shareLinks, link],
      });
      const url = `${window.location.origin}/share/${shareId}#k=${keyMaterial}`;
      await navigator.clipboard.writeText(url);
      toast.success('Share link copied — key is only in the link; keep it private');
      onClose();
    } catch {
      toast.error('Could not create share link');
    } finally {
      setBusy(false);
    }
  };

  if (!cat) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Share document" size="md">
        <p className="p-6 text-sm text-vault-muted">Unknown category — cannot share.</p>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share document" subtitle={doc.title} size="md">
      <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
        <div>
          <p className="text-xs font-700 text-vault-muted uppercase tracking-wider mb-2">
            Expires
          </p>
          <div className="flex flex-wrap gap-2">
            {EXPIRY_OPTIONS.map((opt, i) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setExpiryIdx(i)}
                className={`rounded-xl px-3 py-2 text-xs font-600 border ${
                  expiryIdx === i
                    ? 'border-vault-warm bg-vault-warm/15 text-vault-text'
                    : 'border-border text-vault-muted hover:bg-vault-elevated/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-700 text-vault-muted uppercase tracking-wider mb-2">
            Fields to include
          </p>
          <ul className="space-y-2">
            {cat.fields.map((f) => (
              <li key={f.key}>
                <label className="flex items-center gap-3 cursor-pointer text-sm text-vault-text">
                  <input
                    type="checkbox"
                    checked={!!included[f.key]}
                    onChange={() => toggleField(f.key)}
                    className="rounded border-border"
                  />
                  <span>{f.label}</span>
                  {f.sensitive && (
                    <span className="text-[10px] uppercase text-vault-faint">Sensitive</span>
                  )}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-vault-faint leading-relaxed">
          A time-limited link is created; field data is encrypted and the decryption key is only in
          the URL fragment (not sent to the server). Recipients see masked sensitive values by
          default.
        </p>

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary justify-center min-w-[120px]"
            onClick={() => void handleCreate()}
            disabled={busy}
          >
            {busy ? 'Creating…' : 'Create link & copy'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
