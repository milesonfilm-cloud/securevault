'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useVaultData } from '@/context/VaultDataContext';
import { idbDeletePhotosForDoc, idbGetAllPhotos } from '@/lib/db';
import { defaultStreakData, defaultVaultSettings } from '@/lib/storage';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function DangerZone() {
  const t = useTranslations('dangerZone');
  const { vaultData, persistVaultData } = useVaultData();
  const [showClearAll, setShowClearAll] = useState(false);
  const [showClearDocs, setShowClearDocs] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      // Delete all photos from IndexedDB
      const allPhotos = await idbGetAllPhotos();
      for (const p of allPhotos) {
        await idbDeletePhotosForDoc(p.docId);
      }
      await persistVaultData({
        members: [],
        documents: [],
        exportHistory: [],
        documentStacks: [],
        shareLinks: [],
        emergencyContact: null,
        settings: defaultVaultSettings(),
        streakData: defaultStreakData(),
      });
      toast.success(t('toastAllCleared'));
      setShowClearAll(false);
      setTimeout(() => window.location.reload(), 800);
    } catch {
      toast.error(t('toastClearFailed'));
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearDocuments = async () => {
    setIsClearing(true);
    try {
      for (const doc of vaultData.documents) {
        await idbDeletePhotosForDoc(doc.id);
      }
      await persistVaultData({ ...vaultData, documents: [] });
      toast.success(t('toastDocsCleared'));
      setShowClearDocs(false);
      setTimeout(() => window.location.reload(), 800);
    } catch {
      toast.error(t('toastDocsClearFailed'));
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="neo-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center justify-center">
          <AlertTriangle size={20} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-base font-700 text-vault-text">{t('title')}</h3>
          <p className="text-xs text-vault-faint">{t('subtitle')}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-2xl border border-red-500/25">
          <div>
            <p className="text-sm font-600 text-vault-text">{t('clearDocsTitle')}</p>
            <p className="text-xs text-vault-muted mt-0.5">{t('clearDocsBody')}</p>
          </div>
          <button
            onClick={() => setShowClearDocs(true)}
            disabled={isClearing}
            className="neo-btn w-auto flex-shrink-0 ml-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-800 transition-all active:scale-[0.98]"
          >
            <Trash2 size={14} />
            {t('clearDocsButton')}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-2xl border border-red-500/25">
          <div>
            <p className="text-sm font-600 text-vault-text">{t('wipeTitle')}</p>
            <p className="text-xs text-vault-muted mt-0.5">{t('wipeBody')}</p>
          </div>
          <button
            onClick={() => setShowClearAll(true)}
            disabled={isClearing}
            className="neo-btn w-auto flex-shrink-0 ml-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-800 transition-all active:scale-[0.98]"
          >
            <Trash2 size={14} />
            {t('wipeButton')}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showClearDocs}
        onClose={() => setShowClearDocs(false)}
        onConfirm={handleClearDocuments}
        title={t('confirmClearDocsTitle')}
        description={t('confirmClearDocsDescription')}
        confirmLabel={t('confirmClearDocsButton')}
        isDanger
        isLoading={isClearing}
        requiredTypedText={t('requiredTypedClear')}
        details={[
          t('confirmClearDocsDetail0'),
          t('confirmClearDocsDetail1'),
          t('confirmClearDocsDetail2'),
          t('confirmClearDocsDetail3'),
        ]}
      />

      <ConfirmModal
        isOpen={showClearAll}
        onClose={() => setShowClearAll(false)}
        onConfirm={handleClearAll}
        title={t('confirmWipeTitle')}
        description={t('confirmWipeDescription')}
        confirmLabel={t('confirmWipeButton')}
        isDanger
        isLoading={isClearing}
        requiredTypedText={t('requiredTypedWipe')}
        details={[
          t('confirmWipeDetail0'),
          t('confirmWipeDetail1'),
          t('confirmWipeDetail2'),
          t('confirmWipeDetail3'),
          t('confirmWipeDetail4'),
        ]}
      />
    </div>
  );
}
