'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { loadVaultDataAsync, saveVaultDataAsync, FamilyMember, VaultData } from '@/lib/storage';
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
      <div className="p-6 max-w-screen-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded-lg w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`skel-member-${i}`} className="h-48 bg-slate-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={20} className="text-indigo-500" />
            <h1 className="text-2xl font-700 text-slate-900">Family Members</h1>
          </div>
          <p className="text-sm text-slate-500">
            {vaultData.members.length} member{vaultData.members.length !== 1 ? 's' : ''} ·{' '}
            {vaultData.documents.length} total documents stored
          </p>
        </div>
        <button
          onClick={() => {
            setEditMember(null);
            setShowAddModal(true);
          }}
          className="btn-primary flex-shrink-0"
        >
          <Plus size={16} />
          Add Member
        </button>
      </div>

      {vaultData.members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5">
            <Users size={36} className="text-indigo-400" />
          </div>
          <h3 className="text-lg font-700 text-slate-700 mb-2">No family members yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mb-6">
            Add family member profiles to organize documents by person — IDs, accounts, and records
            stay neatly separated.
          </p>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <Plus size={16} />
            Add First Member
          </button>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-5">
          {/* Members grid */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
              {vaultData.members.map((member) => (
                <MemberCard
                  key={`member-card-${member.id}`}
                  member={member}
                  documents={vaultData.documents.filter((d) => d.memberId === member.id)}
                  isSelected={selectedMemberId === member.id}
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
                { label: 'Total Members', value: vaultData.members.length, color: '#6366F1' },
                { label: 'Total Documents', value: vaultData.documents.length, color: '#0EA5E9' },
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
                  color: '#10B981',
                },
                {
                  label: 'Categories Used',
                  value: new Set(vaultData.documents.map((d) => d.categoryId)).size,
                  color: '#F59E0B',
                },
              ].map((stat, i) => (
                <div
                  key={`family-stat-${i}`}
                  className="bg-white rounded-xl border border-slate-100 shadow-sm p-4"
                >
                  <p className="text-xs font-600 text-slate-400 uppercase tracking-wide mb-1">
                    {stat.label}
                  </p>
                  <p className="text-xl font-800 tabular-nums" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                </div>
              ))}
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
