'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SharedDocumentView from '@/components/sharing/SharedDocumentView';
import { decryptSharePayload, importShareKeyMaterial } from '@/lib/sharing/shareCrypto';
import type { SharePayload } from '@/lib/sharing/shareCrypto';

export default function SharePageClient() {
  const params = useParams();
  const shareId = typeof params?.shareId === 'string' ? params.shareId : '';
  const [payload, setPayload] = useState<SharePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId || typeof window === 'undefined') return;
    const hash = window.location.hash.replace(/^#/, '');
    let keyRaw: string | null = null;
    if (hash.startsWith('k=')) {
      keyRaw = hash.slice(2);
    } else if (hash.length > 0) {
      keyRaw = hash;
    }
    if (!keyRaw) {
      setError('missing_key');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/share/${shareId}`);
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
        const data = await decryptSharePayload(key, inner.ivB64, inner.ctB64);
        if (!cancelled) setPayload(data);
      } catch {
        if (!cancelled) setError('decrypt_failed');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shareId]);

  return (
    <div className="min-h-screen neo-bg px-4 py-10">
      <div className="max-w-lg mx-auto">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[3px] text-vault-faint">SecureVault</p>
          <p className="text-sm text-vault-muted mt-1">Shared document (view only)</p>
        </div>
        {error === 'missing_key' && (
          <p className="text-sm text-red-300 text-center">
            This link is incomplete — open the full URL you were sent (including the part after #).
          </p>
        )}
        {error === 'not_found' && (
          <p className="text-sm text-vault-muted text-center">
            This share link has expired or was revoked.
          </p>
        )}
        {(error === 'decrypt_failed' || error === 'bad_payload') && (
          <p className="text-sm text-red-300 text-center">Could not open this shared document.</p>
        )}
        {payload && <SharedDocumentView payload={payload} />}
      </div>
    </div>
  );
}
