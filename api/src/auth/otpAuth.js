import crypto from 'crypto';
import supabase from '../supabaseClient.js';
import { generateToken } from '../auth.js';
import { encryption } from '../encryption.js';
import { config } from '../config.js';
import { sendOtpEmail } from '../services/emailService.js';

/**
 * OTP Authentication Service
 * 
 * This module provides one-time password (OTP) authentication via SMS or email
 * using Supabase's phone auth capabilities and custom email OTP implementation.
 */

// OTP configuration
const OTP_CONFIG = {
  codeLength: 6,
  expiryMinutes: 10,
  maxAttempts: 3,
  cooldownMinutes: 1
};

// Store for OTP verification attempts (should use Redis in production)
const otpStore = new Map();

/**
 * Generate a random numeric OTP code
 * @param {number} length - Length of the OTP code
 * @returns {string} OTP code
 */
const generateOtpCode = (length = OTP_CONFIG.codeLength) => {
  // Generate a secure random number and format it as a fixed-length string
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const randomNum = Math.floor(
    crypto.randomInt(min, max + 1)
  );
  
  return randomNum.toString().padStart(length, '0');
};

/**
 * Send OTP via SMS using Supabase Phone Auth
 * @param {string} phoneNumber - Phone number in E.164 format
 * @returns {Object} Result of the operation
 */
export const sendSmsOtp = async (phoneNumber) => {
  try {
    // Validate phone number format (E.164)
    if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      throw new Error('Invalid phone number format. Please use E.164 format (e.g., +1234567890)');
    }
    
    // Check for rate limiting
    const phoneKey = `phone:${phoneNumber}`;
    const existingOtp = otpStore.get(phoneKey);
    
    if (existingOtp && Date.now() < existingOtp.cooldownUntil) {
      const waitSeconds = Math.ceil((existingOtp.cooldownUntil - Date.now()) / 1000);
      return {
        success: false,
        message: `Please wait ${waitSeconds} seconds before requesting another code`
      };
    }
    
    // Use Supabase Phone Auth
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber
    });
    
    if (error) throw error;
    
    // Store OTP metadata (not the code itself, as Supabase handles verification)
    otpStore.set(phoneKey, {
      timestamp: Date.now(),
      attempts: 0,
      cooldownUntil: Date.now() + (OTP_CONFIG.cooldownMinutes * 60 * 1000)
    });
    
    return {
      success: true,
      message: 'OTP sent successfully to your phone'
    };
  } catch (error) {
    console.error('SMS OTP sending error:', error);
    throw new Error('Failed to send verification code: ' + error.message);
  }
};

/**
 * Verify SMS OTP using Supabase Phone Auth
 * @param {string} phoneNumber - Phone number in E.164 format
 * @param {string} otp - OTP code to verify
 * @param {string} deviceFingerprint - Device fingerprint
 * @returns {Object} Authentication result with token and user data
 */
export const verifySmsOtp = async (phoneNumber, otp, deviceFingerprint) => {
  try {
    // Check for rate limiting and attempts
    const phoneKey = `phone:${phoneNumber}`;
    const otpData = otpStore.get(phoneKey);
    
    if (!otpData) {
      throw new Error('No OTP was requested for this phone number');
    }
    
    if (otpData.attempts >= OTP_CONFIG.maxAttempts) {
      throw new Error('Too many failed attempts. Please request a new code');
    }
    
    // Increment attempt counter
    otpData.attempts += 1;
    otpStore.set(phoneKey, otpData);
    
    // Verify OTP with Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: otp,
      type: 'sms'
    });
    
    if (error) throw error;
    
    // Clear OTP data after successful verification
    otpStore.delete(phoneKey);
    
    // Generate a compatible JWT token for our system
    const token = generateToken(data.user.id, deviceFingerprint);
    
    return {
      success: true,
      token,
      user: {
        id: data.user.id,
        phone: phoneNumber,
        emailVerified: false,
        phoneVerified: true,
        authProvider: 'phone',
        createdAt: data.user.created_at
      }
    };
  } catch (error) {
    console.error('SMS OTP verification error:', error);
    throw new Error('Failed to verify code: ' + error.message);
  }
};

/**
 * Send OTP via email
 * @param {string} email - Email address
 * @returns {Object} Result of the operation
 */
export const sendEmailOtp = async (email) => {
  try {
    // Validate email format
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Invalid email format');
    }
    
    // Check for rate limiting
    const emailKey = `email:${email}`;
    const existingOtp = otpStore.get(emailKey);
    
    if (existingOtp && Date.now() < existingOtp.cooldownUntil) {
      const waitSeconds = Math.ceil((existingOtp.cooldownUntil - Date.now()) / 1000);
      return {
        success: false,
        message: `Please wait ${waitSeconds} seconds before requesting another code`
      };
    }
    
    // Generate OTP code
    const otpCode = generateOtpCode();
    
    // Hash OTP for storage
    const hashedOtp = crypto
      .createHash('sha256')
      .update(otpCode + email)
      .digest('hex');
    
    // Store OTP data
    otpStore.set(emailKey, {
      hashedOtp,
      timestamp: Date.now(),
      expiresAt: Date.now() + (OTP_CONFIG.expiryMinutes * 60 * 1000),
      attempts: 0,
      cooldownUntil: Date.now() + (OTP_CONFIG.cooldownMinutes * 60 * 1000)
    });
    
    // Send OTP via our custom email service with CreditBoost logo
    await sendOtpEmail(email, otpCode);
    
    // Also register with Supabase for account creation if needed
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${config.api.url}/auth/verify-email`,
        data: {
          otp: otpCode
        }
      }
    });
    
    if (error) throw error;
    
    return {
      success: true,
      message: 'Verification code sent to your email'
    };
  } catch (error) {
    console.error('Email OTP sending error:', error);
    throw new Error('Failed to send verification code: ' + error.message);
  }
};

/**
 * Verify email OTP
 * @param {string} email - Email address
 * @param {string} otp - OTP code to verify
 * @param {string} deviceFingerprint - Device fingerprint
 * @returns {Object} Authentication result with token and user data
 */
export const verifyEmailOtp = async (email, otp, deviceFingerprint) => {
  try {
    // Check for OTP data
    const emailKey = `email:${email}`;
    const otpData = otpStore.get(emailKey);
    
    if (!otpData) {
      throw new Error('No verification code was requested for this email');
    }
    
    // Check expiry
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(emailKey);
      throw new Error('Verification code has expired. Please request a new one');
    }
    
    // Check attempts
    if (otpData.attempts >= OTP_CONFIG.maxAttempts) {
      otpStore.delete(emailKey);
      throw new Error('Too many failed attempts. Please request a new code');
    }
    
    // Increment attempt counter
    otpData.attempts += 1;
    otpStore.set(emailKey, otpData);
    
    // Verify OTP
    const hashedInput = crypto
      .createHash('sha256')
      .update(otp + email)
      .digest('hex');
    
    if (hashedInput !== otpData.hashedOtp) {
      throw new Error('Invalid verification code');
    }
    
    // Clear OTP data after successful verification
    otpStore.delete(emailKey);
    
    // Check if user exists in Supabase
    const { data: userData, error: userError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true
      }
    });
    
    if (userError) throw userError;
    
    // Generate a compatible JWT token for our system
    const token = generateToken(userData.user.id, deviceFingerprint);
    
    return {
      success: true,
      token,
      user: {
        id: userData.user.id,
        email,
        emailVerified: true,
        authProvider: 'email',
        createdAt: userData.user.created_at
      }
    };
  } catch (error) {
    console.error('Email OTP verification error:', error);
    throw new Error('Failed to verify code: ' + error.message);
  }
};