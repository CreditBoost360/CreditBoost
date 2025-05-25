/**
 * CORS Configuration for CreditBoost API
 * 
 * Provides centralized CORS configuration
 */

import { config } from '../config.js';

/**
 * Get allowed origins from configuration
 * 
 * @returns {Array} List of allowed origins
 */
export const getAllowedOrigins = () => {
  return config.allowedOrigins || [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://credvault.co.ke'
  ];
};

/**
 * Create CORS options object
 * 
 * @returns {Object} CORS configuration options
 */
export const getCorsOptions = () => {
  return {
    origin: (origin, callback) => {
      const allowedOrigins = getAllowedOrigins();
      
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('CORS policy: Origin not allowed'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-CSRF-Token', 
      'X-Device-Fingerprint', 
      'X-Nonce', 
      'X-Timestamp', 
      'X-Requested-With'
    ],
    exposedHeaders: ['X-Token-Expiring', 'X-Timestamp'],
    credentials: true,
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
  };
};

/**
 * Create CORS preflight handler
 * 
 * @returns {Function} Express middleware for handling OPTIONS requests
 */
export const createCorsPreflightHandler = () => {
  return (req, res, next) => {
    if (req.method !== 'OPTIONS') {
      return next();
    }
    
    const origin = req.headers.origin;
    const allowedOrigins = getAllowedOrigins();
    
    if (!origin || allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 
        'Content-Type, Authorization, X-CSRF-Token, X-Device-Fingerprint, X-Nonce, X-Timestamp, X-Requested-With');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', '86400');
      return res.status(204).end();
    }
    
    return res.status(403).json({ error: 'CORS not allowed for this origin' });
  };
};

export default {
  getAllowedOrigins,
  getCorsOptions,
  createCorsPreflightHandler
};