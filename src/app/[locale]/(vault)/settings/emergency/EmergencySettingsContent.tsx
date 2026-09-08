'use client';

import React, { useState } from 'react';
import { FileDown, ArrowLeft } from 'lucide-react';
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
    <div className="vault-page space-y-6">
      <Link
        href="/settings-export"
        className="inline-flex items-center gap-2 text-xs font-700 text-vault-warm hover:text-vault-text"
      >
        <ArrowLeft size={16} />
        {t('backLink')}
      </Link>

      <VaultPageHeading title={t('pageTitle')} description={t('pageDescription')} />

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
