'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { loadVaultDataAsync, saveVaultDataAsync } from '@/lib/storage';
import { idbDeletePhotosForDoc, idbGetAllPhotos } from '@/lib/db';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function DangerZone() {
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
      await saveVaultDataAsync({ members: [], documents: [], exportHistory: [] });
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
      const data = await loadVaultDataAsync();
      // Delete photos for all documents
      for (const doc of data.documents) {
        await idbDeletePhotosForDoc(doc.id);
      }
      await saveVaultDataAsync({ ...data, documents: [] });
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
    <div className="bg-white rounded-[1.35rem] border border-red-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
          <AlertTriangle size={20} className="text-red-500" />
        </div>
        <div>
          <h3 className="text-base font-700 text-slate-900">Danger Zone</h3>
          <p className="text-xs text-slate-400">Irreversible actions — export a backup first</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-red-50/60 rounded-xl border border-red-200/60">
          <div>
            <p className="text-sm font-600 text-slate-800">Clear All Documents</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Remove all documents but keep family member profiles
            </p>
          </div>
          <button
            onClick={() => setShowClearDocs(true)}
            disabled={isClearing}
            className="flex-shrink-0 ml-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-700 transition-all active:scale-[0.98]"
          >
            <Trash2 size={14} />
            Clear Docs
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-red-50/60 rounded-xl border border-red-200/60">
          <div>
            <p className="text-sm font-600 text-slate-800">Wipe Entire Vault</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Delete all data including members, documents, and photos
            </p>
          </div>
          <button
            onClick={() => setShowClearAll(true)}
            disabled={isClearing}
            className="flex-shrink-0 ml-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-700 transition-all active:scale-[0.98]"
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
        description="This will permanently delete all documents and their attached photos. Family member profiles will be kept. This cannot be undone."
        confirmLabel="Clear Documents"
        isDanger
      />

      <ConfirmModal
        isOpen={showClearAll}
        onClose={() => setShowClearAll(false)}
        onConfirm={handleClearAll}
        title="Wipe Entire Vault"
        description="This will permanently delete all vault data — members, documents, photos, and export history. This cannot be undone."
        confirmLabel="Wipe Everything"
        isDanger
      />
    </div>
  );
}
