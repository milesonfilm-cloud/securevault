'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import type { ShareReceivedEvent } from '@capgo/capacitor-share-target';
import { appendAuditEntry } from '@/lib/auditLog';
import { enqueueSharedFile } from '@/lib/shareIntake';
import { useRouter } from '@/i18n/navigation';

/**
 * Listens for inbound shares (PWA service worker + Capgo native share target)
 * and queues files for the document vault categorization flow.
 */
export default function ShareIntakeListener() {
  const router = useRouter();

  useEffect(() => {
    const onSwMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type !== 'SHARE_TARGET_FILES' || !Array.isArray(data.files)) return;
      void (async () => {
        for (const f of data.files as Array<{ name: string; type: string; buffer: ArrayBuffer }>) {
          const blob = new Blob([f.buffer], { type: f.type || 'application/octet-stream' });
          await enqueueSharedFile(blob, {
            name: f.name || 'shared-file',
            type: f.type,
            title: typeof data.title === 'string' ? data.title : undefined,
            text: typeof data.text === 'string' ? data.text : undefined,
          });
          appendAuditEntry({
            action: 'share_import_received',
            actorMemberId: null,
            targetId: null,
            targetTitle: f.name || 'shared-file',
            metadata: { source: 'pwa_share_target' },
          });
        }
        router.push('/family-management?shared=1');
      })();
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', onSwMessage);
    }

    let removeNative: (() => void) | undefined;

    void (async () => {
      if (!Capacitor.isNativePlatform()) return;
      try {
        const { CapacitorShareTarget } = await import('@capgo/capacitor-share-target');
        const handle = await CapacitorShareTarget.addListener(
          'shareReceived',
          (event: ShareReceivedEvent) => {
            void (async () => {
              const title = event.title;
              const text = event.texts?.[0];
              const files = event.files ?? [];

              for (const f of files) {
                let blob: Blob | null = null;
                try {
                  const src = f.uri?.startsWith('data:')
                    ? f.uri
                    : Capacitor.convertFileSrc(f.uri);
                  const res = await fetch(src);
                  blob = await res.blob();
                } catch {
                  blob = null;
                }
                if (!blob) continue;
                await enqueueSharedFile(blob, {
                  name: f.name || 'shared-file',
                  type: f.mimeType || blob.type,
                  title,
                  text,
                });
                appendAuditEntry({
                  action: 'share_import_received',
                  actorMemberId: null,
                  targetId: null,
                  targetTitle: f.name || 'shared-file',
                  metadata: { source: 'native_share_sheet' },
                });
              }

              if (!files.length && text) {
                const blob = new Blob([text], { type: 'text/plain' });
                await enqueueSharedFile(blob, {
                  name: 'shared-note.txt',
                  type: 'text/plain',
                  title,
                  text,
                });
                appendAuditEntry({
                  action: 'share_import_received',
                  actorMemberId: null,
                  targetId: null,
                  targetTitle: title || 'Shared text',
                  metadata: { source: 'native_share_sheet' },
                });
              }

              router.push('/family-management?shared=1');
            })();
          }
        );
        removeNative = () => {
          void handle.remove();
        };
      } catch {
        /* plugin optional until cap sync */
      }
    })();

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', onSwMessage);
      }
      removeNative?.();
    };
  }, [router]);

  return null;
}
