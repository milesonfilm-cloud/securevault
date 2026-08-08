'use client';

import React, { useState } from 'react';
import { ShieldAlert, FileDown, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useVaultData } from '@/context/VaultDataContext';
import EmergencyContactSetup from '@/components/emergency/EmergencyContactSetup';
import EmergencyPDFModal from '@/components/emergency/EmergencyPDFModal';
import VaultPageHeading from '@/components/ui/VaultPageHeading';

export default function EmergencySettingsContent() {
  const { vaultData, persistVaultData } = useVaultData();
  const t = useTranslations('emergencySettingsPage');
  const [pdfOpen, setPdfOpen] = useState(false);
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
        {t('backLink')}
      </Link>

      <VaultPageHeading
        icon={
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-vault-panel text-vault-coral">
            <ShieldAlert size={24} aria-hidden />
          </div>
        }
        title={t('pageTitle')}
        description={t('pageDescription')}
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
          <p className="text-sm font-800 text-vault-text">{t('modeTitle')}</p>
          <p className="text-xs text-vault-muted mt-0.5">{t('modeDescription')}</p>
        </div>
      </label>

      <EmergencyContactSetup />

      <button
        type="button"
        onClick={() => setPdfOpen(true)}
        className="neo-card rounded-2xl p-5 text-left hover:bg-vault-elevated/30 transition-colors w-full sm:max-w-md"
      >
        <FileDown className="text-vault-warm mb-2" size={22} />
        <p className="text-sm font-800 text-vault-text">{t('pdfBundleTitle')}</p>
        <p className="text-xs text-vault-muted mt-1">{t('pdfHint')}</p>
      </button>

      <EmergencyPDFModal isOpen={pdfOpen} onClose={() => setPdfOpen(false)} />
    </div>
  );
}
