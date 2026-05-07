'use client';

import { useLayoutEffect, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { usePastelMemberAccent } from '@/context/PastelMemberAccentContext';
import { useVaultData } from '@/context/VaultDataContext';
import type { FamilyMember } from '@/lib/storage';
import { pastelDisplayMembersOrder } from '@/lib/pastelDisplayMembers';
import {
  applyPastelMemberCssVars,
  clearPastelMemberCssVars,
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
 * so mobile nav, drawer, sidebar, and vault tiles share the same accent in pastel theme.
 */
export default function PastelAccentCssSync() {
  const { theme } = useTheme();
  const { accentMemberId, accentHydrated } = usePastelMemberAccent();
  const { vaultData, loading } = useVaultData();
  const memberPaletteKey = useMemo(
    () => vaultData.members.map((m) => `${m.id}:${m.avatarColor}`).join('\0'),
    [vaultData.members]
  );

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme !== 'pastel') {
      clearPastelMemberCssVars(root);
      return;
    }
    if (!accentHydrated) return;

    const displayMembers = pastelDisplayMembersOrder(vaultData.members);
    const vaultReady = !loading;
    const pal = resolvePastelAccentPalette(accentMemberId, displayMembers, vaultReady);
    applyPastelMemberCssVars(root, pal);
  }, [theme, loading, accentHydrated, accentMemberId, memberPaletteKey]);

  return null;
}
