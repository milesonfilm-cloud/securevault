'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Document, FamilyMember, VaultData, type CategoryId } from '@/lib/storage';
import { useVaultData } from '@/context/VaultDataContext';
import MemberFormModal, { MemberFormSavePayload } from './MemberFormModal';
import DocumentFormModal from '@/app/[locale]/document-vault/components/DocumentFormModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ProUpgradeModal from '@/components/ui/ProUpgradeModal';
import { appendAuditEntry } from '@/lib/auditLog';
import { isDemoMemberId } from '@/lib/demoFamilyMembers';
import FamilyPastelHome from './FamilyPastelHome';
import { pastelDisplayMembersOrder } from '@/lib/pastelDisplayMembers';
import type { DocumentPrefill } from '@/lib/ocr/documentPrefill';
import { getBlockedCategory, isPro } from '@/lib/subscription';
import { getCategoryById } from '@/lib/categories';

export default function FamilyManagementContent() {
  const t = useTranslations('familyManagement');
  const { vaultData, loading, persistVaultData } = useVaultData();
  const emergencyReadOnly = vaultData.settings.emergencyModeEnabled;
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMember, setEditMember] = useState<FamilyMember | null>(null);
  const [deleteMember, setDeleteMember] = useState<FamilyMember | null>(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [docPrefill, setDocPrefill] = useState<DocumentPrefill | null>(null);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; categoryLabel?: string }>({
    open: false,
  });

  const displayMembers = useMemo(
    () => pastelDisplayMembersOrder(vaultData.members),
    [vaultData.members]
  );

  const handleSaveMember = async (memberData: MemberFormSavePayload) => {
    const now = new Date().toISOString();
    let updated: VaultData;
    const rest = memberData;

    if (editMember) {
      const updatedMember: FamilyMember = {
        ...editMember,
        ...rest,
        updatedAt: now,
      };
      updated = {
        ...vaultData,
        members: vaultData.members.map((m) => (m.id === editMember.id ? updatedMember : m)),
      };
      toast.success(t('memberUpdatedToast', { name: updatedMember.name }));
      appendAuditEntry({
        action: 'member_updated',
        actorMemberId: updatedMember.id,
        targetId: updatedMember.id,
        targetTitle: updatedMember.name,
      });
    } else {
      const newMember: FamilyMember = {
        id: `member-${crypto.randomUUID()}`,
        ...rest,
        createdAt: now,
        updatedAt: now,
      };
      updated = { ...vaultData, members: [...vaultData.members, newMember] };
      toast.success(t('memberAddedToast', { name: newMember.name }));
      appendAuditEntry({
        action: 'member_created',
        actorMemberId: null,
        targetId: newMember.id,
        targetTitle: newMember.name,
      });
    }

    await persistVaultData(updated);
    setShowAddModal(false);
    setEditMember(null);
  };

  const handleDeleteMember = async () => {
    if (!deleteMember) return;
    const docCount = vaultData.documents.filter((d) => d.memberId === deleteMember.id).length;
    const updated: VaultData = {
      ...vaultData,
      members: vaultData.members.filter((m) => m.id !== deleteMember.id),
      documents: vaultData.documents.filter((d) => d.memberId !== deleteMember.id),
    };
    await persistVaultData(updated);
    toast.success(
      t('memberRemovedToast', { name: deleteMember.name, docCount })
    );
    appendAuditEntry({
      action: 'member_deleted',
      actorMemberId: null,
      targetId: deleteMember.id,
      targetTitle: deleteMember.name,
    });
    setDeleteMember(null);
  };

  const openAddModal = () => {
    setEditMember(null);
    setShowAddModal(true);
  };

  const openAddDocument = (opts: { memberId: string; categoryId?: string }) => {
    if (emergencyReadOnly) {
      toast.message(t('emergencyReadOnlyToast'));
      return;
    }
    setEditDoc(null);
    setDocPrefill({
      memberId: opts.memberId,
      categoryId: opts.categoryId as CategoryId | undefined,
    });
    setShowDocModal(true);
  };

  const openEditDocument = (doc: Document) => {
    if (emergencyReadOnly) {
      toast.message(t('emergencyReadOnlyToast'));
      return;
    }
    setDocPrefill(null);
    setEditDoc(doc);
    setShowDocModal(true);
  };

  const handleSaveDocument = async (
    docData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!editDoc && !isPro(vaultData.settings)) {
      const blocked = getBlockedCategory(
        vaultData.documents,
        docData.categoryId,
        vaultData.settings
      );
      if (blocked) {
        setShowDocModal(false);
        const cat = getCategoryById(blocked as Parameters<typeof getCategoryById>[0]);
        setUpgradeModal({ open: true, categoryLabel: cat?.label ?? blocked });
        return;
      }
    }

    const now = new Date().toISOString();

    if (editDoc) {
      const updatedDoc: Document = {
        ...editDoc,
        ...docData,
        updatedAt: now,
      };
      await persistVaultData({
        ...vaultData,
        documents: vaultData.documents.map((d) => (d.id === editDoc.id ? updatedDoc : d)),
      });
      toast.success(`"${updatedDoc.title}" updated successfully`);
      appendAuditEntry({
        action: 'document_updated',
        actorMemberId: updatedDoc.memberId,
        targetId: updatedDoc.id,
        targetTitle: updatedDoc.title,
      });
    } else {
      const newDoc: Document = {
        id: `doc-${crypto.randomUUID()}`,
        ...docData,
        createdAt: now,
        updatedAt: now,
      };
      await persistVaultData({
        ...vaultData,
        documents: [...vaultData.documents, newDoc],
      });
      toast.success(`"${newDoc.title}" added to vault`);
      appendAuditEntry({
        action: 'document_created',
        actorMemberId: newDoc.memberId,
        targetId: newDoc.id,
        targetTitle: newDoc.title,
      });
    }

    setShowDocModal(false);
    setDocPrefill(null);
    setEditDoc(null);
  };

  if (loading) {
    return (
      <div className="relative mx-auto min-h-full max-w-screen-2xl overflow-x-hidden bg-transparent px-3 pb-6 pt-[max(0.5rem,env(safe-area-inset-top,0px))] sm:px-5">
        <div className="animate-pulse space-y-5 pt-2">
          <div className="mx-auto h-6 w-40 max-w-full rounded-[10px] bg-black/8" />
          <div className="mx-auto h-3.5 w-56 max-w-full rounded-md bg-black/8" />
          <div className="-mx-2 flex gap-3 overflow-hidden px-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`skel-member-${i}`}
                className="h-[158px] min-w-[82vw] max-w-[340px] shrink-0 rounded-[24px] bg-white/70 sm:min-w-[280px]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <FamilyPastelHome
        displayMembers={displayMembers}
        documentsByMemberId={(id) => vaultData.documents.filter((d) => d.memberId === id)}
        onAddMember={openAddModal}
        onEditMember={(m) => {
          if (emergencyReadOnly) {
            toast.message(t('emergencyReadOnlyToast'));
            return;
          }
          if (isDemoMemberId(m.id)) {
            toast.message(t('demoProfileToast'));
            return;
          }
          setEditMember(m);
          setShowAddModal(true);
        }}
        onAddDocument={openAddDocument}
        onEditDocument={openEditDocument}
      />
      <MemberFormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditMember(null);
        }}
        onSave={handleSaveMember}
        editMember={editMember}
        members={vaultData.members}
      />
      <DocumentFormModal
        isOpen={showDocModal}
        onClose={() => {
          setShowDocModal(false);
          setDocPrefill(null);
          setEditDoc(null);
        }}
        onSave={handleSaveDocument}
        members={vaultData.members}
        editDoc={editDoc}
        prefill={editDoc ? null : docPrefill}
      />
      <ProUpgradeModal
        isOpen={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false })}
        blockedCategory={upgradeModal.categoryLabel}
      />
      <ConfirmModal
        isOpen={!!deleteMember}
        onClose={() => setDeleteMember(null)}
        onConfirm={handleDeleteMember}
        title={t('removeMemberTitle')}
        description={t('removeMemberDescription', { name: deleteMember?.name ?? '' })}
        confirmLabel={t('removeMemberConfirm')}
        isDanger
      />
    </>
  );
}
