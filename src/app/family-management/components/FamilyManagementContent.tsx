'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { loadVaultDataAsync, saveVaultDataAsync, FamilyMember, VaultData } from '@/lib/storage';
import { getPastelLedgerTile } from '@/lib/pastelLedgerPalette';
import MemberCard from './MemberCard';
import MemberFormModal from './MemberFormModal';
import MemberDocumentPanel from './MemberDocumentPanel';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function FamilyManagementContent() {
  const [vaultData, setVaultData] = useState<VaultData>({
    members: [],
    documents: [],
    exportHistory: [],
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMember, setEditMember] = useState<FamilyMember | null>(null);
  const [deleteMember, setDeleteMember] = useState<FamilyMember | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  useEffect(() => {
    loadVaultDataAsync().then((data) => {
      setVaultData(data);
      setLoading(false);
      if (data.members.length > 0) {
        setSelectedMemberId(data.members[0].id);
      }
    });
  }, []);

  const handleSaveMember = async (
    memberData: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const now = new Date().toISOString();
    let updated: VaultData;

    if (editMember) {
      const updatedMember: FamilyMember = { ...editMember, ...memberData, updatedAt: now };
      updated = {
        ...vaultData,
        members: vaultData.members.map((m) => (m.id === editMember.id ? updatedMember : m)),
      };
      toast.success(`${updatedMember.name}'s profile updated`);
    } else {
      const newMember: FamilyMember = {
        id: `member-${Date.now()}`,
        ...memberData,
        createdAt: now,
        updatedAt: now,
      };
      updated = { ...vaultData, members: [...vaultData.members, newMember] };
      toast.success(`${newMember.name} added to family vault`);
      setSelectedMemberId(newMember.id);
    }

    await saveVaultDataAsync(updated);
    setVaultData(updated);
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
    await saveVaultDataAsync(updated);
    setVaultData(updated);
    if (selectedMemberId === deleteMember.id) {
      setSelectedMemberId(updated.members[0]?.id || null);
    }
    toast.success(
      `${deleteMember.name} and ${docCount} document${docCount !== 1 ? 's' : ''} removed`
    );
    setDeleteMember(null);
  };

  const selectedMember = vaultData.members.find((m) => m.id === selectedMemberId) || null;
  const selectedMemberDocs = selectedMember
    ? vaultData.documents.filter((d) => d.memberId === selectedMember.id)
    : [];

  if (loading) {
    return (
      <div className="p-6 max-w-screen-2xl mx-auto bg-vault-bg min-h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-vault-elevated rounded-[10px] w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`skel-member-${i}`} className="h-48 bg-vault-panel rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-screen-2xl mx-auto bg-vault-bg min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <p className="text-xs text-vault-faint font-medium">Family</p>
          <h1 className="text-[32px] font-bold text-white tracking-tight leading-tight mt-0.5">
            Members
          </h1>
          <p className="text-[13px] text-vault-muted mt-2">
            {vaultData.members.length} member{vaultData.members.length !== 1 ? 's' : ''} ·{' '}
            {vaultData.documents.length} total documents stored
          </p>
        </div>
        <button
          onClick={() => {
            setEditMember(null);
            setShowAddModal(true);
          }}
          className="flex-shrink-0 flex items-center gap-2 rounded-xl py-2.5 px-5 text-sm font-semibold bg-vault-warm text-vault-ink transition-all active:scale-[0.98] shadow-vault"
        >
          <Plus size={18} strokeWidth={2.5} className="text-vault-ink" />
          Add
        </button>
      </div>

      {vaultData.members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-vault-elevated rounded-2xl flex items-center justify-center mb-5 border border-[rgba(255,255,255,0.07)]">
            <Users size={36} className="text-vault-warm" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No family members yet</h3>
          <p className="text-sm text-vault-muted max-w-sm mb-6">
            Add family member profiles to organize documents by person — IDs, accounts, and records
            stay neatly separated.
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl py-2.5 px-5 text-sm font-semibold bg-vault-warm text-vault-ink transition-all active:scale-[0.98] shadow-vault"
          >
            <Plus size={18} strokeWidth={2.5} />
            Add
          </button>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-5">
          {/* Members grid */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
              {vaultData.members.map((member, index) => (
                <MemberCard
                  key={`member-card-${member.id}`}
                  member={member}
                  documents={vaultData.documents.filter((d) => d.memberId === member.id)}
                  isSelected={selectedMemberId === member.id}
                  tile={getPastelLedgerTile(index)}
                  onSelect={() => setSelectedMemberId(member.id)}
                  onEdit={() => {
                    setEditMember(member);
                    setShowAddModal(true);
                  }}
                  onDelete={() => setDeleteMember(member)}
                />
              ))}
            </div>

            {/* Stats row */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Members', value: vaultData.members.length },
                { label: 'Total Documents', value: vaultData.documents.length },
                {
                  label: 'Most Documents',
                  value: vaultData.members.reduce(
                    (best, m) => {
                      const count = vaultData.documents.filter((d) => d.memberId === m.id).length;
                      return count > (best.count || 0)
                        ? { name: m.name.split(' ')[0], count }
                        : best;
                    },
                    { name: '—', count: 0 }
                  ).name,
                },
                {
                  label: 'Categories Used',
                  value: new Set(vaultData.documents.map((d) => d.categoryId)).size,
                },
              ].map((stat, i) => {
                const tile = getPastelLedgerTile(i);
                return (
                  <div
                    key={`family-stat-${i}`}
                    className="rounded-2xl p-4 border border-[rgba(255,255,255,0.07)] shadow-vault"
                    style={{ background: tile.bg }}
                  >
                    <p className="text-[11px] font-700 uppercase tracking-widest mb-1 text-white/88">
                      {stat.label}
                    </p>
                    <p className="text-xl font-800 tabular-nums text-white">{stat.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Document panel */}
          {selectedMember && (
            <div className="xl:w-80 2xl:w-96 flex-shrink-0">
              <MemberDocumentPanel
                member={selectedMember}
                documents={selectedMemberDocs}
                onClose={() => setSelectedMemberId(null)}
              />
            </div>
          )}
        </div>
      )}

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
