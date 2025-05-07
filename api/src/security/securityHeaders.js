/**
 * Enhanced Security Headers for CreditBoost
 * 
 * Implements best practices for HTTP security headers
 */

// Security header configuration
const SECURITY_HEADERS = {
  // Prevent browsers from interpreting files as a different MIME type
  'X-Content-Type-Options': 'nosniff',
  
  // Enable browser XSS filtering
  'X-XSS-Protection': '1; mode=block',
  
  // Control how much information the browser includes with referrers
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',
  
  // Restrict browser features
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), accelerometer=(), gyroscope=()',
  
  // Prevent MIME type sniffing
  'X-Download-Options': 'noopen',
  
  // Control cross-origin resource sharing
  'Cross-Origin-Resource-Policy': 'same-origin',
  
  // Control cross-origin opener policy
  'Cross-Origin-Opener-Policy': 'same-origin',
  
  // Control cross-origin embedder policy
  'Cross-Origin-Embedder-Policy': 'require-corp'
};

// Content Security Policy configuration
const getContentSecurityPolicy = (options = {}) => {
  const apiUrl = options.apiUrl || process.env.API_URL || 'https://api.creditboost.app';
  
  return {
    'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' ${options.allowScripts || ''};
      style-src 'self' ${options.allowStyles || ''};
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' ${apiUrl};
      frame-ancestors 'none';
      form-action 'self';
      base-uri 'self';
      object-src 'none';
      upgrade-insecure-requests;
    `.replace(/\s+/g, ' ').trim()
  };
};

/**
 * Apply security headers middleware
 * 
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware
 */
export const securityHeaders = (options = {}) => {
  // Merge default headers with CSP and any custom headers
  const headers = {
    ...SECURITY_HEADERS,
    ...getContentSecurityPolicy(options),
    ...(options.customHeaders || {})
  };
  
  return (req, res, next) => {
    // Apply all security headers
    Object.entries(headers).forEach(([header, value]) => {
      res.setHeader(header, value);
    });
    
    // Remove headers that might expose server information
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    
    next();
  };
};

/**
 * Apply HTTPS redirection middleware
 * 
 * @returns {Function} Express middleware
 */
export const httpsRedirect = () => {
  return (req, res, next) => {
    // Skip for development environment
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }
    
    // Skip if already HTTPS
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      return next();
    }
    
    // Redirect to HTTPS
    const httpsUrl = `https://${req.headers.host}${req.url}`;
    res.redirect(301, httpsUrl);
  };
};

/**
 * Apply cache control headers
 * 
 * @param {Object} options - Cache control options
 * @returns {Function} Express middleware
 */
export const cacheControl = (options = {}) => {
  const defaultOptions = {
    noStore: true, // Default to no-store for security
    maxAge: 0,
    private: true
  };
  
  const settings = { ...defaultOptions, ...options };
  
  return (req, res, next) => {
    // Skip for specific paths if configured
    if (settings.skipPaths && settings.skipPaths.some(path => req.path.startsWith(path))) {
      return next();
    }
    
    // Build cache control header
    let cacheHeader = '';
    
    if (settings.noStore) {
      cacheHeader = 'no-store, no-cache, must-revalidate, proxy-revalidate';
    } else {
      cacheHeader = settings.private ? 'private' : 'public';
      
      if (settings.maxAge !== undefined) {
        cacheHeader += `, max-age=${settings.maxAge}`;
      }
      
      if (settings.sMaxAge !== undefined) {
        cacheHeader += `, s-maxage=${settings.sMaxAge}`;
      }
      
      if (settings.noTransform) {
        cacheHeader += ', no-transform';
      }
    }
    
    // Set cache control header
    res.setHeader('Cache-Control', cacheHeader);
    
    // Set additional cache headers
    res.setHeader('Pragma', settings.noStore ? 'no-cache' : 'cache');
    res.setHeader('Expires', settings.noStore ? '0' : settings.expires || '0');
    
    next();
  };
};

export default {
  securityHeaders,
  httpsRedirect,
  cacheControl
};