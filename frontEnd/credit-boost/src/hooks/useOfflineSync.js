import { useState, useEffect, useCallback } from 'react';
import { useNetworkStatus } from './useNetworkStatus';

export const useOfflineSync = (key, initialData = null) => {
  const [data, setData] = useState(initialData);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { online } = useNetworkStatus();

  // Initialize IndexedDB
  const initDB = useCallback(async () => {
    const dbName = 'CreditBoostOfflineDB';
    const storeName = 'offlineStore';
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      };
    });
  }, []);

  // Load data from IndexedDB
  const loadFromIndexedDB = useCallback(async () => {
    try {
      const db = await initDB();
      const transaction = db.transaction('offlineStore', 'readonly');
      const store = transaction.objectStore('offlineStore');
      const request = store.get(key);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result?.data);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to load from IndexedDB:', error);
      return null;
    }
  }, [key, initDB]);

  // Save data to IndexedDB
  const saveToIndexedDB = useCallback(async (newData) => {
    try {
      const db = await initDB();
      const transaction = db.transaction('offlineStore', 'readwrite');
      const store = transaction.objectStore('offlineStore');
      
      return new Promise((resolve, reject) => {
        const request = store.put({
          id: key,
          data: newData,
          timestamp: Date.now()
        });
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to save to IndexedDB:', error);
    }
  }, [key, initDB]);

  // Update data with offline support
  const updateData = useCallback(async (newData) => {
    setData(newData);
    await saveToIndexedDB(newData);
    
    if (!online) {
      setPendingChanges(prev => [...prev, {
        timestamp: Date.now(),
        data: newData,
        type: 'update'
      }]);
    }
  }, [online, saveToIndexedDB]);

  // Sync pending changes when coming online
  const syncChanges = useCallback(async () => {
    if (!online || isSyncing || pendingChanges.length === 0) return;
    
    setIsSyncing(true);
    
    try {
      // Process changes in order
      for (const change of pendingChanges) {
        try {
          // Here you would typically make API calls to sync changes
          // This is a placeholder for your actual sync logic
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Remove synced change
          setPendingChanges(prev => 
            prev.filter(c => c.timestamp !== change.timestamp)
          );
        } catch (error) {
          console.error('Failed to sync change:', error);
          // Keep the change in pending changes to retry later
        }
      }
    } finally {
      setIsSyncing(false);
    }
  }, [online, isSyncing, pendingChanges]);

  // Load initial data
  useEffect(() => {
    loadFromIndexedDB().then(savedData => {
      if (savedData) {
        setData(savedData);
      }
    });
  }, [loadFromIndexedDB]);

  // Sync changes when coming online
  useEffect(() => {
    if (online) {
      syncChanges();
    }
  }, [online, syncChanges]);

  return {
    data,
    updateData,
    isSyncing,
    hasPendingChanges: pendingChanges.length > 0,
    pendingChangesCount: pendingChanges.length,
    forceSyncNow: syncChanges
  };
};