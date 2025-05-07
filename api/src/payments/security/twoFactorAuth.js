/**
 * Sunny Payment Gateway - Two-Factor Authentication
 * 
 * Implements 2FA for sensitive payment operations
 */

import crypto from 'crypto';
import { generateToken } from '../../auth.js';

// In-memory store for 2FA codes (in production, use Redis or a database)
const twoFactorCodes = new Map();

/**
 * Generate a 2FA code for a user
 * 
 * @param {string} userId - User ID
 * @returns {Object} 2FA code information
 */
export function generate2FACode(userId) {
  // Generate a 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();
  
  // Set expiration time (5 minutes)
  const expiresAt = Date.now() + 5 * 60 * 1000;
  
  // Store code
  twoFactorCodes.set(userId, {
    code,
    expiresAt,
    attempts: 0
  });
  
  return {
    userId,
    expiresAt: new Date(expiresAt).toISOString()
  };
}

/**
 * Verify a 2FA code
 * 
 * @param {string} userId - User ID
 * @param {string} code - 2FA code to verify
 * @returns {boolean} Whether the code is valid
 */
export function verify2FACode(userId, code) {
  const storedData = twoFactorCodes.get(userId);
  
  // Check if code exists
  if (!storedData) {
    return false;
  }
  
  // Check if code has expired
  if (Date.now() > storedData.expiresAt) {
    twoFactorCodes.delete(userId);
    return false;
  }
  
  // Increment attempts
  storedData.attempts += 1;
  
  // Check if too many attempts
  if (storedData.attempts >= 3) {
    twoFactorCodes.delete(userId);
    return false;
  }
  
  // Check if code matches
  if (storedData.code !== code) {
    return false;
  }
  
  // Code is valid, delete it to prevent reuse
  twoFactorCodes.delete(userId);
  
  return true;
}

/**
 * Middleware to require 2FA for sensitive operations
 */
export function require2FA(req, res, next) {
  const { twoFactorToken } = req.headers;
  
  if (!twoFactorToken) {
    return res.status(403).json({
      success: false,
      error: 'TWO_FACTOR_REQUIRED',
      message: 'Two-factor authentication required for this operation'
    });
  }
  
  try {
    // Verify token (in a real implementation, this would validate a JWT or similar)
    const isValid = twoFactorToken.length === 64; // Placeholder validation
    
    if (!isValid) {
      return res.status(403).json({
        success: false,
        error: 'INVALID_TWO_FACTOR_TOKEN',
        message: 'Invalid two-factor authentication token'
      });
    }
    
    next();
  } catch (error) {
    console.error('2FA verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'TWO_FACTOR_ERROR',
      message: 'Error verifying two-factor authentication'
    });
  }
}

/**
 * Request 2FA code
 * In a real implementation, this would send the code via SMS or email
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export async function request2FACode(req, res) {
  try {
    const { userId } = req;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required'
      });
    }
    
    // Generate 2FA code
    const result = generate2FACode(userId);
    
    // In a real implementation, send the code via SMS or email
    // For this example, we'll just log it
    console.log(`2FA code for user ${userId}: ${twoFactorCodes.get(userId).code}`);
    
    res.json({
      success: true,
      message: '2FA code sent successfully',
      expiresAt: result.expiresAt
    });
  } catch (error) {
    console.error('Error generating 2FA code:', error);
    res.status(500).json({
      success: false,
      error: 'TWO_FACTOR_ERROR',
      message: 'Error generating 2FA code'
    });
  }
}

/**
 * Verify 2FA code and generate token
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export async function verify2FACodeHandler(req, res) {
  try {
    const { userId } = req;
    const { code } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required'
      });
    }
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: '2FA code is required'
      });
    }
    
    // Verify code
    const isValid = verify2FACode(userId, code);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CODE',
        message: 'Invalid or expired 2FA code'
      });
    }
    
    // Generate 2FA token
    const token = crypto.randomBytes(32).toString('hex');
    
    res.json({
      success: true,
      message: '2FA verification successful',
      twoFactorToken: token,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    });
  } catch (error) {
    console.error('Error verifying 2FA code:', error);
    res.status(500).json({
      success: false,
      error: 'TWO_FACTOR_ERROR',
      message: 'Error verifying 2FA code'
    });
  }
}