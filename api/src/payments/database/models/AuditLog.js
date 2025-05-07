/**
 * Sunny Payment Gateway - Audit Log Model
 * 
 * Defines the audit log data model
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  insertDocument, 
  findById, 
  findDocuments, 
  countDocuments
} from '../dbConnector.js';

// Collection name
const COLLECTION = 'audit_logs';

/**
 * Create a new audit log entry
 * 
 * @param {Object} logData - Audit log data
 * @returns {Promise<Object>} Created audit log entry
 */
export async function createAuditLog(logData) {
  // Generate ID if not provided
  if (!logData.id) {
    logData.id = uuidv4();
  }
  
  // Add timestamp if not provided
  if (!logData.timestamp) {
    logData.timestamp = new Date().toISOString();
  }
  
  return await insertDocument(COLLECTION, logData);
}

/**
 * Get audit log by ID
 * 
 * @param {string} logId - Audit log ID
 * @returns {Promise<Object|null>} Audit log entry or null if not found
 */
export async function getAuditLogById(logId) {
  return await findById(COLLECTION, logId);
}

/**
 * Get audit logs by user ID
 * 
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Audit log entries
 */
export async function getAuditLogsByUser(userId, options = {}) {
  const query = { userId };
  
  // Add action filter if provided
  if (options.action) {
    query.action = options.action;
  }
  
  // Add date range filters if provided
  if (options.startDate || options.endDate) {
    query.timestamp = {};
    
    if (options.startDate) {
      query.timestamp.$gte = options.startDate;
    }
    
    if (options.endDate) {
      query.timestamp.$lte = options.endDate;
    }
  }
  
  // Set up sort options
  const sort = { timestamp: -1 }; // Default sort by timestamp desc
  
  // Set up pagination options
  const skip = options.offset || 0;
  const limit = options.limit || 100;
  
  return await findDocuments(COLLECTION, query, { sort, skip, limit });
}

/**
 * Search audit logs
 * 
 * @param {Object} searchParams - Search parameters
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Matching audit log entries
 */
export async function searchAuditLogs(searchParams, options = {}) {
  const query = {};
  
  // Add search filters
  if (searchParams.userId) {
    query.userId = searchParams.userId;
  }
  
  if (searchParams.action) {
    query.action = searchParams.action;
  }
  
  if (searchParams.ipAddress) {
    query.ipAddress = searchParams.ipAddress;
  }
  
  // Add date range filters
  if (searchParams.startDate || searchParams.endDate) {
    query.timestamp = {};
    
    if (searchParams.startDate) {
      query.timestamp.$gte = searchParams.startDate;
    }
    
    if (searchParams.endDate) {
      query.timestamp.$lte = searchParams.endDate;
    }
  }
  
  // Set up sort options
  const sort = { timestamp: -1 }; // Default sort by timestamp desc
  
  // Set up pagination options
  const skip = options.offset || 0;
  const limit = options.limit || 100;
  
  return await findDocuments(COLLECTION, query, { sort, skip, limit });
}

/**
 * Get audit log statistics
 * 
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Audit log statistics
 */
export async function getAuditLogStats(userId, options = {}) {
  // Get all audit logs for the user
  const query = { userId };
  
  // Add date range filters if provided
  if (options.startDate || options.endDate) {
    query.timestamp = {};
    
    if (options.startDate) {
      query.timestamp.$gte = options.startDate;
    }
    
    if (options.endDate) {
      query.timestamp.$lte = options.endDate;
    }
  }
  
  const logs = await findDocuments(COLLECTION, query);
  
  // Calculate statistics
  const stats = {
    totalCount: logs.length,
    byAction: {},
    byIpAddress: {},
    byHour: {},
    byDay: {}
  };
  
  // Process logs
  logs.forEach(log => {
    // Count by action
    stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
    
    // Count by IP address
    if (log.ipAddress) {
      stats.byIpAddress[log.ipAddress] = (stats.byIpAddress[log.ipAddress] || 0) + 1;
    }
    
    // Count by hour and day
    const date = new Date(log.timestamp);
    const hour = date.getHours();
    const day = date.toISOString().split('T')[0];
    
    stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
    stats.byDay[day] = (stats.byDay[day] || 0) + 1;
  });
  
  return stats;
}

/**
 * Count audit logs
 * 
 * @param {Object} query - Query object
 * @returns {Promise<number>} Audit log count
 */
export async function countAuditLogs(query = {}) {
  return await countDocuments(COLLECTION, query);
}