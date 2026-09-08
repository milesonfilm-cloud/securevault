'use client';

import { useLayoutEffect, useMemo } from 'react';
import { usePastelMemberAccent } from '@/context/PastelMemberAccentContext';
import { useVaultData } from '@/context/VaultDataContext';
import type { FamilyMember } from '@/lib/storage';
import { pastelDisplayMembersOrder } from '@/lib/pastelDisplayMembers';
import { resolveMemberColor } from '@/lib/memberAvatarColors';
import {
  applyPastelMemberCssVars,
  pastelPaletteFromAvatarColor,
  PASTEL_ACCENT_PLACEHOLDER_PALETTE,
} from '@/lib/memberPastelPalettes';

function resolvePastelAccentPalette(
  accentMemberId: string | null,
  displayMembers: FamilyMember[],
  vaultMembersLoaded: boolean
) {
  if (displayMembers.length === 0) {
    return PASTEL_ACCENT_PLACEHOLDER_PALETTE;
  }
  if (!accentMemberId) {
    return pastelPaletteFromAvatarColor(displayMembers[0].avatarColor);
  }
  const found = displayMembers.findIndex((m) => m.id === accentMemberId);
  if (found >= 0) {
    return pastelPaletteFromAvatarColor(displayMembers[found].avatarColor);
  }
  if (!vaultMembersLoaded) {
    return PASTEL_ACCENT_PLACEHOLDER_PALETTE;
  }
  return PASTEL_ACCENT_PLACEHOLDER_PALETTE;
}

/**
 * Maps persisted / in-app selected member to CSS variables on `documentElement`
 * so mobile nav, drawer, sidebar, and vault tiles share the same accent.
 */
export default function PastelAccentCssSync() {
  const { accentMemberId, accentHydrated } = usePastelMemberAccent();
  const { vaultData, loading } = useVaultData();
  const memberPaletteKey = useMemo(
    () => vaultData.members.map((m) => `${m.id}:${m.avatarColor}`).join('\0'),
    [vaultData.members]
  );

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;
    if (!accentHydrated) return;

    const root = document.documentElement;
    const displayMembers = pastelDisplayMembersOrder(vaultData.members);
    const vaultReady = !loading;
    const pal = resolvePastelAccentPalette(accentMemberId, displayMembers, vaultReady);
    applyPastelMemberCssVars(root, pal);
    const glowMember =
      (accentMemberId && displayMembers.find((m) => m.id === accentMemberId)) ||
      displayMembers[0];
    const glow = glowMember
      ? resolveMemberColor(glowMember.avatarColor).border
      : '#7b6fd4';
    const mc = glowMember
      ? resolveMemberColor(glowMember.avatarColor)
      : { bg: '#F3E8FF', border: '#A855F7', text: '#7C3AED' };
    root.style.setProperty('--pastel-member-glow', glow);
    root.style.setProperty('--glass-orb-1', mc.border);
    root.style.setProperty('--glass-orb-2', mc.text);
    root.style.setProperty('--glass-orb-3', mc.bg);
  }, [loading, accentHydrated, accentMemberId, memberPaletteKey]);

  return null;
}
