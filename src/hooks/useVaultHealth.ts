'use client';

import { useEffect, useMemo, useState } from 'react';
import type { VaultData } from '@/lib/storage';
import { idbGetPhotosForDoc } from '@/lib/db';
import {
  calculateVaultHealthScore,
  type VaultHealthScoreResult,
} from '@/lib/vaultHealth/scoreCalculator';
import { buildLocalHealthSuggestions } from '@/lib/vaultHealth/localSuggestions';

export function useVaultHealth(vaultData: VaultData, loading: boolean) {
  const [photoIds, setPhotoIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    (async () => {
      const next = new Set<string>();
      await Promise.all(
        vaultData.documents.map(async (d) => {
          try {
            const p = await idbGetPhotosForDoc(d.id);
            if (p.length > 0) next.add(d.id);
          } catch {
            /* ignore */
          }
        })
      );
      if (!cancelled) setPhotoIds(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, vaultData.documents]);

  const score: VaultHealthScoreResult = useMemo(
    () => calculateVaultHealthScore(vaultData, photoIds),
    [vaultData, photoIds]
  );

  const suggestions = useMemo(
    () => (loading ? [] : buildLocalHealthSuggestions(vaultData)),
    [loading, vaultData]
  );

  return { score, suggestions };
}
