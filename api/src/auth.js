import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

// Security configuration
if (!process.env.JWT_SECRET) {
  console.error("CRITICAL SECURITY ERROR: JWT_SECRET environment variable is not set!");
  throw new Error("JWT_SECRET must be set in environment variables");
}

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 14; // Increased from 12 for better security
const JWT_EXPIRY = "8h"; // Reduced from 12h for better security
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
const TOKEN_ISSUER = process.env.TOKEN_ISSUER || 'credvault.co.ke';

// Enhanced security with IP tracking and device fingerprinting
const loginAttempts = new Map();
const suspiciousIPs = new Map();
const knownDevices = new Map();

export const generateToken = (userId, deviceFingerprint) => {
  // Generate a unique token ID with high entropy
  const tokenId = crypto.randomBytes(32).toString('hex');
  
  return jwt.sign({ 
    userId,
    iat: Math.floor(Date.now() / 1000),
    deviceFingerprint,
    iss: TOKEN_ISSUER,
    sub: String(userId),
    jti: tokenId,
    // Add additional claims for security
    aud: 'api.creditboost.app',
    nbf: Math.floor(Date.now() / 1000) // Not valid before current time
  }, JWT_SECRET, { 
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS512' // Using a stronger algorithm
  });
};

export const verifyToken = (token, deviceFingerprint) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS512'],
      issuer: TOKEN_ISSUER,
      audience: 'api.creditboost.app',
      complete: true // Get full decoded token including header
    });
    
    // Verify token header algorithm matches expected algorithm
    if (decoded.header.alg !== 'HS512') {
      console.warn('Token algorithm mismatch:', decoded.header.alg);
      return null;
    }
    
    // Verify device fingerprint if provided
    if (deviceFingerprint && decoded.payload.deviceFingerprint !== deviceFingerprint) {
      console.warn('Device fingerprint mismatch for user:', decoded.payload.userId);
      return null;
    }
    
    // Check for token reuse (implement with a token blacklist in production)
    // This is a placeholder for the actual implementation
    if (isTokenBlacklisted(decoded.payload.jti)) {
      console.warn('Attempted use of blacklisted token for user:', decoded.payload.userId);
      return null;
    }
    
    return decoded.payload;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

// Token blacklist check using a simple in-memory Map for now
// In production, this should be replaced with Redis or a database
const tokenBlacklist = new Map();

const isTokenBlacklisted = (tokenId) => {
  if (!tokenId) return false;
  return tokenBlacklist.has(tokenId);
};

// Function to add a token to the blacklist with an expiry time
export const blacklistToken = (tokenId, expiryInSeconds = 86400) => {
  if (!tokenId) return;
  
  // Store the token with its expiry time
  tokenBlacklist.set(tokenId, Date.now() + (expiryInSeconds * 1000));
  
  // Schedule cleanup of expired tokens every hour
  if (!global.tokenCleanupInterval) {
    global.tokenCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [token, expiry] of tokenBlacklist.entries()) {
        if (now >= expiry) {
          tokenBlacklist.delete(token);
        }
      }
    }, 3600000); // 1 hour
  }
};

export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// Enhanced login attempt tracking with IP
export const checkLoginAttempts = (userId, ip) => {
  const userAttempts = loginAttempts.get(userId) || { count: 0, timestamp: Date.now(), ips: new Set() };
  const ipAttempts = suspiciousIPs.get(ip) || { count: 0, timestamp: Date.now() };
  
  // Reset attempts if timeout has passed
  if (Date.now() - userAttempts.timestamp >= LOGIN_TIMEOUT) {
    loginAttempts.delete(userId);
    return true;
  }
  
  // Block if max attempts reached
  if (userAttempts.count >= MAX_LOGIN_ATTEMPTS) {
    userAttempts.ips.add(ip);
    suspiciousIPs.set(ip, { ...ipAttempts, count: ipAttempts.count + 1 });
    return false;
  }
  
  return true;
};

export const incrementLoginAttempts = (userId, ip) => {
  const userAttempts = loginAttempts.get(userId) || { count: 0, timestamp: Date.now(), ips: new Set() };
  userAttempts.count++;
  userAttempts.timestamp = Date.now();
  userAttempts.ips.add(ip);
  loginAttempts.set(userId, userAttempts);
  
  // Track suspicious IP
  const ipAttempts = suspiciousIPs.get(ip) || { count: 0, timestamp: Date.now() };
  ipAttempts.count++;
  suspiciousIPs.set(ip, ipAttempts);
};

export const resetLoginAttempts = (userId) => {
  loginAttempts.delete(userId);
};

// Enhanced authentication middleware with additional security checks
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const deviceFingerprint = req.headers["x-device-fingerprint"];

    if (!token) {
      return res.status(401).json({ 
        error: "Authentication required",
        message: "No token provided"
      });
    }

    const decoded = verifyToken(token, deviceFingerprint);
    if (!decoded) {
      return res.status(403).json({ 
        error: "Invalid token",
        message: "Token validation failed"
      });
    }

    // Add token expiration validation
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        error: "Token expired",
        message: "Please log in again."
      });
    }

    // Check token expiration with some buffer time (5 minutes)
    const bufferTime = 5 * 60; // 5 minutes in seconds
    const timeToExpiry = decoded.exp - Math.floor(Date.now() / 1000);
    
    if (timeToExpiry <= bufferTime) {
      // Set header to inform client to refresh token
      res.set('X-Token-Expiring', 'true');
    }

    // Add rate limiting per user
    // Using a simple in-memory rate limiting implementation
    const userKey = `rate_limit_${decoded.userId}`;
    
    // Initialize rate limiting storage if not exists
    if (!global.rateLimitStore) {
      global.rateLimitStore = new Map();
    }
    
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 100; // Max 100 requests per minute
    
    // Get or initialize user's request record
    const userRecord = global.rateLimitStore.get(userKey) || { 
      count: 0, 
      resetAt: now + windowMs 
    };
    
    // Reset counter if the time window has passed
    if (now > userRecord.resetAt) {
      userRecord.count = 0;
      userRecord.resetAt = now + windowMs;
    }
    
    // Increment request count
    userRecord.count++;
    global.rateLimitStore.set(userKey, userRecord);
    
    // Check if rate limit exceeded
    if (userRecord.count > maxRequests) {
      return res.status(429).json({
        error: "Too many requests",
        message: "Please try again later"
      });
    }

    // Set userId in request
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: "Authentication failed",
      message: "An error occurred during authentication"
    });
  }
};

// Import Supabase client
import supabase from './supabaseClient.js';

// Optional middleware to attach full user data when needed
export const attachUserData = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get user data from Supabase
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.userId)
      .single();
    
    if (error) {
      console.error('Error fetching user data:', error);
      return res.status(500).json({ error: "Failed to fetch user data" });
    }
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Attach user data excluding sensitive fields
    const { password, ...userData } = user;
    req.user = userData;

    next();
  } catch (error) {
    console.error('Error attaching user data:', error);
    res.status(500).json({ error: "Server error" });
  }
};

