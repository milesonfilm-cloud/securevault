'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useVaultData } from '@/context/VaultDataContext';
import { useVaultPermissions } from '@/hooks/useVaultPermissions';
import MemberAvatar from '@/components/MemberAvatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function MemberSwitcher() {
  const { vaultData, loading } = useVaultData();
  const { activeMemberId, switchMember } = useVaultPermissions();
  const [pinOpen, setPinOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [pinBusy, setPinBusy] = useState(false);

  if (loading || vaultData.members.length === 0) return null;

  const pendingMember = pendingId
    ? vaultData.members.find((m) => m.id === pendingId)
    : null;

  const openPinFor = (id: string) => {
    setPendingId(id);
    setPin('');
    setPinOpen(true);
  };

  const handleSelect = async (memberId: string) => {
    const m = vaultData.members.find((x) => x.id === memberId);
    if (!m) return;
    if (m.pinHash) {
      openPinFor(memberId);
      return;
    }
    const ok = await switchMember(memberId);
    if (!ok) toast.error('Could not switch profile');
  };

  const submitPin = async () => {
    if (!pendingId) return;
    setPinBusy(true);
    try {
      const ok = await switchMember(pendingId, pin);
      if (ok) {
        setPinOpen(false);
        setPendingId(null);
        setPin('');
        toast.success('Profile switched');
      } else {
        toast.error('Incorrect PIN');
      }
    } finally {
      setPinBusy(false);
    }
  };

  return (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <p className="hidden text-[10px] font-700 uppercase tracking-wider text-vault-faint sm:block">
          Acting as
        </p>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:thin]">
          {vaultData.members.map((m) => {
            const active = m.id === activeMemberId;
            return (
              <motion.button
                key={m.id}
                type="button"
                layout
                onClick={() => void handleSelect(m.id)}
                title={m.name}
                className="relative shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-vault-warm/50"
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              >
                <AnimatePresence>
                  {active ? (
                    <motion.span
                      layoutId="member-switch-ring"
                      className="absolute inset-[-3px] rounded-full border-2 border-vault-warm shadow-[0_0_12px_rgba(250,204,21,0.35)]"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  ) : null}
                </AnimatePresence>
                <MemberAvatar
                  name={m.name}
                  avatarColor={m.avatarColor}
                  photoDataUrl={m.photoDataUrl}
                  className="relative z-[1] h-9 w-9 rounded-full border border-border"
                />
              </motion.button>
            );
          })}
        </div>
      </div>

      <Dialog
        open={pinOpen}
        onOpenChange={(o) => {
          setPinOpen(o);
          if (!o) {
            setPendingId(null);
            setPin('');
          }
        }}
      >
        <DialogContent className="sm:max-w-sm" hideClose={false}>
          <DialogHeader>
            <DialogTitle>Enter PIN</DialogTitle>
            <DialogDescription>
              {pendingMember
                ? `Unlock profile for ${pendingMember.name}.`
                : 'Unlock this profile to continue.'}
            </DialogDescription>
          </DialogHeader>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void submitPin();
            }}
            className="w-full rounded-xl border border-border bg-vault-elevated px-3 py-2.5 text-sm text-vault-text focus:outline-none focus:ring-2 focus:ring-vault-warm/40"
            placeholder="Member PIN"
            autoFocus
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setPinOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-vault-muted hover:bg-vault-elevated"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pinBusy || !pin}
              onClick={() => void submitPin()}
              className="rounded-xl bg-vault-warm px-4 py-2 text-sm font-semibold text-vault-ink disabled:opacity-50"
            >
              {pinBusy ? 'Checking…' : 'Unlock'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
