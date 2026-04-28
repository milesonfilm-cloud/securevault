'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, FileDown, Link2, ArrowLeft } from 'lucide-react';
import { useVaultData } from '@/context/VaultDataContext';
import EmergencyContactSetup from '@/components/emergency/EmergencyContactSetup';
import EmergencyPDFModal from '@/components/emergency/EmergencyPDFModal';
import VaultHandoverModal from '@/components/emergency/VaultHandoverModal';
import VaultPageHeading from '@/components/ui/VaultPageHeading';

export default function EmergencySettingsContent() {
  const { vaultData, persistVaultData } = useVaultData();
  const [pdfOpen, setPdfOpen] = useState(false);
  const [handoverOpen, setHandoverOpen] = useState(false);
  const emergencyOn = vaultData.settings.emergencyModeEnabled;

  const toggleMode = async () => {
    await persistVaultData({
      ...vaultData,
      settings: { ...vaultData.settings, emergencyModeEnabled: !emergencyOn },
    });
  };

  return (
    <div className="p-4 lg:p-6 max-w-screen-lg mx-auto bg-vault-bg min-h-full space-y-6">
      <Link
        href="/settings-export"
        className="inline-flex items-center gap-2 text-xs font-700 text-vault-warm hover:text-vault-text"
      >
        <ArrowLeft size={16} />
        Back to settings
      </Link>

      <VaultPageHeading
        icon={
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-vault-panel text-vault-coral">
            <ShieldAlert size={24} aria-hidden />
          </div>
        }
        title="Emergency access"
        description="Trusted contact, encrypted exports, and time-limited read-only handover links."
        titleClassName="mt-0.5 text-[28px] font-bold tracking-tight text-vault-text sm:text-[32px]"
      />

      <label className="flex items-center gap-3 cursor-pointer neo-card rounded-2xl p-5">
        <input
          type="checkbox"
          checked={emergencyOn}
          onChange={() => void toggleMode()}
          className="rounded border-border"
        />
        <div>
          <p className="text-sm font-800 text-vault-text">Emergency mode (read-only vault)</p>
          <p className="text-xs text-vault-muted mt-0.5">
            Hides edits in the vault UI — use when you want view-only access on this device.
          </p>
        </div>
      </label>

      <EmergencyContactSetup />

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setPdfOpen(true)}
          className="neo-card rounded-2xl p-5 text-left hover:bg-vault-elevated/30 transition-colors"
        >
          <FileDown className="text-vault-warm mb-2" size={22} />
          <p className="text-sm font-800 text-vault-text">Emergency PDF bundle</p>
          <p className="text-xs text-vault-muted mt-1">
            Select documents, optional AES-wrapped export.
          </p>
        </button>
        <button
          type="button"
          onClick={() => setHandoverOpen(true)}
          className="neo-card rounded-2xl p-5 text-left hover:bg-vault-elevated/30 transition-colors"
        >
          <Link2 className="text-vault-warm mb-2" size={22} />
          <p className="text-sm font-800 text-vault-text">Handover link (72h)</p>
          <p className="text-xs text-vault-muted mt-1">Encrypted snapshot; key in URL fragment.</p>
        </button>
      </div>

      <EmergencyPDFModal isOpen={pdfOpen} onClose={() => setPdfOpen(false)} />
      <VaultHandoverModal isOpen={handoverOpen} onClose={() => setHandoverOpen(false)} />
    </div>
  );
}
