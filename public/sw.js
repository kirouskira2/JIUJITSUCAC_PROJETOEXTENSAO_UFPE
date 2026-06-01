// Service Worker para notificações push do JJCAC
// Este SW é registrado pelo NotificationPermission component

self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "JIU JITSU CAC";
  const options = {
    body: data.body || "Você tem uma nova notificação.",
    icon: "/logo.jpg",
    badge: "/logo.jpg",
    vibrate: [200, 100, 200],
    tag: data.tag || "jjcac-notification",
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
