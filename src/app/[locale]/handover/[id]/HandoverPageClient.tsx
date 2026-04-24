'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { HandoverPayload } from '@/lib/emergency/handoverPayload';
import {
  decryptJsonPayload,
  importShareKeyMaterial,
} from '@/lib/sharing/shareCrypto';

export default function HandoverPageClient() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const [payload, setPayload] = useState<HandoverPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof window === 'undefined') return;
    const hash = window.location.hash.replace(/^#/, '');
    const keyRaw = hash.startsWith('k=') ? hash.slice(2) : hash.length > 0 ? hash : null;
    if (!keyRaw) {
      setError('missing_key');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/emergency/handover/${id}`);
        if (!res.ok) {
          setError('not_found');
          return;
        }
        const j = (await res.json()) as { cipherB64?: string };
        if (!j.cipherB64) {
          setError('bad_payload');
          return;
        }
        const inner = JSON.parse(atob(j.cipherB64)) as { ivB64: string; ctB64: string };
        const key = await importShareKeyMaterial(keyRaw);
        const data = await decryptJsonPayload<HandoverPayload>(key, inner.ivB64, inner.ctB64);
        if (!cancelled) setPayload(data);
      } catch {
        if (!cancelled) setError('decrypt_failed');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen neo-bg px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-[3px] text-vault-faint text-center">
          SecureVault
        </p>
        <p className="text-sm text-vault-muted text-center mt-1">Emergency handover (read-only)</p>

        {error === 'missing_key' && (
          <p className="text-sm text-red-300 text-center mt-6">
            Open the complete link including the part after #.
          </p>
        )}
        {error === 'not_found' && (
          <p className="text-sm text-vault-muted text-center mt-6">
            This handover link expired or was replaced.
          </p>
        )}
        {(error === 'decrypt_failed' || error === 'bad_payload') && (
          <p className="text-sm text-red-300 text-center mt-6">Could not open this handover bundle.</p>
        )}

        {payload && (
          <div className="mt-8 space-y-6">
            <p className="text-xs text-vault-faint text-center italic border border-border rounded-xl p-3 bg-vault-panel">
              Shared by SecureVault — view only · generated {new Date(payload.generatedAt).toLocaleString()}
            </p>
            {payload.documents.map((d, i) => (
              <div
                key={`${d.title}-${i}`}
                className="rounded-2xl border border-border bg-vault-panel p-5 shadow-vault"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-vault-warm">
                  {d.categoryId}
                </p>
                <h2 className="text-lg font-bold text-vault-text mt-1">{d.title}</h2>
                <p className="text-xs text-vault-muted mt-0.5">{d.memberName}</p>
                <table className="w-full text-sm mt-4">
                  <tbody>
                    {Object.entries(d.fields).map(([k, v]) => (
                      <tr key={k} className="border-t border-border">
                        <th className="text-left py-2 pr-3 text-vault-muted font-600 w-[36%] align-top">
                          {k}
                        </th>
                        <td className="py-2 text-vault-text break-words">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {d.notes?.trim() ? (
                  <p className="text-xs text-vault-faint mt-3">Notes: {d.notes}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
