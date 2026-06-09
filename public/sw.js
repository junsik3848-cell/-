self.addEventListener("push", (event) => {
  if (!event.data) return;
  const { title, body, url, icon } = event.data.json();

  event.waitUntil(
    self.registration.showNotification(title ?? "LUNKER", {
      body,
      icon: icon ?? "/icon-192.png",
      badge: "/badge-72.png",
      data: { url: url ?? "/feed" },
      vibrate: [100, 50, 100],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/feed";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
