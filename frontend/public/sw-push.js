// Custom push event handlers injected into the service worker.
// next-pwa merges this into the generated sw.js via the workerSrc config.

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'BazaarLens Alert', {
      body: data.body ?? 'A market event requires your attention.',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: 'bazaarlens-alert',      // replaces previous notification
      renotify: true,
      data: { url: data.url ?? '/watchlist' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url ?? '/watchlist';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const existing = list.find((c) => c.url.includes(target) && 'focus' in c);
      return existing ? existing.focus() : clients.openWindow(target);
    })
  );
});
