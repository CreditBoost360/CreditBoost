/**
 * Enhanced CORS Middleware for CreditBoost
 * 
 * Provides more flexible and secure CORS handling
 */

import cors from 'cors';
import { config } from '../config.js';

// Get allowed origins from config or environment variables
const getAllowedOrigins = () => {
  const configOrigins = config.allowedOrigins || [];
  const envOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
  
  // Combine and deduplicate origins
  return [...new Set([
    'http://localhost:5173',  // Frontend dev server
    'http://localhost:3000',  // Local API server
    'https://credvault.co.ke', // Production frontend
    ...configOrigins,
    ...envOrigins
  ])];
};

// Create dynamic CORS configuration
export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps, curl, etc)
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

// Create CORS middleware
export const corsMiddleware = cors(corsOptions);

// Create preflight handler for all routes
export const corsPreflightHandler = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();
  
  if (req.method === 'OPTIONS') {
    // Handle preflight requests
    if (!origin || allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', corsOptions.maxAge);
      return res.status(204).end();
    }
    
    return res.status(403).json({ error: 'CORS not allowed for this origin' });
  }
  
  next();
};

export default {
  corsMiddleware,
  corsPreflightHandler,
  corsOptions
};