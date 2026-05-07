'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useVaultData } from '@/context/VaultDataContext';
import { idbDeletePhotosForDoc, idbGetAllPhotos } from '@/lib/db';
import { defaultStreakData, defaultVaultSettings } from '@/lib/storage';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function DangerZone() {
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
      toast.success('All vault data cleared from this device');
      setShowClearAll(false);
      setTimeout(() => window.location.reload(), 800);
    } catch {
      toast.error('Failed to clear data');
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
      toast.success('All documents cleared — member profiles retained');
      setShowClearDocs(false);
      setTimeout(() => window.location.reload(), 800);
    } catch {
      toast.error('Failed to clear documents');
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
          <h3 className="text-base font-700 text-vault-text">Danger Zone</h3>
          <p className="text-xs text-vault-faint">Irreversible actions — export a backup first</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-2xl border border-red-500/25">
          <div>
            <p className="text-sm font-600 text-vault-text">Clear All Documents</p>
            <p className="text-xs text-vault-muted mt-0.5">
              Remove all documents but keep family member profiles
            </p>
          </div>
          <button
            onClick={() => setShowClearDocs(true)}
            disabled={isClearing}
            className="neo-btn w-auto flex-shrink-0 ml-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-800 transition-all active:scale-[0.98]"
          >
            <Trash2 size={14} />
            Clear Docs
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-2xl border border-red-500/25">
          <div>
            <p className="text-sm font-600 text-vault-text">Wipe Entire Vault</p>
            <p className="text-xs text-vault-muted mt-0.5">
              Delete all data including members, documents, and photos
            </p>
          </div>
          <button
            onClick={() => setShowClearAll(true)}
            disabled={isClearing}
            className="neo-btn w-auto flex-shrink-0 ml-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-800 transition-all active:scale-[0.98]"
          >
            <Trash2 size={14} />
            Wipe All
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showClearDocs}
        onClose={() => setShowClearDocs(false)}
        onConfirm={handleClearDocuments}
        title="Clear All Documents"
        description="This action is permanent and cannot be undone."
        confirmLabel="Clear Documents"
        isDanger
        isLoading={isClearing}
        requiredTypedText="CLEAR"
        details={[
          'Deletes every document stored in this vault.',
          'Removes all photos attached to those documents from this device.',
          'Keeps your family member profiles intact.',
          'Keeps your settings, export history, and emergency contact.',
        ]}
      />

      <ConfirmModal
        isOpen={showClearAll}
        onClose={() => setShowClearAll(false)}
        onConfirm={handleClearAll}
        title="Wipe Entire Vault"
        description="This action is permanent and cannot be undone."
        confirmLabel="Wipe Everything"
        isDanger
        isLoading={isClearing}
        requiredTypedText="WIPE"
        details={[
          'Deletes all family members and their profiles.',
          'Deletes every document and every attached photo.',
          'Clears export history, share links, and emergency contact.',
          'Resets all vault settings and your streak data.',
          'Export a backup first if you might need any of this later.',
        ]}
      />
    </div>
  );
}
