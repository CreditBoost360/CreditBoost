// API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:3000/admin';

/**
 * API Configuration
 * Provides centralized configuration for API interactions
 * with enhanced security features
 */
export const apiConfig = {
  // Get API URL for regular endpoints
  getApiUrl: (endpoint) => {
    return `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  },
  
  // Get API URL for admin endpoints
  getAdminApiUrl: (endpoint) => {
    return `${ADMIN_API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  },
  
  // Get headers for API requests
  getHeaders: (includeAuth = false, includeAdmin = false, includeBridge = false) => {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Version': import.meta.env.VITE_APP_VERSION || '1.0.0',
      'X-Request-ID': crypto.randomUUID()
    };

    // Add authorization header if needed
    if (includeAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // Add admin authorization header if needed
    if (includeAdmin) {
      const adminToken = localStorage.getItem('admin-token');
      if (adminToken) {
        headers['Admin-Authorization'] = `Bearer ${adminToken}`;
      }
    }
    
    // Add bridge authorization header if needed
    if (includeBridge) {
      const bridgeToken = localStorage.getItem('admin-bridge-token');
      if (bridgeToken) {
        headers['Bridge-Authorization'] = `Bearer ${bridgeToken}`;
      }
    }

    return headers;
  },

  // Handle API errors
  handleError: (error) => {
    // Network error
    if (!error.response) {
      return {
        status: 0,
        message: 'Network error. Please check your internet connection.'
      };
    }

    // API error with response
    const { status, data } = error.response;

    // Authentication errors
    if (status === 401) {
      // Clear token if unauthorized
      localStorage.removeItem('token');
      
      return {
        status,
        message: data.message || 'Your session has expired. Please log in again.'
      };
    }

    // Other errors
    return {
      status,
      message: data.message || 'An unexpected error occurred.',
      details: data.details || []
    };
  },
  
  // Security utilities
  security: {
    // Check if running in a secure context
    isSecureContext: () => {
      return window.isSecureContext;
    },
    
    // Validate token format and expiration
    validateToken: (token) => {
      try {
        if (!token) return false;
        
        // Check token format (should be a JWT)
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        
        // Check expiration
        const payload = JSON.parse(atob(parts[1]));
        if (!payload.exp) return false;
        
        const expirationDate = new Date(payload.exp * 1000);
        if (expirationDate <= new Date()) return false;
        
        return true;
      } catch (err) {
        console.error('Token validation error:', err);
        return false;
      }
    },
    
    // Clear all authentication data
    clearAuthData: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('admin-token');
      localStorage.removeItem('admin-bridge-token');
      localStorage.removeItem('admin-session-id');
      
      // Clear any other auth-related data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('auth-') || key.startsWith('admin-')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    },
    
    // Generate secure random string
    generateSecureRandom: (length = 32) => {
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },
    
    // Detect tampering or debugging
    detectTampering: () => {
      // Check for debugger
      const debuggerCheck = !function() { 
        const startTime = Date.now();
        debugger;
        return (Date.now() - startTime) > 100;
      }();
      
      // Check for developer tools
      const devToolsCheck = !window.Firebug && 
        !window.__REACT_DEVTOOLS_GLOBAL_HOOK__ &&
        !(window.outerWidth - window.innerWidth > 160);
      
      // Check for browser extensions that might compromise security
      const extensionsCheck = !window.chrome || !window.chrome.runtime || !window.chrome.runtime.id;
      
      return {
        secure: debuggerCheck && devToolsCheck && extensionsCheck,
        issues: {
          debuggerDetected: !debuggerCheck,
          devToolsDetected: !devToolsCheck,
          suspiciousExtensions: !extensionsCheck
        }
      };
    }
  }
};

export default apiConfig;