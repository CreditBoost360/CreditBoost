/**
 * Sunny Payment Gateway - API Versioning
 * 
 * Implements API versioning for the payment gateway
 */

import express from 'express';
import paymentRoutesV1 from './routes.js';

/**
 * Create versioned API router
 * 
 * @returns {Object} Express router
 */
export function createVersionedRouter() {
  const router = express.Router();
  
  // Mount v1 routes
  router.use('/v1', paymentRoutesV1);
  
  // Default to latest version
  router.use('/', paymentRoutesV1);
  
  return router;
}

/**
 * API version middleware
 * Adds version information to response headers
 * 
 * @returns {Function} Express middleware
 */
export function apiVersionMiddleware() {
  return (req, res, next) => {
    // Add API version headers
    res.setHeader('X-API-Version', '1.0.0');
    res.setHeader('X-API-Deprecated', 'false');
    
    next();
  };
}

/**
 * Get API version information
 * 
 * @returns {Object} Version information
 */
export function getApiVersionInfo() {
  return {
    current: '1.0.0',
    latest: '1.0.0',
    supported: ['1.0.0'],
    deprecated: []
  };
}