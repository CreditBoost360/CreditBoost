/**
 * Sunny Payment Gateway - Rate Limiter
 * 
 * Implements rate limiting for payment endpoints to prevent abuse
 */

import rateLimit from 'express-rate-limit';
import { ERROR_CODES } from '../constants.js';

/**
 * Standard rate limiter for payment API endpoints
 */
export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    message: 'Too many requests, please try again later'
  },
  keyGenerator: (req) => {
    // Use IP and user ID if available for more precise rate limiting
    return req.userId 
      ? `${req.ip}-${req.userId}` 
      : req.ip;
  }
});

/**
 * Strict rate limiter for sensitive payment operations
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    message: 'Rate limit exceeded for sensitive operations'
  },
  keyGenerator: (req) => {
    return req.userId 
      ? `${req.ip}-${req.userId}` 
      : req.ip;
  }
});

/**
 * Very strict rate limiter for authentication failures
 * Helps prevent brute force attacks
 */
export const authFailureLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 failed attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
  message: {
    success: false,
    error: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    message: 'Too many failed attempts, please try again later'
  }
});

/**
 * IP-based rate limiter for public endpoints
 */
export const ipLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 requests per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    message: 'Too many requests from this IP address'
  }
});

/**
 * Apply appropriate rate limiters to payment routes
 * 
 * @param {Object} router - Express router
 */
export function applyRateLimiters(router) {
  // Apply standard limiter to all payment routes by default
  router.use(standardLimiter);
  
  // Apply strict limiter to sensitive operations
  router.use('/process', strictLimiter);
  router.use('/:transactionId/refund', strictLimiter);
  
  // Apply auth failure limiter to token endpoint
  router.use('/token', authFailureLimiter);
  
  // Apply IP limiter to public endpoints
  router.use('/methods', ipLimiter);
  
  return router;
}