import supabase from '../supabaseClient.js';
import { generateToken } from '../auth.js';

/**
 * Supabase Authentication Service
 * 
 * This module provides integration between Supabase authentication
 * and the application's custom JWT authentication system.
 */

/**
 * Verify a Supabase session and generate a compatible JWT token
 * @param {string} supabaseToken - Supabase access token
 * @param {string} deviceFingerprint - Device fingerprint for enhanced security
 * @returns {Object} Authentication result with token and user data
 */
export const verifySupabaseSession = async (supabaseToken, deviceFingerprint) => {
  try {
    // Set the session manually to verify it
    const { data, error } = await supabase.auth.setSession({
      access_token: supabaseToken,
      refresh_token: '' // We don't need the refresh token for verification
    });
    
    if (error) throw error;
    
    const { user } = data;
    
    if (!user) {
      throw new Error('Invalid Supabase session');
    }
    
    // Generate a compatible JWT token for our system
    const token = generateToken(user.id, deviceFingerprint);
    
    // Return user data and token
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
        emailVerified: user.email_confirmed_at ? true : false,
        authProvider: 'supabase',
        createdAt: user.created_at
      }
    };
  } catch (error) {
    console.error('Supabase session verification error:', error);
    throw new Error('Invalid authentication session');
  }
};

/**
 * Create a new user in both Supabase and local system
 * @param {Object} userData - User registration data
 * @returns {Object} Registration result
 */
export const createSupabaseUser = async (userData) => {
  try {
    const { email, password, fullName, phone } = userData;
    
    // Register user in Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
          phone: phone || ''
        }
      }
    });
    
    if (error) throw error;
    
    // Return the created user
    return {
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: fullName || '',
        emailVerified: false,
        authProvider: 'supabase'
      }
    };
  } catch (error) {
    console.error('Supabase user creation error:', error);
    throw error;
  }
};

/**
 * Authenticate a user with Supabase
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} deviceFingerprint - Device fingerprint
 * @returns {Object} Authentication result with token and user data
 */
export const authenticateWithSupabase = async (email, password, deviceFingerprint) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Generate a compatible JWT token
    const token = generateToken(data.user.id, deviceFingerprint);
    
    return {
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name || '',
        phone: data.user.user_metadata?.phone || '',
        emailVerified: data.user.email_confirmed_at ? true : false,
        authProvider: 'supabase',
        createdAt: data.user.created_at
      }
    };
  } catch (error) {
    console.error('Supabase authentication error:', error);
    throw error;
  }
};

/**
 * Get user data from Supabase
 * @param {string} userId - User ID
 * @returns {Object} User data
 */
export const getSupabaseUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Get Supabase user error:', error);
    throw error;
  }
};

/**
 * Update user data in Supabase
 * @param {string} userId - User ID
 * @param {Object} userData - User data to update
 * @returns {Object} Updated user data
 */
export const updateSupabaseUser = async (userId, userData) => {
  try {
    // Update user metadata
    const { data: authData, error: authError } = await supabase.auth.updateUser({
      data: userData
    });
    
    if (authError) throw authError;
    
    // Update profile data if we have a profiles table
    try {
      await supabase
        .from('profiles')
        .update(userData)
        .eq('id', userId);
    } catch (profileError) {
      console.warn('Profile update failed, but auth update succeeded:', profileError);
      // Continue even if profile update fails
    }
    
    return {
      id: authData.user.id,
      email: authData.user.email,
      name: authData.user.user_metadata?.full_name || '',
      phone: authData.user.user_metadata?.phone || '',
      emailVerified: authData.user.email_confirmed_at ? true : false,
      authProvider: 'supabase',
      ...userData
    };
  } catch (error) {
    console.error('Update Supabase user error:', error);
    throw error;
  }
};