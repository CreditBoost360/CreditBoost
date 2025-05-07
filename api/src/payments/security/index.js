/**
 * Sunny Payment Gateway - Security Module
 * 
 * Exports all security components
 */

import * as rateLimiter from './rateLimiter.js';
import * as ipWhitelist from './ipWhitelist.js';
import * as twoFactorAuth from './twoFactorAuth.js';
import * as auditLogger from './auditLogger.js';
import * as keyRotation from './keyRotation.js';
import * as pciCompliance from './pciCompliance.js';
import * as AirGapSecurity from './AirGapSecurity.js';

export {
  rateLimiter,
  ipWhitelist,
  twoFactorAuth,
  auditLogger,
  keyRotation,
  pciCompliance,
  AirGapSecurity
};

/**
 * Apply all security enhancements to a router
 * 
 * @param {Object} router - Express router
 * @param {Object} options - Configuration options
 * @returns {Object} Enhanced router
 */
export function applySecurityEnhancements(router, options = {}) {
  // Apply rate limiting
  rateLimiter.applyRateLimiters(router);
  
  // Apply IP whitelisting if configured
  if (options.ipWhitelist) {
    ipWhitelist.applyIpWhitelist(router, options.ipWhitelist);
  }
  
  // Apply audit logging middleware
  router.use(auditLogger.auditLogMiddleware());
  
  // Apply PCI compliance middleware
  router.use(pciCompliance.pciComplianceMiddleware());
  
  // Add 2FA routes
  router.post('/2fa/request', twoFactorAuth.request2FACode);
  router.post('/2fa/verify', twoFactorAuth.verify2FACodeHandler);
  
  // Apply 2FA to sensitive routes if configured
  if (options.require2FA) {
    const sensitiveRoutes = options.sensitiveRoutes || [
      '/admin',
      '/balance',
      '/stats'
    ];
    
    sensitiveRoutes.forEach(route => {
      router.use(route, twoFactorAuth.require2FA);
    });
  }
  
  // Schedule key rotation if configured
  if (options.keyRotation) {
    const rotationInterval = options.keyRotationInterval || 90; // 90 days
    keyRotation.scheduleKeyRotation(rotationInterval);
  }
  
  return router;
}

/**
 * Initialize all security components
 * 
 * @returns {Promise<void>}
 */
export async function initializeSecurity() {
  try {
    // Initialize air-gap security
    await AirGapSecurity.initializeAirGapSecurity();
    
    console.log('Security components initialized');
  } catch (error) {
    console.error('Failed to initialize security components:', error);
    throw error;
  }
}