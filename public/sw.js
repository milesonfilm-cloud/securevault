/* global self */
/* SecureVault — lightweight service worker for scheduled expiry reminders (best-effort). */

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
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/renewals';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
