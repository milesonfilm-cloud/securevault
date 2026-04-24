'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';
import { useVaultData } from '@/context/VaultDataContext';
import type { Document } from '@/lib/storage';
import { DigiLockerClient, type DigiLockerIssuedItem } from '@/lib/digilocker/client';
import { mapDigiLockerDocToVaultDoc } from '@/lib/digilocker/mapper';

interface DigiLockerImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DigiLockerImportModal({ isOpen, onClose }: DigiLockerImportModalProps) {
  const { vaultData, persistVaultData } = useVaultData();
  const [memberId, setMemberId] = useState<string>(() => vaultData.members[0]?.id ?? '');
  const [items, setItems] = useState<DigiLockerIssuedItem[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const loadList = useCallback(async () => {
    const token = DigiLockerClient.getStoredToken();
    if (!token) {
      toast.error('Connect DigiLocker first');
      return;
    }
    setLoading(true);
    try {
      const client = new DigiLockerClient(token);
      const list = await client.getIssuedDocuments();
      setItems(list);
      const init: Record<string, boolean> = {};
      for (const it of list) init[it.uri] = false;
      setSelected(init);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load issued documents');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (vaultData.members[0]?.id) setMemberId((m) => m || vaultData.members[0].id);
    void loadList();
  }, [isOpen, loadList, vaultData.members]);

  const toggle = (uri: string) => setSelected((s) => ({ ...s, [uri]: !s[uri] }));

  const importSelected = async () => {
    const token = DigiLockerClient.getStoredToken();
    if (!token || !memberId) {
      toast.error('Select a family member');
      return;
    }
    const picks = items.filter((i) => selected[i.uri]);
    if (picks.length === 0) {
      toast.error('Select at least one document');
      return;
    }
    setImporting(true);
    try {
      const now = new Date().toISOString();
      const newDocs: Document[] = picks.map((dl, idx) => {
        const partial = mapDigiLockerDocToVaultDoc(dl, memberId);
        return {
          id: `doc-dl-${Date.now()}-${idx}`,
          memberId,
          categoryId: partial.categoryId!,
          title: partial.title!,
          fields: partial.fields ?? {},
          notes: partial.notes ?? '',
          createdAt: now,
          updatedAt: now,
          tags: partial.tags ?? ['digilocker'],
          stackId: null,
          isDigiLockerVerified: true,
        };
      });
      await persistVaultData({
        ...vaultData,
        documents: [...vaultData.documents, ...newDocs],
      });
      toast.success(`Imported ${newDocs.length} document(s)`);
      onClose();
    } catch {
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import from DigiLocker"
      subtitle="Choose issued documents to add as vault records (metadata only)."
      size="lg"
    >
      <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
        <label className="block">
          <span className="text-[11px] font-700 text-vault-faint uppercase">Assign to member</span>
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-vault-elevated px-3 py-2 text-sm text-vault-text"
          >
            {vaultData.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>

        {loading ? (
          <p className="text-sm text-vault-muted py-6 text-center">Loading issued documents…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-vault-muted py-6 text-center">No issued documents returned.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((it) => (
              <li
                key={it.uri}
                className="flex gap-3 items-start rounded-xl border border-border bg-vault-elevated/40 p-3"
              >
                <input
                  type="checkbox"
                  checked={!!selected[it.uri]}
                  onChange={() => toggle(it.uri)}
                  className="mt-1 rounded border-border"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-700 text-vault-text">{it.name}</p>
                  <p className="text-xs text-vault-muted">{it.description}</p>
                  <p className="text-[10px] text-vault-faint mt-1 font-mono truncate">
                    {it.doctype} · {it.uri}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={importing}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => void importSelected()}
            disabled={importing || loading || items.length === 0}
          >
            {importing ? 'Importing…' : 'Import selected'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
