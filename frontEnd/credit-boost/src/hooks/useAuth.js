import { useState, useContext, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '@/context/AppContext';
import { unifiedAuthService } from '@/services/unifiedAuth.service';
import { useToast } from '@/components/ui/use-toast';

/**
 * Custom hook for authentication operations
 * Provides a unified interface for login, logout, registration, and auth status
 */
export function useAuth() {
  const { 
    isAuthenticated, 
    setIsAuthenticated, 
    user, 
    setUser, 
    logout: contextLogout,
    checkAuthentication
  } = useContext(AppContext);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Clear any previous errors when component using this hook unmounts
  useEffect(() => {
    return () => setError(null);
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email, password, provider = 'auto') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use auto-detection if set to 'auto'
      const providerToUse = provider === 'auto' ? 'jwt' : provider;
      
      const response = await unifiedAuthService.login(email, password, providerToUse);
      
      setIsAuthenticated(true);
      setUser(response.user);
      
      toast({ 
        title: "Login Successful", 
        description: "Welcome back to CreditBoost!"
      });
      
      return response;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials and try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setIsAuthenticated, setUser, toast]);

  /**
   * Register a new user
   */
  const register = useCallback(async (userData, provider = 'auto') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use auto-detection if set to 'auto'
      const providerToUse = provider === 'auto' ? 'jwt' : provider;
      
      const response = await unifiedAuthService.register(userData, providerToUse);
      
      toast({ 
        title: "Registration Successful", 
        description: "Your account has been created successfully!"
      });
      
      return response;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Logout the current user
   */
  const logout = useCallback(async (reason = 'user_initiated') => {
    setIsLoading(true);
    setError(null);
    
    try {
      await contextLogout(reason);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message || 'Logout failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contextLogout]);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedUser = await unifiedAuthService.updateUserData(userData);
      setUser(updatedUser);
      
      toast({ 
        title: "Profile Updated", 
        description: "Your profile has been updated successfully!"
      });
      
      return updatedUser;
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Profile update failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, toast]);

  /**
   * Reset password
   */
  const resetPassword = useCallback(async (email) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await unifiedAuthService.resetPassword(email);
      
      toast({ 
        title: "Password Reset Email Sent", 
        description: "Check your email for instructions to reset your password."
      });
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Password reset failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Authenticate with Google
   */
  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await unifiedAuthService.authenticateWithGoogle();
      // Note: The redirect happens automatically, so we don't need to do anything else here
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.message || 'Google authentication failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verify current authentication status
   */
  const verifyAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const isAuth = await checkAuthentication(true);
      return isAuth;
    } catch (err) {
      console.error('Auth verification error:', err);
      setError(err.message || 'Authentication verification failed.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checkAuthentication]);

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    loginWithGoogle,
    verifyAuth,
    clearError: () => setError(null)
  };
}