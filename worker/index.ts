// self is already declared in ServiceWorkerGlobalScope

self.addEventListener('push', (event: any) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'New Booking!';
  const options = {
    body: data.body || 'You have a new appointment request.',
    icon: '/icon.png',
    badge: '/icon.png',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil((self as any).registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();
  event.waitUntil(
    (self as any).clients.openWindow(event.notification.data.url)
  );
});
