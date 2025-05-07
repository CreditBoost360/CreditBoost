import supabase from '../supabaseClient.js';
import { generateToken } from '../auth.js';
import { config } from '../config.js';

/**
 * Google Authentication Service
 * 
 * This module provides integration with Google OAuth for authentication
 * using Supabase's OAuth capabilities.
 */

/**
 * Get the Google OAuth URL for sign-in
 * @param {string} redirectUrl - URL to redirect after authentication
 * @returns {string} Google OAuth URL
 */
export const getGoogleAuthUrl = async (redirectUrl) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl || `${config.api.url}/auth/callback/google`,
        scopes: 'email profile'
      }
    });
    
    if (error) throw error;
    
    return data.url;
  } catch (error) {
    console.error('Google auth URL generation error:', error);
    throw new Error('Failed to generate Google authentication URL');
  }
};

/**
 * Handle Google OAuth callback and exchange code for session
 * @param {string} code - OAuth code from callback
 * @param {string} deviceFingerprint - Device fingerprint for enhanced security
 * @returns {Object} Authentication result with token and user data
 */
export const handleGoogleCallback = async (code, deviceFingerprint) => {
  try {
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) throw error;
    
    const { user, session } = data;
    
    if (!user) {
      throw new Error('Invalid Google authentication');
    }
    
    // Generate a compatible JWT token for our system
    const token = generateToken(user.id, deviceFingerprint);
    
    // Return user data and token
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        picture: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
        emailVerified: true, // Google accounts are verified
        authProvider: 'google',
        createdAt: user.created_at
      }
    };
  } catch (error) {
    console.error('Google callback handling error:', error);
    throw new Error('Failed to authenticate with Google');
  }
};

/**
 * Verify a Google ID token directly (alternative to OAuth flow)
 * @param {string} idToken - Google ID token
 * @param {string} deviceFingerprint - Device fingerprint
 * @returns {Object} Authentication result with token and user data
 */
export const verifyGoogleIdToken = async (idToken, deviceFingerprint) => {
  try {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    
    if (error) throw error;
    
    const { user } = data;
    
    // Generate a compatible JWT token for our system
    const token = generateToken(user.id, deviceFingerprint);
    
    // Return user data and token
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        picture: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
        emailVerified: true,
        authProvider: 'google',
        createdAt: user.created_at
      }
    };
  } catch (error) {
    console.error('Google ID token verification error:', error);
    throw new Error('Failed to verify Google ID token');
  }
};