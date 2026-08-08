'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { FamilyMember, VaultData } from '@/lib/storage';
import { useVaultData } from '@/context/VaultDataContext';
import MemberFormModal, { MemberFormSavePayload } from './MemberFormModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { appendAuditEntry } from '@/lib/auditLog';
import { isDemoMemberId } from '@/lib/demoFamilyMembers';
import { isDemoMode } from '@/lib/demoMode';
import FamilyPastelHome from './FamilyPastelHome';
import { pastelDisplayMembersOrder } from '@/lib/pastelDisplayMembers';

export default function FamilyManagementContent() {
  const t = useTranslations('familyManagement');
  const { vaultData, loading, persistVaultData } = useVaultData();
  const emergencyReadOnly = vaultData.settings.emergencyModeEnabled;
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMember, setEditMember] = useState<FamilyMember | null>(null);
  const [deleteMember, setDeleteMember] = useState<FamilyMember | null>(null);

  const displayMembers = useMemo(
    () => pastelDisplayMembersOrder(vaultData.members),
    [vaultData.members]
  );

  const categoryHistogram = useMemo(() => {
    const byCat = new Map<string, number>();
    vaultData.documents.forEach((d) => {
      byCat.set(d.categoryId, (byCat.get(d.categoryId) ?? 0) + 1);
    });
    const vals = Array.from(byCat.values()).sort((a, b) => b - a);
    while (vals.length < 8) vals.push(0);
    const take = vals.slice(0, 8);
    const max = Math.max(1, ...take);
    return take.map((v) => Math.round((v / max) * 100));
  }, [vaultData.documents]);

  const categoryCount = useMemo(() => {
    const s = new Set(vaultData.documents.map((d) => d.categoryId));
    return s.size;
  }, [vaultData.documents]);

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
    toast.success(t('memberRemovedToast', { name: deleteMember.name, docCount }));
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

  if (loading) {
    return (
      <div className="relative mx-auto min-h-full max-w-screen-2xl bg-[#F6F5FA] px-4 pb-10 lg:px-6">
        <div className="animate-pulse space-y-6 pt-3">
          <div className="mx-auto h-7 w-56 max-w-full rounded-[10px] bg-[#d8dfe9]" />
          <div className="mx-auto h-4 w-72 max-w-full rounded-md bg-[#d8dfe9]/80" />
          <div className="mx-auto h-10 w-40 rounded-full bg-[#cfdeca]/80" />
          <div className="-mx-2 flex gap-4 overflow-hidden px-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`skel-member-${i}`}
                className="h-[440px] min-w-[280px] shrink-0 rounded-2xl bg-white shadow-[0_8px_24px_rgba(33,33,33,0.06)]"
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
        memberCount={vaultData.members.length}
        docCount={vaultData.documents.length}
        categoryCount={categoryCount}
        categoryHistogram={categoryHistogram}
        onAddMember={openAddModal}
        onEditMember={(m) => {
          if (emergencyReadOnly) {
            toast.message(t('emergencyReadOnlyToast'));
            return;
          }
          if (isDemoMemberId(m.id) && !isDemoMode()) {
            toast.message(t('demoProfileToast'));
            return;
          }
          setEditMember(m);
          setShowAddModal(true);
        }}
      />
      <MemberFormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditMember(null);
        }}
        onSave={handleSaveMember}
        editMember={editMember}
        existingMembers={vaultData.members}
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
