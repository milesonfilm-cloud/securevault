'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import {
  defaultPermissions,
  type FamilyMember,
  type VaultData,
  type VaultRole,
  type VaultPermissions,
} from '@/lib/storage';
import { cn } from '@/lib/utils';

const ROLES: VaultRole[] = ['admin', 'member', 'viewer'];

const ROLE_COPY: Record<VaultRole, { title: string; body: string }> = {
  admin: {
    title: 'Admin',
    body: 'Full vault access: see all non-private documents, assign roles, and manage family records.',
  },
  member: {
    title: 'Member',
    body: 'Own documents plus items shared with you. Can add and edit their own records when allowed.',
  },
  viewer: {
    title: 'Viewer',
    body: 'Read-only access to documents shared with this profile. Export and share are off by default.',
  },
};

interface RoleAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultData: VaultData;
  onSave: (members: FamilyMember[]) => Promise<void>;
}

export default function RoleAssignmentModal({
  isOpen,
  onClose,
  vaultData,
  onSave,
}: RoleAssignmentModalProps) {
  const [draft, setDraft] = useState<Record<string, VaultRole>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const next: Record<string, VaultRole> = {};
    for (const m of vaultData.members) {
      next[m.id] = m.permissions?.role ?? 'member';
    }
    setDraft(next);
  }, [isOpen, vaultData.members]);

  const setRole = (memberId: string, role: VaultRole) => {
    setDraft((d) => ({ ...d, [memberId]: role }));
  };

  const handleSave = async () => {
    const adminCount = Object.values(draft).filter((r) => r === 'admin').length;
    if (adminCount < 1) {
      toast.error('Keep at least one admin.');
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const updated: FamilyMember[] = vaultData.members.map((m) => {
        const role = draft[m.id] ?? m.permissions?.role ?? 'member';
        const base: VaultPermissions = m.permissions ?? defaultPermissions(role);
        const defaults = defaultPermissions(role);
        const nextPerms: VaultPermissions = {
          ...base,
          role,
          canExport: defaults.canExport,
          canShare: defaults.canShare,
        };
        return { ...m, updatedAt: now, permissions: nextPerms };
      });
      await onSave(updated);
      toast.success('Roles saved');
      onClose();
    } catch {
      toast.error('Could not save roles');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Family roles"
      subtitle="Choose what each profile can do in the vault. Admins see all non-private documents."
      size="lg"
    >
      <div className="grid gap-4 px-6 py-4 lg:grid-cols-3">
        {ROLES.map((role) => (
          <div
            key={role}
            className="rounded-2xl border border-border bg-vault-elevated/35 p-4 shadow-inner"
          >
            <p className="text-xs font-800 uppercase tracking-wider text-vault-warm">
              {ROLE_COPY[role].title}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-vault-muted">{ROLE_COPY[role].body}</p>
          </div>
        ))}
      </div>

      <div className="max-h-[45vh] space-y-2 overflow-y-auto px-6 pb-4">
        {vaultData.members.map((m) => (
          <div
            key={m.id}
            className="flex flex-col gap-2 rounded-xl border border-border bg-vault-panel px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-vault-text">{m.name}</p>
              <p className="text-xs text-vault-muted">{m.relationship}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ROLES.map((role) => {
                const active = (draft[m.id] ?? 'member') === role;
                return (
                  <button
                    key={`${m.id}-${role}`}
                    type="button"
                    onClick={() => setRole(m.id, role)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150',
                      active
                        ? 'bg-vault-warm text-vault-ink shadow-sm'
                        : 'bg-vault-elevated text-vault-muted hover:text-vault-text'
                    )}
                  >
                    {ROLE_COPY[role].title}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-vault-muted hover:bg-vault-elevated"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving || vaultData.members.length === 0}
          onClick={() => void handleSave()}
          className="rounded-xl bg-vault-warm px-5 py-2 text-sm font-semibold text-vault-ink disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save roles'}
        </button>
      </div>
    </Modal>
  );
}
