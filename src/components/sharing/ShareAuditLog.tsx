'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Trash2, Link2 } from 'lucide-react';
import { useVaultData } from '@/context/VaultDataContext';
import type { ShareLink } from '@/lib/storage';

function formatAgo(iso: string): string {
  try {
    const t = Date.parse(iso);
    if (!Number.isFinite(t)) return iso;
    const s = Math.floor((Date.now() - t) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
    return `${Math.floor(s / 86400)} d ago`;
  } catch {
    return iso;
  }
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export default function ShareAuditLog() {
  const { vaultData, persistVaultData } = useVaultData();
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const links = vaultData.shareLinks;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const next: Record<string, number> = {};
      await Promise.all(
        links.map(async (l) => {
          try {
            const r = await fetch(`/api/share/${l.shareId}/meta`);
            if (r.ok) {
              const j = (await r.json()) as { views?: number };
              next[l.shareId] = typeof j.views === 'number' ? j.views : 0;
            } else {
              next[l.shareId] = l.views.length;
            }
          } catch {
            next[l.shareId] = l.views.length;
          }
        })
      );
      if (!cancelled) setViewCounts(next);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [links]);

  const revoke = async (link: ShareLink) => {
    try {
      await fetch(`/api/share/${link.shareId}`, { method: 'DELETE' });
    } catch {
      /* still remove locally */
    }
    await persistVaultData({
      ...vaultData,
      shareLinks: vaultData.shareLinks.filter((x) => x.shareId !== link.shareId),
    });
    toast.success('Share link revoked');
  };

  if (links.length === 0) {
    return (
      <div className="neo-card rounded-2xl p-6">
        <h3 className="text-sm font-800 text-vault-text mb-1">Shared links</h3>
        <p className="text-xs text-vault-muted">No active share links. Share a document from the vault list.</p>
      </div>
    );
  }

  return (
    <div className="neo-card rounded-2xl p-6">
      <h3 className="text-sm font-800 text-vault-text mb-3 flex items-center gap-2">
        <Link2 size={16} className="text-vault-warm" />
        Shared links
      </h3>
      <ul className="space-y-3">
        {links.map((l) => {
          const expired = Date.parse(l.expiresAt) < Date.now();
          const views = viewCounts[l.shareId] ?? 0;
          return (
            <li
              key={l.shareId}
              className="rounded-xl border border-border bg-vault-elevated/40 px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-600 text-vault-text truncate">{l.docTitle}</p>
                <p className="text-[11px] text-vault-muted mt-0.5">
                  Created {formatAgo(l.createdAt)}
                  {expired ? (
                    <span className="text-red-400 ml-2">Expired</span>
                  ) : (
                    <span className="ml-2">· Until {formatDateTime(l.expiresAt)}</span>
                  )}
                </p>
                <p className="text-[11px] text-vault-faint mt-1">{views} view(s)</p>
              </div>
              <button
                type="button"
                onClick={() => void revoke(l)}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-600 text-red-300 hover:bg-red-500/10"
              >
                <Trash2 size={14} />
                Revoke
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
