/**
 * Security Module for CreditBoost
 * 
 * Exports all security components and provides initialization
 */

import { keyManagementService } from './keyManagement.js';
import { securityHeaders, httpsRedirect, cacheControl } from './securityHeaders.js';
import { dependencyValidator } from './dependencyValidator.js';
import { csrfProtection, csrfTokenGenerator } from '../middleware/csrfProtection.js';
import { xssProtection } from '../middleware/xssProtection.js';

// Export all security components
export {
  keyManagementService,
  securityHeaders,
  httpsRedirect,
  cacheControl,
  dependencyValidator,
  csrfProtection,
  csrfTokenGenerator,
  xssProtection
};

/**
 * Apply comprehensive security middleware to an Express app
 * 
 * @param {Object} app - Express application
 * @param {Object} options - Configuration options
 * @returns {Object} Enhanced Express application
 */
export const applySecurityMiddleware = (app, options = {}) => {
  // Apply HTTPS redirection in production
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    app.use(httpsRedirect());
  }
  
  // Apply security headers
  app.use(securityHeaders(options.headers));
  
  // Apply cache control
  app.use(cacheControl(options.cache));
  
  // Apply XSS protection
  app.use(xssProtection(options.xss));
  
  // Apply CSRF protection for non-API routes
  if (!options.skipCsrf) {
    app.use((req, res, next) => {
      // Skip CSRF for API routes if configured
      if (options.csrfExcludePaths && options.csrfExcludePaths.some(path => req.path.startsWith(path))) {
        return next();
      }
      
      // Generate CSRF token
      csrfTokenGenerator(req, res, next);
    });
    
    app.use((req, res, next) => {
      // Skip CSRF for API routes if configured
      if (options.csrfExcludePaths && options.csrfExcludePaths.some(path => req.path.startsWith(path))) {
        return next();
      }
      
      // Apply CSRF protection
      csrfProtection(req, res, next);
    });
  }
  
  return app;
};

/**
 * Initialize all security components
 * 
 * @returns {Promise<boolean>} Success status
 */
export const initializeSecurity = async () => {
  try {
    console.log('Initializing security components...');
    
    // Initialize key management service
    await keyManagementService.initialize();
    
    // Initialize dependency validator
    await dependencyValidator.initialize();
    
    console.log('All security components initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize security components:', error);
    return false;
  }
};

export default {
  applySecurityMiddleware,
  initializeSecurity
};