import { authenticateToken } from '../auth.js';
import { verifySupabaseSession } from '../auth/supabaseAuth.js';

/**
 * Enhanced authentication middleware that supports both JWT and Supabase authentication
 * 
 * This middleware checks for authentication tokens in the following order:
 * 1. Standard JWT token in Authorization header
 * 2. Supabase token in X-Supabase-Auth header
 * 
 * If either authentication method succeeds, the request is allowed to proceed.
 */
export const unifiedAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const supabaseToken = req.headers["x-supabase-auth"];
    const deviceFingerprint = req.headers["x-device-fingerprint"];
    
    // If no authentication tokens are provided, reject the request
    if (!authHeader && !supabaseToken) {
      return res.status(401).json({ 
        error: "Authentication required",
        message: "No authentication token provided"
      });
    }
    
    // Try JWT authentication first if available
    if (authHeader) {
      try {
        // Use the existing JWT authentication middleware
        return authenticateToken(req, res, next);
      } catch (jwtError) {
        console.log('JWT authentication failed, trying Supabase:', jwtError.message);
        // If JWT auth fails, continue to try Supabase auth
      }
    }
    
    // Try Supabase authentication if available
    if (supabaseToken) {
      try {
        const authResult = await verifySupabaseSession(supabaseToken, deviceFingerprint);
        
        // Set user ID and authentication provider in request
        req.userId = authResult.user.id;
        req.authProvider = 'supabase';
        req.user = authResult.user;
        
        return next();
      } catch (supabaseError) {
        console.error('Supabase authentication failed:', supabaseError.message);
        // If Supabase auth fails and we already tried JWT, return error
        if (!authHeader) {
          return res.status(401).json({
            error: "Authentication failed",
            message: "Invalid authentication token"
          });
        }
      }
    }
    
    // If we reach here, both authentication methods failed
    return res.status(401).json({
      error: "Authentication failed",
      message: "All authentication methods failed"
    });
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ 
      error: "Authentication failed",
      message: "An error occurred during authentication"
    });
  }
};