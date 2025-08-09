// Service Worker for Songbook Maker
const STATIC_CACHE = 'songbook-static-v0.5.2';
const DYNAMIC_CACHE = 'songbook-dynamic-v0.5.2';

// キャッシュするリソース - 新しいファイル構造対応
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/main.js',
  '/styles.css',
  '/manifest.json',
  '/assets/icons/favicon.svg'
  // 動的リソースは実行時にキャッシュする
];

// Service Worker インストール
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Service Worker アクティベート
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// フェッチイベント（ネットワークリクエストの処理）
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 同じオリジンのリクエストのみ処理
  if (url.origin !== location.origin) {
    return;
  }

  // POST リクエストはキャッシュしない
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // キャッシュにある場合はそれを返す
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', request.url);
          return cachedResponse;
        }

        // ネットワークから取得
        return fetch(request)
          .then((response) => {
            // レスポンスが無効な場合はそのまま返す
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 動的キャッシュに保存
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                console.log('[SW] Caching new resource:', request.url);
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error);
            
            // オフライン時のフォールバック
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            throw error;
          });
      })
  );
});

// バックグラウンド同期
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'save-project') {
    event.waitUntil(
      syncProjectData()
    );
  }
});

// プッシュ通知
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    vibrate: [100, 50, 100],
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/action-open.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ],
    tag: 'songbook-notification',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification('Songbook Maker', options)
  );
});

// 通知クリック
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// メッセージ受信（アプリからのメッセージ）
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.payload;
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => cache.addAll(urlsToCache))
    );
  }
});

// プロジェクトデータの同期
async function syncProjectData() {
  try {
    // IndexedDB からペンディング中のプロジェクトデータを取得
    const pendingData = await getPendingProjectData();
    
    if (pendingData.length > 0) {
      console.log('[SW] Syncing project data:', pendingData.length, 'items');
      
      // 各データを処理
      for (const data of pendingData) {
        try {
          await processProjectData(data);
          await removePendingProjectData(data.id);
        } catch (error) {
          console.error('[SW] Failed to sync project data:', error);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// ペンディング中のプロジェクトデータを取得
async function getPendingProjectData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('songbook-sync', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pending'], 'readonly');
      const store = transaction.objectStore('pending');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', { keyPath: 'id' });
      }
    };
  });
}

// プロジェクトデータを処理
async function processProjectData(data) {
  // ここでクラウド同期やバックアップ処理を実装
  console.log('[SW] Processing project data:', data);
  return Promise.resolve();
}

// ペンディングデータを削除
async function removePendingProjectData(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('songbook-sync', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pending'], 'readwrite');
      const store = transaction.objectStore('pending');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// キャッシュサイズ管理
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    const keysToDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// 定期的なキャッシュクリーンアップ
setInterval(() => {
  limitCacheSize(DYNAMIC_CACHE, 50);
}, 60000); // 1分ごと
