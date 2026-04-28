'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { FamilyMember, VaultData } from '@/lib/storage';
import { useVaultData } from '@/context/VaultDataContext';
import FamilyMembersRow from './FamilyMembersRow';
import MemberFormModal, { MemberFormSavePayload } from './MemberFormModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import VaultPageHeading from '@/components/ui/VaultPageHeading';
import { appendAuditEntry } from '@/lib/auditLog';
import { DEMO_FAMILY_MEMBERS, isDemoMemberId } from '@/lib/demoFamilyMembers';

export default function FamilyManagementContent() {
  const { vaultData, loading, persistVaultData } = useVaultData();
  const emergencyReadOnly = vaultData.settings.emergencyModeEnabled;
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMember, setEditMember] = useState<FamilyMember | null>(null);
  const [deleteMember, setDeleteMember] = useState<FamilyMember | null>(null);

  const displayMembers = useMemo(
    () => [...vaultData.members, ...DEMO_FAMILY_MEMBERS],
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
      toast.success(`${updatedMember.name}'s profile updated`);
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
      toast.success(`${newMember.name} added to family vault`);
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
      `${deleteMember.name} and ${docCount} document${docCount !== 1 ? 's' : ''} removed`
    );
    appendAuditEntry({
      action: 'member_deleted',
      actorMemberId: null,
      targetId: deleteMember.id,
      targetTitle: deleteMember.name,
    });
    setDeleteMember(null);
  };

  if (loading) {
    return (
      <div className="mx-auto min-h-full max-w-screen-2xl bg-vault-bg p-4 lg:p-6">
        <div className="animate-pulse space-y-4">
          <div className="mx-auto h-8 w-48 rounded-[10px] bg-vault-elevated" />
          <div className="-mx-4 flex gap-4 overflow-hidden px-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`skel-member-${i}`}
                className="h-[440px] min-w-[280px] shrink-0 rounded-2xl bg-vault-panel"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-full max-w-screen-2xl bg-vault-bg p-4 lg:p-6">
      <VaultPageHeading
        title="Family members"
        description={`${vaultData.members.length} member${vaultData.members.length !== 1 ? 's' : ''} · ${vaultData.documents.length} total documents stored`}
        actions={
          <button
            onClick={() => {
              setEditMember(null);
              setShowAddModal(true);
            }}
            className="flex flex-shrink-0 items-center gap-2 rounded-xl bg-vault-warm px-5 py-2.5 text-sm font-semibold text-vault-ink shadow-vault transition-all active:scale-[0.98]"
          >
            <Plus size={18} strokeWidth={2.5} className="text-vault-ink" />
            Add
          </button>
        }
      />

      {vaultData.members.length === 0 ? (
        <div className="mb-6 flex flex-col items-center gap-3 rounded-2xl border border-[color:var(--color-border)] bg-vault-elevated/40 px-4 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-vault-panel">
              <Users size={24} className="text-vault-warm" />
            </div>
            <div>
              <p className="text-sm font-700 text-vault-text">No members yet</p>
              <p className="mt-0.5 max-w-md text-xs text-vault-muted">
                Sample cards below show how profiles look — add your own with{' '}
                <span className="font-600 text-vault-text">Add</span>.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="min-w-0">
        <FamilyMembersRow
          members={displayMembers}
          documentsByMemberId={(id) => vaultData.documents.filter((d) => d.memberId === id)}
          onEdit={(member) => {
            if (emergencyReadOnly) {
              toast.message('Emergency mode — read only.');
              return;
            }
            if (isDemoMemberId(member.id)) {
              toast.message('Sample profile — add your own member to edit.');
              return;
            }
            setEditMember(member);
            setShowAddModal(true);
          }}
          onDelete={(member) => {
            if (emergencyReadOnly) {
              toast.message('Emergency mode — read only.');
              return;
            }
            if (isDemoMemberId(member.id)) {
              toast.message('Sample profile — cannot delete.');
              return;
            }
            setDeleteMember(member);
          }}
        />
      </div>

      {/* Modals */}
      <MemberFormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditMember(null);
        }}
        onSave={handleSaveMember}
        editMember={editMember}
      />

      <ConfirmModal
        isOpen={!!deleteMember}
        onClose={() => setDeleteMember(null)}
        onConfirm={handleDeleteMember}
        title="Remove Family Member"
        description={`Remove ${deleteMember?.name} and all their documents from the vault? This action cannot be undone.`}
        confirmLabel="Remove Member"
        isDanger
      />
    </div>
  );
}
