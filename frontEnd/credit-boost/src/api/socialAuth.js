import axiosInstance from "./axiosInstance";
import api from "./privateInstance";
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { unifiedAuthService } from '@/services/unifiedAuth.service';

const baseURL = import.meta.env.VITE_PRODUCTION === 'true'
  ? 'https://credvault.co.ke/api'
  : import.meta.env.VITE_DEV_URL || 'http://localhost:3000/api';

const redirectURL = import.meta.env.VITE_PRODUCTION === 'true'
  ? 'https://credvault.co.ke/auth/google'
  : 'http://localhost:5173/auth/google';

export const verifyUserSession = async () => {
  const response = await api.post('auth/verify');
  return response.data;
};

export const socialAxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  },
});

// Enhanced Google authentication that tries Supabase first, then falls back to custom OAuth
export const authenticateWithGoogle = async () => {
  try {
    // Try Supabase authentication first
    try {
      await unifiedAuthService.authenticateWithGoogle();
      return; // If successful, we're done
    } catch (supabaseError) {
      console.log('Supabase Google auth failed, falling back to custom OAuth', supabaseError);
      // Fall back to custom OAuth implementation
    }
    
    // Legacy custom OAuth implementation
    const url = `${baseURL}/o/google-oauth2/?redirect_uri=${encodeURIComponent(redirectURL)}`;
    const res = await axiosInstance.get(url);

    if (res.status === 200 && typeof window !== 'undefined') {
      console.log('Full response:', res);
      console.log('auth url:', res.data.authorization_url);
      window.location.replace(res.data.authorization_url);
    } else {
      toast({ title: "Error", description: "Authentication failed", variant: "destructive" });
    }
  } catch (err) {
    console.error(err);
    toast({ title: "Error", description: "Authentication failed", variant: "destructive" });
  }
};

// Handle OAuth callback
export const handleOAuthCallback = async (state, code) => {
  try {
    // Try Supabase callback handling first
    const supabaseResult = await unifiedAuthService.handleOAuthCallback();
    if (supabaseResult.success) {
      return supabaseResult;
    }
    
    // Fall back to custom OAuth handling
    const response = await socialAxiosInstance.post(
      `${baseURL}/o/google-oauth2/?state=${encodeURIComponent(state)}&code=${encodeURIComponent(code)}`
    );
    
    return response.data;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return { success: false, error };
  }
};