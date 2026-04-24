'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { VaultData } from '@/lib/storage';
import { idbGetPhotosForDoc } from '@/lib/db';
import { buildVaultHealthMetadata } from '@/lib/vaultHealth/metadataSerializer';
import { calculateVaultHealthScore, type VaultHealthScoreResult } from '@/lib/vaultHealth/scoreCalculator';

const CACHE_KEY = 'sv_vault_health_ai_v1';
const TTL_MS = 60 * 60 * 1000;

type CacheEntry = {
  at: number;
  fingerprint: string;
  suggestions: string[];
};

function fingerprint(data: VaultData): string {
  return `${data.members.length}:${data.documents.length}:${data.documents.map((d) => d.id + d.updatedAt).join('|')}`;
}

function readCache(fp: string): string[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as CacheEntry;
    if (!c || typeof c.at !== 'number' || !Array.isArray(c.suggestions)) return null;
    if (Date.now() - c.at > TTL_MS) return null;
    if (c.fingerprint !== fp) return null;
    return c.suggestions;
  } catch {
    return null;
  }
}

function writeCache(fp: string, suggestions: string[]): void {
  try {
    const entry: CacheEntry = { at: Date.now(), fingerprint: fp, suggestions };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    /* ignore */
  }
}

export function useVaultHealth(vaultData: VaultData, loading: boolean) {
  const [photoIds, setPhotoIds] = useState<Set<string>>(new Set());
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const fp = useMemo(() => fingerprint(vaultData), [vaultData]);

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

  const fetchSuggestions = useCallback(
    async (force: boolean) => {
      if (!force) {
        const c = readCache(fp);
        if (c) {
          setSuggestions(c);
          return;
        }
      }
      setAiLoading(true);
      setAiError(null);
      try {
        const metadata = buildVaultHealthMetadata(vaultData);
        const res = await fetch('/api/ai/vault-health', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metadata }),
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(j.error ?? 'request_failed');
        }
        const j = (await res.json()) as { suggestions?: string[] };
        const s = Array.isArray(j.suggestions) ? j.suggestions : [];
        setSuggestions(s);
        writeCache(fp, s);
      } catch (e) {
        setAiError(e instanceof Error ? e.message : 'failed');
        setSuggestions([]);
      } finally {
        setAiLoading(false);
      }
    },
    [fp, vaultData]
  );

  useEffect(() => {
    if (loading) return;
    void fetchSuggestions(false);
  }, [loading, fp, fetchSuggestions]);

  return {
    score,
    suggestions,
    aiLoading,
    aiError,
    refreshAi: () => void fetchSuggestions(true),
  };
}
