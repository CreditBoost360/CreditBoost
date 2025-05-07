import { encryption } from '../encryption.js';
import { AuthenticationError } from '../errorHandler.js';
import crypto from 'crypto';

// CSRF Token configuration
const CSRF_CONFIG = {
  tokenLength: 32,
  cookieName: 'XSRF-TOKEN',
  headerName: 'X-XSRF-TOKEN',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  },
  expiryMinutes: 60,
  rotationInterval: 3600000 // Default: 1 hour
};

// Generate CSRF token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Validate token expiry
const isTokenExpired = (timestamp) => {
  const expiryTime = new Date(timestamp).getTime() + (CSRF_CONFIG.expiryMinutes * 60 * 1000);
  return Date.now() > expiryTime;
};

// CSRF Protection middleware
export const csrfProtection = (req, res, next) => {
  // Skip CSRF check for non-mutating methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const clientToken = req.headers['x-csrf-token'];
  const serverToken = req.session?.csrfToken;

  if (!clientToken || !serverToken || clientToken !== serverToken) {
    return res.status(403).json({ 
      error: 'Invalid CSRF token',
      message: 'CSRF token validation failed'
    });
  }

  next();
};

// Initialize CSRF protection
export const initializeCsrf = () => {
  return async (req, res, next) => {
    try {
      await refreshToken(res);
      next();
    } catch (error) {
      next(error);
    }
  }
};

// Refresh CSRF token
const refreshToken = async (res) => {
  const newToken = generateToken();
  const tokenPackage = {
    token: newToken,
    timestamp: new Date().toISOString()
  };

  // Encrypt token package
  const encryptedToken = await encryption.encrypt(JSON.stringify(tokenPackage));

  // Set cookie with token
  res.cookie(CSRF_CONFIG.cookieName, encryptedToken, CSRF_CONFIG.cookieOptions);

  // Set token in response header for client
  res.setHeader(CSRF_CONFIG.headerName, newToken);
};

// Configuration for client-side usage
const csrfConfig = {
  headerName: CSRF_CONFIG.headerName,
  cookieName: CSRF_CONFIG.cookieName
};

export const csrfTokenGenerator = (req, res, next) => {
  // Generate a new token if one doesn't exist
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateToken();
  }
  
  // Add CSRF token to response headers for client-side access
  res.setHeader('X-CSRF-Token', req.session.csrfToken);
  
  // Register session for token rotation if it has a session ID
  if (req.session.id) {
    tokenRotationService.registerSession(req.session.id, req, res);
    
    // Clean up on response finish
    res.on('finish', () => {
      // Keep the session registered for future requests
      // but remove the response object reference
      if (tokenRotationService.sessions.has(req.session.id)) {
        const session = tokenRotationService.sessions.get(req.session.id);
        session.res = null;
      }
    });
  }
  
  next();
};

// Token rotation service
const tokenRotationService = {
  // Store for active sessions that need token rotation
  sessions: new Map(),
  
  // Register a session for token rotation
  registerSession(sessionId, req, res) {
    this.sessions.set(sessionId, { req, res });
  },
  
  // Remove a session from rotation
  removeSession(sessionId) {
    this.sessions.delete(sessionId);
  },
  
  // Rotate tokens for all registered sessions
  rotateAllTokens() {
    this.sessions.forEach((session, sessionId) => {
      try {
        if (session.req && session.req.session) {
          const newToken = generateToken();
          session.req.session.csrfToken = newToken;
          
          // If response object is available, update headers
          if (session.res) {
            session.res.setHeader('X-CSRF-Token', newToken);
          }
        }
      } catch (error) {
        console.error(`Failed to rotate token for session ${sessionId}:`, error);
        // Remove problematic session
        this.sessions.delete(sessionId);
      }
    });
  },
  
  // Start the rotation interval
  startRotation() {
    setInterval(() => {
      this.rotateAllTokens();
    }, CSRF_CONFIG.rotationInterval || 3600000); // Default: 1 hour
  }
};

// Start token rotation service
tokenRotationService.startRotation();

export {
  tokenRotationService,
  csrfConfig
};