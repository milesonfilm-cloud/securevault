'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import { useVaultData } from '@/context/VaultDataContext';
import type { HandoverPayload } from '@/lib/emergency/handoverPayload';
import {
  encryptJsonPayload,
  importShareKeyMaterial,
  randomShareKeyB64Url,
} from '@/lib/sharing/shareCrypto';

interface VaultHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VaultHandoverModal({ isOpen, onClose }: VaultHandoverModalProps) {
  const { vaultData } = useVaultData();
  const [busy, setBusy] = useState(false);

  const buildPayload = (): HandoverPayload => {
    const names = new Map(vaultData.members.map((m) => [m.id, m.name]));
    return {
      generatedAt: new Date().toISOString(),
      documents: vaultData.documents.map((d) => ({
        title: d.title,
        categoryId: d.categoryId,
        memberName: names.get(d.memberId) ?? 'Member',
        fields: { ...d.fields },
        notes: d.notes ?? '',
      })),
    };
  };

  const generate = async () => {
    if (vaultData.documents.length === 0) {
      toast.error('No documents to include');
      return;
    }
    setBusy(true);
    try {
      const handoverId = crypto.randomUUID();
      const keyMaterial = randomShareKeyB64Url();
      const cryptoKey = await importShareKeyMaterial(keyMaterial);
      const { ivB64, ctB64 } = await encryptJsonPayload(cryptoKey, buildPayload());
      const cipherB64 = btoa(JSON.stringify({ ivB64, ctB64 }));
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
      const res = await fetch('/api/emergency/handover/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: handoverId, cipherB64, expiresAt }),
      });
      if (!res.ok) throw new Error('publish_failed');
      const url = `${window.location.origin}/handover/${handoverId}#k=${keyMaterial}`;
      await navigator.clipboard.writeText(url);
      toast.success('Handover link copied — valid 72 hours; key is in the URL fragment');
      onClose();
    } catch {
      toast.error('Could not create handover link');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vault handover link"
      subtitle="Read-only snapshot of all current documents — encrypted; decryption key only in the link."
      size="md"
    >
      <div className="p-6 space-y-4">
        <p className="text-xs text-vault-muted leading-relaxed">
          Anyone with the full URL can read document field values until the link expires. Share only
          with someone you trust.
        </p>
        <button
          type="button"
          className="btn-primary w-full justify-center"
          onClick={() => void generate()}
          disabled={busy}
        >
          {busy ? 'Generating…' : 'Generate & copy link'}
        </button>
      </div>
    </Modal>
  );
}
