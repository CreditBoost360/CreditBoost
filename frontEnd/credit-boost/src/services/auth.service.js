/* eslint-disable no-useless-catch */
import apiConfig from "@/config/api.config";
import api from "@/api/privateInstance";

const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";
const TOKEN_EXPIRY = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
const REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry

export const authService = {
  login: async (email, password) => {
    try {
      console.log("Attempting login with:", { email, password: "***" });
      
      // Implement device fingerprinting for enhanced security
      const deviceFingerprint = await generateDeviceFingerprint();
      
      const response = await api.post("/api/auth/login", { 
        email, 
        password,
        deviceFingerprint
      });

      if (!response.data?.token) {
        throw new Error("Invalid response from server");
      }
      
      // Store auth data with expiry
      const expiryTime = Date.now() + TOKEN_EXPIRY;
      const authData = {
        token: response.data.token,
        expiry: expiryTime,
        deviceFingerprint
      };
      
      localStorage.setItem(TOKEN_KEY, JSON.stringify(authData));
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      
      // Schedule token refresh
      scheduleTokenRefresh(expiryTime);
      
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      console.log("Starting registration process");
      const response = await api.post("/api/auth/register", userData);
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("No auth token");
      }

      // Verify token expiry
      const authData = JSON.parse(localStorage.getItem(TOKEN_KEY));
      if (Date.now() >= authData.expiry - REFRESH_BUFFER) {
        await authService.refreshToken();
      }

      const cachedUser = localStorage.getItem(USER_KEY);
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }

      const response = await api.get("/api/auth/me");
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error("Get current user error:", error);
      if (error.message.includes("token")) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
      throw error;
    }
  },

  updateUserData: async (userData) => {
    try {
      if (!userData || Object.keys(userData).length === 0) {
        throw new Error("No data to update");
      }

      const response = await api.put("/api/auth/update", userData);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error("Update user data error:", error);
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post("/api/auth/refresh");
      const { token } = response.data;
      
      // Update stored token with new expiry
      const expiryTime = Date.now() + TOKEN_EXPIRY;
      const authData = {
        token,
        expiry: expiryTime,
        deviceFingerprint: JSON.parse(localStorage.getItem(TOKEN_KEY))?.deviceFingerprint
      };
      
      localStorage.setItem(TOKEN_KEY, JSON.stringify(authData));
      scheduleTokenRefresh(expiryTime);
      
      return token;
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Clear any scheduled token refresh
    if (window.tokenRefreshTimeout) {
      clearTimeout(window.tokenRefreshTimeout);
    }
  },

  verifyToken: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No auth token');
      }

      const response = await api.post("/api/auth/verify");
      return response.data.valid;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  },

  getToken: () => {
    const authData = localStorage.getItem(TOKEN_KEY);
    if (!authData) return null;
    
    try {
      const { token } = JSON.parse(authData);
      return token;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  },

  isAuthenticated: () => {
    try {
      const authData = JSON.parse(localStorage.getItem(TOKEN_KEY));
      const user = localStorage.getItem(USER_KEY);
      
      if (!authData || !user) return false;
      
      // Check if token is expired
      if (Date.now() >= authData.expiry) {
        authService.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }
};

// Helper function to generate device fingerprint
const generateDeviceFingerprint = async () => {
  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    screen.width,
    screen.height,
    screen.colorDepth
  ];
  
  // Use SubtleCrypto for secure hashing
  const msgBuffer = new TextEncoder().encode(components.join('###'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Helper function to schedule token refresh
const scheduleTokenRefresh = (expiryTime) => {
  if (window.tokenRefreshTimeout) {
    clearTimeout(window.tokenRefreshTimeout);
  }
  
  const timeUntilRefresh = expiryTime - Date.now() - REFRESH_BUFFER;
  window.tokenRefreshTimeout = setTimeout(async () => {
    try {
      await authService.refreshToken();
    } catch (error) {
      console.error('Scheduled token refresh failed:', error);
      // Force logout if refresh fails
      authService.logout();
      window.location.href = '/login';
    }
  }, timeUntilRefresh);
};
