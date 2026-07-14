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
  const type  = payload.data?.type;
  const isPanic = type === 'panic_button';

  const title = payload.notification?.title || (isPanic ? '🚨 Alert Darurat!' : 'Notifikasi Baru');
  const body  = payload.notification?.body  || (isPanic ? 'Ada laporan darurat baru dari warga.' : '');
  const url   = payload.data?.url || '/';
  const refId = payload.data?.alert_id || payload.data?.tamu_id || payload.data?.permohonan_id || Date.now();

  self.registration.showNotification(title, {
    body,
    icon:              '/logo192.png',
    badge:             '/logo192.png',
    tag:               type ? `${type}-${refId}` : `notif-${refId}`,  // unik per jenis+item → tidak saling replace notif beda item
    requireInteraction: isPanic,                                       // cuma alert darurat yang nempel sampai di-dismiss manual
    vibrate:           isPanic ? [300, 100, 300, 100, 300] : [200, 100, 200],
    data:              { url },
    actions: [
      { action: 'open', title: isPanic ? 'Lihat Alert' : 'Lihat' },
    ],
  });
});

// Klik notifikasi → buka halaman sesuai data.url (mis. /panic-alerts, /ajukan-surat, /tamu-lapor, /pengaduan)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

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
