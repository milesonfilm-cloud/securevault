/* global self */
/* SecureVault — reminders + Web Share Target intake. */

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

const timers = new Map();

self.addEventListener('message', (event) => {
  const m = event.data;
  if (!m || typeof m !== 'object') return;
  if (m.type === 'SCHEDULE_NOTIFY' && typeof m.when === 'number' && m.title && m.body) {
    const delay = Math.max(0, m.when - Date.now());
    const id = `${m.when}-${Math.random()}`;
    const t = self.setTimeout(() => {
      timers.delete(id);
      self.registration.showNotification(m.title, {
        body: m.body,
        icon: '/brand/vault-mark.svg',
        badge: '/brand/vault-mark.svg',
        data: { url: '/renewals' },
      });
    }, delay);
    timers.set(id, t);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url =
    event.notification.data && event.notification.data.url
      ? event.notification.data.url
      : '/renewals';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

/** Web Share Target — receive files shared to the installed PWA. */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'POST' || !url.pathname.endsWith('/share-target')) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        const form = await event.request.formData();
        const title = form.get('title');
        const text = form.get('text');
        const files = form.getAll('files').filter((f) => f instanceof File && f.size > 0);
        const payloads = [];
        for (const file of files) {
          payloads.push({
            name: file.name || 'shared-file',
            type: file.type || 'application/octet-stream',
            buffer: await file.arrayBuffer(),
          });
        }

        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        const message = {
          type: 'SHARE_TARGET_FILES',
          title: typeof title === 'string' ? title : undefined,
          text: typeof text === 'string' ? text : undefined,
          files: payloads,
        };
        for (const client of clients) {
          client.postMessage(message);
        }

        return Response.redirect('/en/document-vault?shared=1', 303);
      } catch {
        return Response.redirect('/en/document-vault', 303);
      }
    })()
  );
});
