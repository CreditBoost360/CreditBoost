/* eslint-disable no-useless-catch */
import { authService as jwtAuthService } from './auth.service';
import supabase from '@/api/supabaseClient';
import { toast } from '@/components/ui/use-toast';

// Storage keys
const AUTH_PROVIDER_KEY = 'auth_provider';
const SUPABASE_SESSION_KEY = 'supabase_session';

/**
 * Unified Authentication Service
 * 
 * This service integrates both JWT and Supabase authentication systems
 * to provide a seamless authentication experience while maintaining
 * the security benefits of both systems.
 */
export const unifiedAuthService = {
  /**
   * Login with either JWT or Supabase authentication
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} provider - Authentication provider ('jwt' or 'supabase')
   */
  login: async (email, password, provider = 'jwt') => {
    try {
      let authResult;
      
      if (provider === 'supabase') {
        // Supabase authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        // Store Supabase session
        localStorage.setItem(SUPABASE_SESSION_KEY, JSON.stringify(data.session));
        localStorage.setItem(AUTH_PROVIDER_KEY, 'supabase');
        
        authResult = {
          user: data.user,
          token: data.session.access_token
        };
      } else {
        // JWT authentication
        authResult = await jwtAuthService.login(email, password);
        localStorage.setItem(AUTH_PROVIDER_KEY, 'jwt');
      }
      
      return authResult;
    } catch (error) {
      console.error(`Login error (${provider}):`, error);
      toast({ title: "Error", description: `Login failed: ${error.message || 'Unknown error'}`, variant: "destructive" });
      throw error;
    }
  },

  /**
   * Register a new user with either JWT or Supabase
   * @param {Object} userData - User registration data
   * @param {string} provider - Authentication provider ('jwt' or 'supabase')
   */
  register: async (userData, provider = 'jwt') => {
    try {
      if (provider === 'supabase') {
        // Supabase registration
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              full_name: userData.fullName || '',
              phone: userData.phone || ''
            }
          }
        });
        
        if (error) throw error;
        
        // Store provider preference
        localStorage.setItem(AUTH_PROVIDER_KEY, 'supabase');
        
        return {
          user: data.user,
          session: data.session
        };
      } else {
        // JWT registration
        const result = await jwtAuthService.register(userData);
        localStorage.setItem(AUTH_PROVIDER_KEY, 'jwt');
        return result;
      }
    } catch (error) {
      console.error(`Registration error (${provider}):`, error);
      toast({ title: "Error", description: `Registration failed: ${error.message || 'Unknown error'}`, variant: "destructive" });
      throw error;
    }
  },

  /**
   * Get the current authenticated user
   */
  getCurrentUser: async () => {
    try {
      const provider = localStorage.getItem(AUTH_PROVIDER_KEY);
      
      if (provider === 'supabase') {
        // Get current Supabase user
        const { data: { user } } = await supabase.auth.getUser();
        return user;
      } else {
        // Default to JWT authentication
        return await jwtAuthService.getCurrentUser();
      }
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  /**
   * Update user data
   * @param {Object} userData - User data to update
   */
  updateUserData: async (userData) => {
    try {
      const provider = localStorage.getItem(AUTH_PROVIDER_KEY);
      
      if (provider === 'supabase') {
        // Update Supabase user data
        const { data, error } = await supabase.auth.updateUser({
          data: userData
        });
        
        if (error) throw error;
        return data.user;
      } else {
        // Default to JWT user update
        return await jwtAuthService.updateUserData(userData);
      }
    } catch (error) {
      console.error('Update user data error:', error);
      throw error;
    }
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async () => {
    try {
      const provider = localStorage.getItem(AUTH_PROVIDER_KEY);
      
      if (provider === 'supabase') {
        // Refresh Supabase session
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) throw error;
        
        // Update stored session
        localStorage.setItem(SUPABASE_SESSION_KEY, JSON.stringify(data.session));
        return data.session.access_token;
      } else {
        // Default to JWT token refresh
        return await jwtAuthService.refreshToken();
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  },

  /**
   * Log out the current user
   */
  logout: async () => {
    try {
      const provider = localStorage.getItem(AUTH_PROVIDER_KEY);
      
      if (provider === 'supabase') {
        // Supabase logout
        await supabase.auth.signOut();
        localStorage.removeItem(SUPABASE_SESSION_KEY);
      }
      
      // Always clear JWT auth data as well for complete logout
      jwtAuthService.logout();
      
      // Clear provider preference
      localStorage.removeItem(AUTH_PROVIDER_KEY);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  /**
   * Verify if the current token is valid
   */
  verifyToken: async () => {
    try {
      const provider = localStorage.getItem(AUTH_PROVIDER_KEY);
      
      if (provider === 'supabase') {
        // Verify Supabase session
        const { data, error } = await supabase.auth.getSession();
        return !error && !!data.session;
      } else {
        // Default to JWT token verification
        return await jwtAuthService.verifyToken();
      }
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  },

  /**
   * Get the current authentication token
   */
  getToken: () => {
    try {
      const provider = localStorage.getItem(AUTH_PROVIDER_KEY);
      
      if (provider === 'supabase') {
        // Get Supabase token
        const sessionData = localStorage.getItem(SUPABASE_SESSION_KEY);
        if (!sessionData) return null;
        
        const session = JSON.parse(sessionData);
        return session.access_token;
      } else {
        // Default to JWT token
        return jwtAuthService.getToken();
      }
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },

  /**
   * Check if the user is authenticated
   */
  isAuthenticated: async () => {
    try {
      const provider = localStorage.getItem(AUTH_PROVIDER_KEY);
      
      if (provider === 'supabase') {
        // Check Supabase authentication
        const { data } = await supabase.auth.getSession();
        return !!data.session;
      } else {
        // Default to JWT authentication check
        return jwtAuthService.isAuthenticated();
      }
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  },

  /**
   * Authenticate with Google via Supabase
   */
  authenticateWithGoogle: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/google'
        }
      });
      
      if (error) throw error;
      
      // Set provider to Supabase when using social login
      localStorage.setItem(AUTH_PROVIDER_KEY, 'supabase');
      
      return data;
    } catch (error) {
      console.error('Google authentication error:', error);
      toast({ title: "Error", description: "Google authentication failed", variant: "destructive" });
      throw error;
    }
  },

  /**
   * Handle OAuth callback (for Google authentication)
   */
  handleOAuthCallback: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (data.session) {
        localStorage.setItem(SUPABASE_SESSION_KEY, JSON.stringify(data.session));
        localStorage.setItem(AUTH_PROVIDER_KEY, 'supabase');
        return {
          success: true,
          user: data.session.user
        };
      }
      
      return { success: false };
    } catch (error) {
      console.error('OAuth callback error:', error);
      return { success: false, error };
    }
  }
};

// Export the original services for advanced use cases
export { jwtAuthService };
export { supabase };