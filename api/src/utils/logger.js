/**
 * Logger Utility
 * 
 * This module provides a centralized logging system for the application.
 */

const winston = require('winston');
const config = require('../config');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  config.logging.format === 'json'
    ? winston.format.json()
    : winston.format.printf(({ level, message, timestamp, ...meta }) => {
        return `${timestamp} ${level.toUpperCase()}: ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta) : ''
        }`;
      })
);

// Create transports
const transports = [
  // Console transport
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    handleExceptions: true
  })
];

// Add file transport in non-test environments
if (process.env.NODE_ENV !== 'test') {
  transports.push(
    new winston.transports.File({
      filename: config.logging.filename,
      level: config.logging.level,
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
      tailable: true
    })
  );
}

// Create logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports,
  exitOnError: false
});

// Add request context middleware
logger.addRequestContext = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || req.id || generateRequestId();
  req.requestId = requestId;
  
  // Add request context to all log entries
  const oldInfo = logger.info;
  logger.info = function(message, meta = {}) {
    return oldInfo.call(this, message, { requestId, ...meta });
  };
  
  const oldError = logger.error;
  logger.error = function(message, meta = {}) {
    return oldError.call(this, message, { requestId, ...meta });
  };
  
  const oldWarn = logger.warn;
  logger.warn = function(message, meta = {}) {
    return oldWarn.call(this, message, { requestId, ...meta });
  };
  
  const oldDebug = logger.debug;
  logger.debug = function(message, meta = {}) {
    return oldDebug.call(this, message, { requestId, ...meta });
  };
  
  next();
};

// Generate a unique request ID
function generateRequestId() {
  return 'req_' + Math.random().toString(36).substring(2, 15);
}

// Export logger
module.exports = logger;