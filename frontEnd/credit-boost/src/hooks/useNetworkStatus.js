import { useState, useEffect, useCallback } from 'react';

export const useNetworkStatus = () => {
  const [status, setStatus] = useState({
    online: navigator.onLine,
    effectiveType: 'unknown',
    downlink: undefined,
    rtt: undefined,
    saveData: false,
    isSlow: false
  });

  // Update network information
  const updateNetworkInfo = useCallback(() => {
    const connection = navigator.connection || 
                      navigator.mozConnection || 
                      navigator.webkitConnection;

    setStatus(prev => ({
      online: navigator.onLine,
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData || false,
      isSlow: connection?.effectiveType === 'slow-2g' || 
              connection?.effectiveType === '2g' || 
              connection?.rtt > 500 ||
              connection?.downlink < 0.5
    }));
  }, []);

  // Handle online/offline events
  useEffect(() => {
    window.addEventListener('online', updateNetworkInfo);
    window.addEventListener('offline', updateNetworkInfo);

    // Network Information API events
    const connection = navigator.connection || 
                      navigator.mozConnection || 
                      navigator.webkitConnection;

    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    // Initial check
    updateNetworkInfo();

    return () => {
      window.removeEventListener('online', updateNetworkInfo);
      window.removeEventListener('offline', updateNetworkInfo);
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, [updateNetworkInfo]);

  // Utility function to check if we should use low data mode
  const shouldUseLowData = status.saveData || status.isSlow;

  // Function to preload critical resources
  const preloadCriticalResources = useCallback(async (resources) => {
    if (!status.online || shouldUseLowData) return;

    try {
      await Promise.all(
        resources.map(resource => {
          if (resource.type === 'image') {
            return new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = resolve;
              img.onerror = reject;
              img.src = resource.url;
            });
          } else if (resource.type === 'font') {
            return document.fonts.load(resource.family);
          } else if (resource.type === 'fetch') {
            return fetch(resource.url, { priority: 'low' });
          }
        })
      );
    } catch (error) {
      console.error('Failed to preload resources:', error);
    }
  }, [status.online, shouldUseLowData]);

  // Function to check and request persistent storage
  const requestPersistentStorage = useCallback(async () => {
    try {
      if (!navigator.storage?.persist) return false;

      // Check if we already have persistent storage
      const isPersisted = await navigator.storage.persisted();
      if (isPersisted) return true;

      // Request persistent storage
      return await navigator.storage.persist();
    } catch (error) {
      console.error('Failed to request persistent storage:', error);
      return false;
    }
  }, []);

  // Function to estimate available storage
  const checkStorageQuota = useCallback(async () => {
    try {
      if (!navigator.storage?.estimate) return null;

      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota,
        usage: estimate.usage,
        available: estimate.quota - estimate.usage,
        percentageUsed: (estimate.usage / estimate.quota) * 100
      };
    } catch (error) {
      console.error('Failed to estimate storage:', error);
      return null;
    }
  }, []);

  return {
    ...status,
    shouldUseLowData,
    preloadCriticalResources,
    requestPersistentStorage,
    checkStorageQuota
  };
};