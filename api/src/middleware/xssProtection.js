import { ValidationError } from '../errorHandler.js';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// XSS filtering options
const xssOptions = {
  whiteList: {}, // Disable all tags by default
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style', 'xml'],
  css: false,
  enableValidation: true
};

// Recursive object sanitization
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitizedObj = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitizedObj[key] = DOMPurify.sanitize(value, {
        ALLOWED_TAGS: [], // Strip all HTML tags
        ALLOWED_ATTR: [], // Strip all attributes
        SANITIZE_DOM: true,
        KEEP_CONTENT: true
      });
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitizedObj[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitizedObj[key] = value.map(item => 
        typeof item === 'string' 
          ? DOMPurify.sanitize(item, {
              ALLOWED_TAGS: [],
              ALLOWED_ATTR: [],
              SANITIZE_DOM: true,
              KEEP_CONTENT: true
            })
          : item && typeof item === 'object'
            ? sanitizeObject(item)
            : item
      );
    } else {
      sanitizedObj[key] = value;
    }
  }

  return sanitizedObj;
};

// XSS Protection middleware
export const xssProtection = (options = {}) => {
  const skipPaths = options.skipPaths || [];
  const skipFields = options.skipFields || [];

  return (req, res, next) => {
    try {
      // Skip XSS protection for specific paths
      if (skipPaths.some(path => req.path.startsWith(path))) {
        return next();
      }

      // Sanitize query parameters
      if (req.query) {
        req.query = sanitizeObject(req.query);
      }

      // Sanitize body data
      if (req.body) {
        const sanitizedBody = { ...req.body };
        
        // Skip specific fields
        for (const [key, value] of Object.entries(req.body)) {
          if (skipFields.includes(key)) {
            sanitizedBody[key] = value;
          } else {
            sanitizedBody[key] = sanitizeObject(value);
          }
        }
        
        req.body = sanitizedBody;
      }

      // Sanitize URL parameters
      if (req.params) {
        req.params = sanitizeObject(req.params);
      }

      // Sanitize headers (except specific ones)
      const skipHeaders = ['content-type', 'authorization', 'user-agent'];
      if (req.headers) {
        for (const [header, value] of Object.entries(req.headers)) {
          if (!skipHeaders.includes(header.toLowerCase()) && typeof value === 'string') {
            req.headers[header] = DOMPurify.sanitize(value);
          }
        }
      }

      // Set security headers
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Content-Security-Policy', `
        default-src 'self';
        script-src 'self';
        style-src 'self';
        img-src 'self' data: https:;
        font-src 'self';
        connect-src 'self' ${process.env.API_URL || 'https://api.creditboost.app'};
        frame-ancestors 'none';
        form-action 'self';
        base-uri 'self';
        object-src 'none';
      `.replace(/\s+/g, ' ').trim());
      
      // Add additional security headers
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

      // Response sanitization
      const originalJson = res.json;
      res.json = function (body) {
        if (body) {
          body = sanitizeObject(body);
        }
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      next(new ValidationError('XSS attempt detected', {
        message: error.message,
        path: req.path,
        method: req.method
      }));
    }
  };
};

// URL sanitization utility
export const sanitizeUrl = (url) => {
  if (!url) return url;

  try {
    const parsed = new URL(url);
    // Only allow specific protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    return parsed.toString();
  } catch (error) {
    throw new ValidationError('Invalid URL format');
  }
};

// Script content detection
export const detectScriptContent = (content) => {
  if (typeof content !== 'string') return false;
  
  const scriptPatterns = [
    /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:\s*text\/html/gi,
    /expression\s*\(/gi
  ];

  return scriptPatterns.some(pattern => pattern.test(content));
};

// Safe HTML template utility
export const createSafeHtml = (template, data) => {
  // Replace variables in template with sanitized values
  return template.replace(/\${(\w+)}/g, (match, key) => {
    if (data.hasOwnProperty(key)) {
      return DOMPurify.sanitize(String(data[key]));
    }
    return '';
  });
};

// Additional protection against common XSS vectors
export const validateInput = (input) => {
  if (typeof input !== 'string') return input;

  // List of potentially dangerous patterns
  const XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /onerror=/gi,
    /onload=/gi,
    /onclick=/gi,
    /onmouseover=/gi,
    /data:text\/html/gi,
    /expression\(/gi,
    /url\(/gi
  ];

  // Check for potentially malicious patterns
  const hasDangerousPattern = XSS_PATTERNS.some(pattern => pattern.test(input));
  if (hasDangerousPattern) {
    throw new Error('Potentially malicious content detected');
  }

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    SANITIZE_DOM: true,
    KEEP_CONTENT: true
  });
};