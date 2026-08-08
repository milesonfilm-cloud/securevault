'use client';

import React from 'react';
import { Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AppInfoCard() {
  const t = useTranslations('settingsPanels');
  return (
    <div className="neo-card rounded-2xl p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-vault-elevated">
          <Smartphone size={18} className="text-vault-warm" />
        </div>
        <h3 className="text-sm font-800 text-vault-text">{t('appThisDevice')}</h3>
      </div>
      <p className="text-xs leading-relaxed text-vault-muted">{t('appInfoBody')}</p>
    </div>
  );
}
