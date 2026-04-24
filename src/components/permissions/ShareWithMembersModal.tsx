'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import type { Document, FamilyMember } from '@/lib/storage';
import MemberAvatar from '@/components/MemberAvatar';

interface ShareWithMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  members: FamilyMember[];
  onSave: (docId: string, sharedWithMemberIds: string[]) => Promise<void>;
}

export default function ShareWithMembersModal({
  isOpen,
  onClose,
  document: doc,
  members,
  onSave,
}: ShareWithMembersModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!doc || !isOpen) return;
    setSelected(new Set(doc.sharedWithMemberIds ?? []));
  }, [doc, isOpen]);

  if (!doc) return null;

  const targets = members.filter((m) => m.id !== doc.memberId);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(doc.id, [...selected]);
      toast.success('Sharing updated');
      onClose();
    } catch {
      toast.error('Could not save sharing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share with family"
      subtitle={`Who else can view “${doc.title}”?`}
      size="md"
    >
      <div className="max-h-[50vh] space-y-2 overflow-y-auto px-6 py-4">
        {targets.length === 0 ? (
          <p className="text-sm text-vault-muted">No other members to share with yet.</p>
        ) : (
          targets.map((m) => {
            const on = selected.has(m.id);
            return (
              <label
                key={m.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-vault-elevated/40 px-3 py-2.5 transition-colors hover:bg-vault-elevated/70"
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(m.id)}
                  className="h-4 w-4 rounded border-border text-vault-warm focus:ring-vault-warm/40"
                />
                <MemberAvatar
                  name={m.name}
                  avatarColor={m.avatarColor}
                  photoDataUrl={m.photoDataUrl}
                  className="h-9 w-9 shrink-0 rounded-full border border-border"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-vault-text">{m.name}</p>
                  <p className="truncate text-xs text-vault-muted">{m.relationship}</p>
                </div>
              </label>
            );
          })
        )}
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
          disabled={saving || targets.length === 0}
          onClick={() => void handleSave()}
          className="rounded-xl bg-vault-warm px-4 py-2 text-sm font-semibold text-vault-ink disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </Modal>
  );
}
