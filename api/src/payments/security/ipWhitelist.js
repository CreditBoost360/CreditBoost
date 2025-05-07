/**
 * Sunny Payment Gateway - IP Whitelist
 * 
 * Implements IP whitelisting for sensitive payment operations
 */

/**
 * IP whitelist middleware
 * Restricts access to sensitive operations to whitelisted IPs
 * 
 * @param {Object} options - Configuration options
 * @param {Array} options.whitelist - Array of allowed IP addresses
 * @param {boolean} options.allowLocalhost - Whether to allow localhost access
 * @returns {Function} Express middleware
 */
export function ipWhitelist(options = {}) {
  const defaultOptions = {
    whitelist: process.env.PAYMENT_IP_WHITELIST ? process.env.PAYMENT_IP_WHITELIST.split(',') : [],
    allowLocalhost: process.env.NODE_ENV !== 'production'
  };
  
  const config = { ...defaultOptions, ...options };
  
  return (req, res, next) => {
    const clientIp = req.ip || 
                     req.connection.remoteAddress || 
                     req.headers['x-forwarded-for']?.split(',')[0].trim();
    
    // Allow localhost in development
    if (config.allowLocalhost && (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === 'localhost')) {
      return next();
    }
    
    // Check if IP is in whitelist
    if (config.whitelist.includes(clientIp)) {
      return next();
    }
    
    // Log unauthorized access attempt
    console.warn(`Unauthorized access attempt from IP: ${clientIp}`);
    
    // Return 403 Forbidden
    return res.status(403).json({
      success: false,
      error: 'ACCESS_DENIED',
      message: 'Access denied: IP not whitelisted'
    });
  };
}

/**
 * Apply IP whitelist to admin routes
 * 
 * @param {Object} router - Express router
 * @param {Array} whitelist - Array of allowed IP addresses
 */
export function applyIpWhitelist(router, whitelist) {
  // Apply IP whitelist to admin routes
  router.use('/admin/*', ipWhitelist({ whitelist }));
  
  // Apply IP whitelist to sensitive operations
  router.use('/balance', ipWhitelist({ whitelist }));
  router.use('/stats', ipWhitelist({ whitelist }));
  
  return router;
}