import { encryption } from './encryption.js';

// Error types
export const ErrorTypes = {
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  DATABASE: 'DATABASE_ERROR',
  ENCRYPTION: 'ENCRYPTION_ERROR',
  FILE_OPERATION: 'FILE_OPERATION_ERROR',
  NETWORK: 'NETWORK_ERROR',
  SERVER: 'SERVER_ERROR'
};

// Error severities
const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Security-sensitive fields that should never be logged or exposed
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'apiKey',
  'secret',
  'creditCard',
  'ssn',
  'phoneNumber',
  'email'
];

// Clean sensitive data from objects recursively
const sanitizeData = (data) => {
  if (!data) return data;
  
  if (typeof data === 'object') {
    const sanitized = Array.isArray(data) ? [] : {};
    
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
  
  return data;
};

// Generate error response
const generateErrorResponse = (error, includeDetails = false) => {
  const response = {
    error: error.type || ErrorTypes.SERVER,
    message: error.message || 'An unexpected error occurred',
    code: error.code || 'UNKNOWN_ERROR',
    requestId: encryption.generateToken(8)
  };

  if (includeDetails && process.env.NODE_ENV === 'development') {
    response.details = sanitizeData(error.details);
    response.stack = error.stack;
  }

  return response;
};

// Log error with security in mind
const logError = (err, req) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      status: err.status
    },
    request: {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      body: sanitizeErrorLog(req.body),
      headers: sanitizeHeaders(req.headers),
      ip: req.ip
    }
  };

  // Log to file/monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // Implementation for production logging (e.g., winston, cloudwatch, etc.)
    console.error(JSON.stringify(errorLog));
  } else {
    console.error('Error Log:', errorLog);
  }
};

// Sanitize sensitive data from logs
const sanitizeErrorLog = (data) => {
  if (!data) return data;
  
  const sensitiveFields = [
    'password',
    'token',
    'authorization',
    'creditCard',
    'ssn',
    'accountNumber'
  ];

  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
};

// Sanitize headers for logging
const sanitizeHeaders = (headers) => {
  const sanitized = { ...headers };
  const sensitiveHeaders = [
    'authorization',
    'cookie',
    'x-auth-token'
  ];

  for (const header of sensitiveHeaders) {
    if (header in sanitized) {
      sanitized[header] = '[REDACTED]';
    }
  }

  return sanitized;
};

// Store error logs securely
const storeErrorLog = async (errorLog) => {
  try {
    // Encrypt sensitive data before storage
    const encryptedLog = await encryption.encrypt(JSON.stringify(errorLog));
    // TODO: Implement your storage solution (e.g., secure database, log service)
    return encryptedLog;
  } catch (error) {
    console.error('Error storing error log:', error);
  }
};

// Main error handler middleware
export const errorHandler = (options = {}) => {
  return (err, req, res, next) => {
    // Log the error
    logError(err, req);

    // Determine if we should expose error details
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Handle different types of errors
    switch (err.name) {
      case 'ValidationError':
        return res.status(err.status || 400).json({
          error: 'Validation Error',
          message: err.message,
          details: err.details || undefined
        });

      case 'AuthenticationError':
        return res.status(err.status || 401).json({
          error: 'Authentication Error',
          message: 'Invalid credentials or session expired'
        });

      case 'AuthorizationError':
        return res.status(err.status || 403).json({
          error: 'Authorization Error',
          message: 'Insufficient permissions to access this resource'
        });

      case 'NotFoundError':
        return res.status(err.status || 404).json({
          error: 'Not Found',
          message: err.message || 'Requested resource not found'
        });

      case 'RateLimitError':
        return res.status(err.status || 429).json({
          error: 'Rate Limit Exceeded',
          message: err.message || 'Too many requests',
          retryAfter: err.retryAfter
        });

      // Handle database errors
      case 'SequelizeError':
      case 'MongoError':
        return res.status(500).json({
          error: 'Database Error',
          message: isProduction ? 
            'An error occurred while processing your request' :
            err.message
        });

      // Handle JSON parsing errors
      case 'SyntaxError':
        if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
          return res.status(400).json({
            error: 'Invalid JSON',
            message: 'Invalid request body format'
          });
        }
        break;

      // Handle file upload errors
      case 'MulterError':
        return res.status(400).json({
          error: 'File Upload Error',
          message: err.message
        });

      default:
        // Log unexpected errors with full details
        console.error('Unexpected Error:', err);
        
        // Send generic error response in production
        return res.status(err.status || 500).json({
          error: 'Internal Server Error',
          message: isProduction ?
            'An unexpected error occurred' :
            err.message,
          ...(isProduction ? {} : { stack: err.stack })
        });
    }
  };
};

// Custom error class
export class AppError extends Error {
  constructor(message, type = ErrorTypes.SERVER, details = null, severity = ErrorSeverity.MEDIUM) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.details = details;
    this.severity = severity;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error
export class ValidationError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.details = details;
  }
}

// Authentication error
export class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = 401;
  }
}

// Authorization error
export class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthorizationError';
    this.status = 403;
  }
}

// Not found error
export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

// Rate limit error
export class RateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RateLimitError';
    this.status = 429;
  }
}

// Database error
export class DatabaseError extends AppError {
  constructor(message, details = null) {
    super(message, ErrorTypes.DATABASE, details, ErrorSeverity.HIGH);
    this.name = 'DatabaseError';
  }
}

// Encryption error
export class EncryptionError extends AppError {
  constructor(message, details = null) {
    super(message, ErrorTypes.ENCRYPTION, details, ErrorSeverity.CRITICAL);
    this.name = 'EncryptionError';
  }
}

// Error boundary for async route handlers
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Utility function to create error responses
export const createError = (status, message, details = null) => {
  const error = new Error(message);
  error.status = status;
  if (details) error.details = details;
  return error;
};

// Error monitoring setup (integration with external services)
export const setupErrorMonitoring = () => {
  if (process.env.NODE_ENV === 'production') {
    // Setup error monitoring service (e.g., Sentry, NewRelic, etc.)
    // Implementation depends on the chosen service
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      // Log to monitoring service
    });

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      // Log to monitoring service
      process.exit(1);
    });
  }
};

// Export default error messages
export const ErrorMessages = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  SESSION_EXPIRED: 'Your session has expired. Please log in again',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  RESOURCE_NOT_FOUND: 'The requested resource was not found',
  VALIDATION_FAILED: 'Input validation failed',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later',
  INTERNAL_ERROR: 'An internal server error occurred',
  INVALID_TOKEN: 'Invalid or expired token',
  MISSING_FIELDS: 'Required fields are missing',
  DUPLICATE_ENTRY: 'This record already exists',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type'
};