import { openDB } from 'idb';

const DB_NAME = 'creditBoostOfflineDB';
const DB_VERSION = 1;

class OfflineSyncService {
  constructor() {
    this.dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create stores for different types of data
        db.createObjectStore('chatHistories', { keyPath: 'id' });
        db.createObjectStore('userData', { keyPath: 'id' });
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      },
    });
  }

  async saveOfflineData(storeName, data) {
    const db = await this.dbPromise;
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await store.put(data);
  }

  async getOfflineData(storeName, key) {
    const db = await this.dbPromise;
    return db.get(storeName, key);
  }

  async getAllOfflineData(storeName) {
    const db = await this.dbPromise;
    return db.getAll(storeName);
  }

  async queueSync(action) {
    const db = await this.dbPromise;
    await db.add('syncQueue', {
      action,
      timestamp: new Date().toISOString(),
      status: 'pending'
    });
  }

  async processSyncQueue() {
    const db = await this.dbPromise;
    const queue = await db.getAll('syncQueue');
    
    for (const item of queue) {
      if (item.status === 'pending') {
        try {
          // Process the sync action
          await this.performSync(item.action);
          
          // Mark as completed
          const tx = db.transaction('syncQueue', 'readwrite');
          const store = tx.objectStore('syncQueue');
          await store.put({
            ...item,
            status: 'completed',
            syncedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error('Sync failed:', error);
          // Mark as failed
          const tx = db.transaction('syncQueue', 'readwrite');
          const store = tx.objectStore('syncQueue');
          await store.put({
            ...item,
            status: 'failed',
            error: error.message
          });
        }
      }
    }
  }

  async performSync(action) {
    // Implement the actual sync logic based on the action type
    switch (action.type) {
      case 'UPDATE_CHAT':
        // Sync chat updates
        break;
      case 'UPDATE_USER_DATA':
        // Sync user data updates
        break;
      default:
        throw new Error('Unknown sync action type');
    }
  }
}

export const offlineSyncService = new OfflineSyncService();

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('ServiceWorker registration successful');
    }).catch(error => {
      console.log('ServiceWorker registration failed:', error);
    });
  });
}