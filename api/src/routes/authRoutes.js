import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticateWithSupabase, createSupabaseUser } from '../auth/supabaseAuth.js';
import { getGoogleAuthUrl, handleGoogleCallback, verifyGoogleIdToken } from '../auth/googleAuth.js';
import { sendSmsOtp, verifySmsOtp, sendEmailOtp, verifyEmailOtp } from '../auth/otpAuth.js';
import { authenticateToken, blacklistToken } from '../auth.js';
import { config } from '../config.js';
import supabase from '../supabaseClient.js';

const router = express.Router();

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Email and password are required'
      });
    }
    
    const result = await createSupabaseUser({ email, password, fullName, phone });
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific error cases
    if (error.message.includes('already registered')) {
      return res.status(409).json({
        error: 'Registration failed',
        message: 'This email is already registered'
      });
    }
    
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

/**
 * @route POST /auth/login
 * @desc Login with email and password
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const deviceFingerprint = req.headers['x-device-fingerprint'];
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }
    
    const result = await authenticateWithSupabase(email, password, deviceFingerprint);
    
    res.json({
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific error cases
    if (error.message.includes('Invalid login credentials')) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }
    
    res.status(500).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
});

/**
 * @route GET /auth/google
 * @desc Get Google OAuth URL
 * @access Public
 */
router.get('/google', async (req, res) => {
  try {
    const redirectUrl = req.query.redirectUrl || `${config.api.url}/auth/callback/google`;
    const url = await getGoogleAuthUrl(redirectUrl);
    
    res.json({
      url
    });
  } catch (error) {
    console.error('Google auth URL error:', error);
    res.status(500).json({
      error: 'Failed to generate Google authentication URL',
      message: error.message
    });
  }
});

/**
 * @route GET /auth/callback/google
 * @desc Handle Google OAuth callback
 * @access Public
 */
router.get('/callback/google', async (req, res) => {
  try {
    const { code } = req.query;
    const deviceFingerprint = req.headers['x-device-fingerprint'];
    
    if (!code) {
      return res.status(400).json({
        error: 'Invalid callback',
        message: 'No authorization code provided'
      });
    }
    
    const result = await handleGoogleCallback(code, deviceFingerprint);
    
    // Redirect to frontend with token
    // Use configured frontend URL instead of string replacement
    const frontendUrl = config.frontendUrl || process.env.FRONTEND_URL || 'https://app.creditboost.co.ke';
    res.redirect(`${frontendUrl}/auth/callback?token=${result.token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.status(500).json({
      error: 'Google authentication failed',
      message: error.message
    });
  }
});

/**
 * @route POST /auth/google/verify
 * @desc Verify Google ID token
 * @access Public
 */
router.post('/google/verify', async (req, res) => {
  try {
    const { idToken } = req.body;
    const deviceFingerprint = req.headers['x-device-fingerprint'];
    
    if (!idToken) {
      return res.status(400).json({
        error: 'Missing token',
        message: 'ID token is required'
      });
    }
    
    const result = await verifyGoogleIdToken(idToken, deviceFingerprint);
    
    res.json({
      message: 'Google authentication successful',
      ...result
    });
  } catch (error) {
    console.error('Google ID token verification error:', error);
    res.status(401).json({
      error: 'Google authentication failed',
      message: error.message
    });
  }
});

/**
 * @route POST /auth/otp/sms/send
 * @desc Send OTP via SMS
 * @access Public
 */
router.post('/otp/sms/send', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        error: 'Missing phone number',
        message: 'Phone number is required'
      });
    }
    
    const result = await sendSmsOtp(phoneNumber);
    
    res.json(result);
  } catch (error) {
    console.error('SMS OTP sending error:', error);
    res.status(500).json({
      error: 'Failed to send verification code',
      message: error.message
    });
  }
});

/**
 * @route POST /auth/otp/sms/verify
 * @desc Verify SMS OTP
 * @access Public
 */
router.post('/otp/sms/verify', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const deviceFingerprint = req.headers['x-device-fingerprint'];
    
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Phone number and verification code are required'
      });
    }
    
    const result = await verifySmsOtp(phoneNumber, otp, deviceFingerprint);
    
    res.json({
      message: 'Phone verification successful',
      ...result
    });
  } catch (error) {
    console.error('SMS OTP verification error:', error);
    res.status(401).json({
      error: 'Verification failed',
      message: error.message
    });
  }
});

/**
 * @route POST /auth/otp/email/send
 * @desc Send OTP via email
 * @access Public
 */
router.post('/otp/email/send', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email is required'
      });
    }
    
    const result = await sendEmailOtp(email);
    
    res.json(result);
  } catch (error) {
    console.error('Email OTP sending error:', error);
    res.status(500).json({
      error: 'Failed to send verification code',
      message: error.message
    });
  }
});

/**
 * @route POST /auth/otp/email/verify
 * @desc Verify email OTP
 * @access Public
 */
router.post('/otp/email/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const deviceFingerprint = req.headers['x-device-fingerprint'];
    
    if (!email || !otp) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and verification code are required'
      });
    }
    
    const result = await verifyEmailOtp(email, otp, deviceFingerprint);
    
    res.json({
      message: 'Email verification successful',
      ...result
    });
  } catch (error) {
    console.error('Email OTP verification error:', error);
    res.status(401).json({
      error: 'Verification failed',
      message: error.message
    });
  }
});

/**
 * @route GET /auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // User ID is attached by authenticateToken middleware
    const userId = req.userId;
    
    // Get user data from Supabase
    const { data: userData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    res.json({
      user: userData
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      error: 'Failed to get user profile',
      message: error.message
    });
  }
});

/**
 * @route POST /auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Get the token from the request
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    
    if (token) {
      // Get the token payload to extract the jti (token ID)
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { complete: true });
      
      if (decoded && decoded.payload && decoded.payload.jti) {
        // Calculate token expiry time from the exp claim
        const expiryTime = decoded.payload.exp ? 
          (decoded.payload.exp - Math.floor(Date.now() / 1000)) : 
          86400; // Default to 24 hours if exp not available
        
        // Add the token to the blacklist
        blacklistToken(decoded.payload.jti, expiryTime);
      }
    }
    
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: error.message
    });
  }
});

export default router;