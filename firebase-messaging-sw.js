// Firebase Messaging Service Worker — Background Push Notifications
// File ini HARUS ada di /public agar bisa diakses sebagai /firebase-messaging-sw.js
//
// Ganti firebaseConfig dengan nilai dari Firebase Console Anda:
// Project Settings → General → Your apps → Firebase SDK snippet

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey:            'AIzaSyC212d1i2Wa2S_F0CgadRVzl2psYjmmydc',
  authDomain:        'ruangwarga-ea2a2.firebaseapp.com',
  projectId:         'ruangwarga-ea2a2',
  storageBucket:     'ruangwarga-ea2a2.firebasestorage.app',
  messagingSenderId: '71206013039',
  appId:             '1:71206013039:web:3c856f5c0f9832be2d259a',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Langsung ambil control halaman setelah SW aktif (tanpa perlu reload)
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// Handle pesan saat app tertutup / di tab lain
messaging.onBackgroundMessage((payload) => {
  const title   = payload.notification?.title || '🚨 Alert Darurat!';
  const body    = payload.notification?.body  || 'Ada laporan darurat baru dari warga.';
  const url     = payload.data?.url || '/panic-alerts';
  const alertId = payload.data?.alert_id || Date.now();

  self.registration.showNotification(title, {
    body,
    icon:              '/logo192.png',
    badge:             '/logo192.png',
    tag:               `panic-alert-${alertId}`,  // unik per alert → tidak saling replace
    requireInteraction: true,
    vibrate:           [300, 100, 300, 100, 300],
    data:              { url },
    actions: [
      { action: 'open', title: 'Lihat Alert' },
    ],
  });
});

// Klik notifikasi → buka halaman panic-alerts
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/panic-alerts';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Cek apakah ada tab yang sudah terbuka
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Tidak ada tab → buka baru
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
