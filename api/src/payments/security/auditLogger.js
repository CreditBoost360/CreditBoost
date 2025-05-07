/**
 * Sunny Payment Gateway - Audit Logger
 * 
 * Implements detailed audit logging for payment operations
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { maskSensitiveData } from '../encryption.js';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to audit log file
const AUDIT_LOG_PATH = path.join(__dirname, '../../db/audit_logs.json');

/**
 * Initialize audit log file if it doesn't exist
 */
async function initializeAuditLog() {
  try {
    // Check if directory exists
    const dbDir = path.join(__dirname, '../../db');
    try {
      await fs.access(dbDir);
    } catch (error) {
      // Create directory if it doesn't exist
      await fs.mkdir(dbDir, { recursive: true });
    }
    
    // Check if file exists
    try {
      await fs.access(AUDIT_LOG_PATH);
    } catch (error) {
      // Create file with empty array if it doesn't exist
      await fs.writeFile(AUDIT_LOG_PATH, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('Failed to initialize audit log:', error);
    throw new Error('Failed to initialize audit log');
  }
}

/**
 * Read audit log
 * 
 * @returns {Promise<Array>} Array of audit log entries
 */
async function readAuditLog() {
  try {
    await initializeAuditLog();
    const data = await fs.readFile(AUDIT_LOG_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read audit log:', error);
    throw new Error('Failed to read audit log');
  }
}

/**
 * Write audit log
 * 
 * @param {Array} logs - Array of audit log entries
 * @returns {Promise<void>}
 */
async function writeAuditLog(logs) {
  try {
    await fs.writeFile(AUDIT_LOG_PATH, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('Failed to write audit log:', error);
    throw new Error('Failed to write audit log');
  }
}

/**
 * Log an audit event
 * 
 * @param {Object} event - Audit event data
 * @returns {Promise<void>}
 */
export async function logAuditEvent(event) {
  try {
    // Validate required fields
    if (!event.action || !event.userId) {
      throw new Error('Action and userId are required for audit logging');
    }
    
    // Read existing logs
    const logs = await readAuditLog();
    
    // Add timestamp if not provided
    if (!event.timestamp) {
      event.timestamp = new Date().toISOString();
    }
    
    // Add IP address if not provided
    if (!event.ipAddress && event.req) {
      event.ipAddress = event.req.ip || 
                        event.req.connection.remoteAddress || 
                        event.req.headers['x-forwarded-for']?.split(',')[0].trim();
      delete event.req; // Remove request object to avoid circular references
    }
    
    // Sanitize sensitive data
    const sanitizedEvent = sanitizeAuditData(event);
    
    // Add event to log
    logs.push(sanitizedEvent);
    
    // Write updated log
    await writeAuditLog(logs);
    
    console.log(`Audit event logged: ${event.action} by ${event.userId}`);
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw error to avoid disrupting the main flow
  }
}

/**
 * Sanitize audit data for logging
 * 
 * @param {Object} event - Audit event data to sanitize
 * @returns {Object} Sanitized audit event data
 */
function sanitizeAuditData(event) {
  // Create a deep copy of the event
  const sanitized = JSON.parse(JSON.stringify(event));
  
  // Mask sensitive data if present
  if (sanitized.data) {
    if (sanitized.data.card) {
      if (sanitized.data.card.number) {
        sanitized.data.card.number = maskSensitiveData(sanitized.data.card.number, { showFirst: 6, showLast: 4 });
      }
      if (sanitized.data.card.cvv) {
        sanitized.data.card.cvv = '***';
      }
    }
    
    if (sanitized.data.bankAccount) {
      if (sanitized.data.bankAccount.accountNumber) {
        sanitized.data.bankAccount.accountNumber = maskSensitiveData(sanitized.data.bankAccount.accountNumber, { showLast: 4 });
      }
      if (sanitized.data.bankAccount.routingNumber) {
        sanitized.data.bankAccount.routingNumber = maskSensitiveData(sanitized.data.bankAccount.routingNumber, { showLast: 4 });
      }
    }
  }
  
  return sanitized;
}

/**
 * Get audit logs by user ID
 * 
 * @param {string} userId - User ID to filter by
 * @param {Object} options - Filter options
 * @param {number} options.limit - Maximum number of logs to return
 * @param {number} options.offset - Number of logs to skip
 * @param {string} options.action - Filter by action
 * @param {string} options.startDate - Filter by start date (ISO string)
 * @param {string} options.endDate - Filter by end date (ISO string)
 * @returns {Promise<Array>} Array of audit log entries
 */
export async function getAuditLogsByUser(userId, options = {}) {
  try {
    const logs = await readAuditLog();
    
    // Filter by user ID
    let filtered = logs.filter(log => log.userId === userId);
    
    // Apply additional filters
    if (options.action) {
      filtered = filtered.filter(log => log.action === options.action);
    }
    
    if (options.startDate) {
      const startDate = new Date(options.startDate).getTime();
      filtered = filtered.filter(log => new Date(log.timestamp).getTime() >= startDate);
    }
    
    if (options.endDate) {
      const endDate = new Date(options.endDate).getTime();
      filtered = filtered.filter(log => new Date(log.timestamp).getTime() <= endDate);
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || filtered.length;
    
    return filtered.slice(offset, offset + limit);
  } catch (error) {
    console.error('Failed to get audit logs by user:', error);
    throw new Error('Failed to get audit logs by user');
  }
}

/**
 * Search audit logs
 * 
 * @param {Object} searchParams - Search parameters
 * @param {string} searchParams.userId - Search by user ID
 * @param {string} searchParams.action - Search by action
 * @param {string} searchParams.ipAddress - Search by IP address
 * @param {string} searchParams.startDate - Start date (ISO string)
 * @param {string} searchParams.endDate - End date (ISO string)
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of results
 * @param {number} options.offset - Number of results to skip
 * @returns {Promise<Array>} Array of matching audit logs
 */
export async function searchAuditLogs(searchParams, options = {}) {
  try {
    const logs = await readAuditLog();
    
    // Apply filters
    let filtered = logs;
    
    if (searchParams.userId) {
      filtered = filtered.filter(log => log.userId === searchParams.userId);
    }
    
    if (searchParams.action) {
      filtered = filtered.filter(log => log.action === searchParams.action);
    }
    
    if (searchParams.ipAddress) {
      filtered = filtered.filter(log => log.ipAddress === searchParams.ipAddress);
    }
    
    if (searchParams.startDate) {
      const startDate = new Date(searchParams.startDate).getTime();
      filtered = filtered.filter(log => new Date(log.timestamp).getTime() >= startDate);
    }
    
    if (searchParams.endDate) {
      const endDate = new Date(searchParams.endDate).getTime();
      filtered = filtered.filter(log => new Date(log.timestamp).getTime() <= endDate);
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || filtered.length;
    
    return filtered.slice(offset, offset + limit);
  } catch (error) {
    console.error('Failed to search audit logs:', error);
    throw new Error('Failed to search audit logs');
  }
}

/**
 * Middleware to log API requests
 */
export function auditLogMiddleware() {
  return (req, res, next) => {
    // Original end function
    const originalEnd = res.end;
    
    // Override end function to log response
    res.end = function(chunk, encoding) {
      // Restore original end function
      res.end = originalEnd;
      
      // Call original end function
      res.end(chunk, encoding);
      
      // Log audit event
      if (req.userId) {
        const event = {
          action: `API_${req.method}_${req.path}`,
          userId: req.userId,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          statusCode: res.statusCode,
          requestPath: req.path,
          requestMethod: req.method,
          requestParams: {
            query: req.query,
            body: sanitizeRequestBody(req.body)
          }
        };
        
        logAuditEvent(event).catch(console.error);
      }
    };
    
    next();
  };
}

/**
 * Sanitize request body for audit logging
 * 
 * @param {Object} body - Request body
 * @returns {Object} Sanitized request body
 */
function sanitizeRequestBody(body) {
  if (!body) return {};
  
  // Create a deep copy
  const sanitized = JSON.parse(JSON.stringify(body));
  
  // Mask sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'cvv', 'cardNumber', 'accountNumber'];
  
  // Recursive function to mask sensitive fields
  function maskSensitiveFields(obj) {
    if (!obj || typeof obj !== 'object') return;
    
    Object.keys(obj).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        obj[key] = '********';
      } else if (typeof obj[key] === 'object') {
        maskSensitiveFields(obj[key]);
      }
    });
  }
  
  maskSensitiveFields(sanitized);
  
  return sanitized;
}