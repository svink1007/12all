/* eslint-disable */

self.addEventListener("push", e => {
  const data = e.data.json();

  if (data) {
    e.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.description,
        icon: `${location.origin}/assets/icon/favicon.png`,
        data: {
          url: data.url
        }
      })
    );
  }
});

self.addEventListener('notificationclick', e => {
  e.waitUntil(self.clients.matchAll().then(clients => {
    if (clients.length) {
      clients[0].focus();
    } else {
      self.clients.openWindow(e.notification.data.url || '/');
    }
  }));
});
