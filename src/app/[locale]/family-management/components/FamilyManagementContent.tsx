'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { FamilyMember, VaultData } from '@/lib/storage';
import { useVaultData } from '@/context/VaultDataContext';
import { useTheme } from '@/context/ThemeContext';
import FamilyMembersRow from './FamilyMembersRow';
import MembersViewModeToggle from './MembersViewModeToggle';
import MemberFormModal, { MemberFormSavePayload } from './MemberFormModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { appendAuditEntry } from '@/lib/auditLog';
import { isDemoMemberId } from '@/lib/demoFamilyMembers';
import { cn } from '@/lib/utils';
import FamilyPastelHome from './FamilyPastelHome';
import { pastelDisplayMembersOrder } from '@/lib/pastelDisplayMembers';

export default function FamilyManagementContent() {
  const t = useTranslations('familyManagement');
  const tc = useTranslations('common');
  const ts = useTranslations('settings');
  const { theme, setTheme } = useTheme();
  const { vaultData, loading, persistVaultData } = useVaultData();
  const emergencyReadOnly = vaultData.settings.emergencyModeEnabled;
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMember, setEditMember] = useState<FamilyMember | null>(null);
  const [deleteMember, setDeleteMember] = useState<FamilyMember | null>(null);
  const [membersLayout, setMembersLayout] = useState<'carousel' | 'grid'>('carousel');

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

  const memberCount = vaultData.members.length;
  const docCount = vaultData.documents.length;
  const statsLine = t('statsLine', { memberCount, docCount });

  const openAddModal = () => {
    setEditMember(null);
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div
        className={cn(
          'relative mx-auto min-h-full max-w-screen-2xl px-4 pb-10 lg:px-6',
          theme === 'pastel' ? 'bg-[#F6F5FA]' : 'bg-vault-bg'
        )}
      >
        <div className="animate-pulse space-y-6 pt-3">
          <div
            className={cn(
              'mx-auto h-7 w-56 max-w-full rounded-[10px]',
              theme === 'pastel' ? 'bg-[#d8dfe9]' : 'bg-vault-elevated'
            )}
          />
          <div
            className={cn(
              'mx-auto h-4 w-72 max-w-full rounded-md',
              theme === 'pastel' ? 'bg-[#d8dfe9]/80' : 'bg-vault-elevated/80'
            )}
          />
          <div
            className={cn(
              'mx-auto h-10 w-40 rounded-full',
              theme === 'pastel' ? 'bg-[#cfdeca]/80' : 'bg-vault-elevated/70'
            )}
          />
          <div className="-mx-2 flex gap-4 overflow-hidden px-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`skel-member-${i}`}
                className={cn(
                  'h-[440px] min-w-[280px] shrink-0 rounded-2xl',
                  theme === 'pastel'
                    ? 'bg-white shadow-[0_8px_24px_rgba(33,33,33,0.06)]'
                    : 'bg-vault-panel'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (theme === 'pastel') {
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
              toast.message('Emergency mode — read only.');
              return;
            }
            if (isDemoMemberId(m.id)) {
              toast.message('Sample profile — add your own member to edit.');
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
      </>
    );
  }

  return (
    <div className="relative mx-auto min-h-full max-w-screen-2xl bg-vault-bg px-4 pb-24 pt-[env(safe-area-inset-top)] lg:px-6 lg:pb-10 lg:pt-0">
      <div className="pt-1 text-center">
        <div className="mb-3 flex min-h-10 items-start justify-between gap-2 sm:mb-2">
          <button
            type="button"
            onClick={() => setTheme('pastel')}
            className="rounded-full border border-[color:var(--color-border)] bg-vault-elevated/70 px-3 py-2 text-left text-[11px] font-semibold text-vault-muted transition-colors hover:border-vault-warm/35 hover:text-vault-text sm:text-xs"
          >
            {ts('themePastel')} →
          </button>
          <MembersViewModeToggle value={membersLayout} onChange={setMembersLayout} />
        </div>
        <div className="mx-auto flex max-w-full flex-col items-center">
          <h1 className="text-balance text-[clamp(1.05rem,3.6vw,1.65rem)] font-bold uppercase tracking-[0.16em] text-vault-text sm:tracking-[0.2em]">
            {t('heroTitle')}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-[13px] leading-relaxed text-vault-muted">
            {statsLine}
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-5 flex items-center gap-2 rounded-full bg-vault-warm px-6 py-2.5 text-sm font-semibold text-vault-ink shadow-vault transition-all hover:opacity-95 active:scale-[0.98]"
          >
            <Plus size={18} strokeWidth={2.5} className="text-vault-ink" />
            {tc('add')}
          </button>
        </div>
      </div>

      <div className="mt-6 min-w-0 sm:mt-8">
        {vaultData.members.length === 0 ? (
          <div className="mb-6 flex flex-col items-center gap-3 rounded-2xl border border-[color:var(--color-border)] bg-vault-elevated/40 px-4 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-vault-panel">
                <Users size={24} className="text-vault-warm" />
              </div>
              <div>
                <p className="text-sm font-700 text-vault-text">No members yet</p>
                <p className="mt-0.5 max-w-md text-xs text-vault-muted">
                  Tap <span className="font-600 text-vault-text">{tc('add')}</span> to create your
                  first family profile.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <FamilyMembersRow
          layout={membersLayout}
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
