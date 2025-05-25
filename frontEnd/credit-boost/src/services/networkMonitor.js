import { toast } from '@/components/ui/use-toast';

/**
 * Network monitoring service
 * Monitors network connectivity and provides offline/online functionality
 */
class NetworkMonitor {
  constructor() {
    this.isOnline = navigator.onLine;
    this.offlineListeners = [];
    this.onlineListeners = [];
    this.pendingRequests = [];
    this.setupEventListeners();
  }

  /**
   * Set up network event listeners
   */
  setupEventListeners() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  /**
   * Handle online event
   */
  handleOnline() {
    this.isOnline = true;
    
    // Notify user
    toast({
      title: "Connection Restored",
      description: "You're back online. Syncing data...",
      variant: "default"
    });
    
    // Process any pending requests
    this.processPendingRequests();
    
    // Notify listeners
    this.onlineListeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in online listener:', error);
      }
    });
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    this.isOnline = false;
    
    // Notify user
    toast({
      title: "Connection Lost",
      description: "You're offline. Some features may be unavailable.",
      variant: "destructive"
    });
    
    // Notify listeners
    this.offlineListeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in offline listener:', error);
      }
    });
  }

  /**
   * Add a listener for online events
   * @param {Function} listener - Callback function
   * @returns {Function} Function to remove the listener
   */
  addOnlineListener(listener) {
    this.onlineListeners.push(listener);
    return () => {
      this.onlineListeners = this.onlineListeners.filter(l => l !== listener);
    };
  }

  /**
   * Add a listener for offline events
   * @param {Function} listener - Callback function
   * @returns {Function} Function to remove the listener
   */
  addOfflineListener(listener) {
    this.offlineListeners.push(listener);
    return () => {
      this.offlineListeners = this.offlineListeners.filter(l => l !== listener);
    };
  }

  /**
   * Queue a request to be processed when online
   * @param {Function} requestFn - Function that returns a promise
   * @returns {Promise} Promise that resolves when the request is processed
   */
  queueRequest(requestFn) {
    return new Promise((resolve, reject) => {
      const request = {
        execute: requestFn,
        resolve,
        reject
      };
      
      if (this.isOnline) {
        // Execute immediately if online
        this.executeRequest(request);
      } else {
        // Queue for later if offline
        this.pendingRequests.push(request);
        toast({
          title: "Offline Mode",
          description: "Your request will be processed when you're back online.",
          variant: "default"
        });
      }
    });
  }

  /**
   * Execute a single request
   * @param {Object} request - Request object
   */
  async executeRequest(request) {
    try {
      const result = await request.execute();
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    }
  }

  /**
   * Process all pending requests
   */
  processPendingRequests() {
    const requests = [...this.pendingRequests];
    this.pendingRequests = [];
    
    requests.forEach(request => {
      this.executeRequest(request);
    });
    
    if (requests.length > 0) {
      toast({
        title: "Sync Complete",
        description: `Processed ${requests.length} pending ${requests.length === 1 ? 'request' : 'requests'}.`,
        variant: "default"
      });
    }
  }

  /**
   * Check if the device is online
   * @returns {Boolean} Online status
   */
  checkOnlineStatus() {
    return this.isOnline;
  }
}

// Create singleton instance
const networkMonitor = new NetworkMonitor();

export default networkMonitor;