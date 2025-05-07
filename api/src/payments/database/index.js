/**
 * Sunny Payment Gateway - Database Module
 * 
 * Exports database functionality
 */

import { 
  initializeDatabase,
  readData,
  writeData,
  findById,
  insertDocument,
  updateDocument,
  deleteDocument,
  findDocuments,
  countDocuments,
  getDatabaseStatus
} from './dbConnector.js';

import * as Transaction from './models/Transaction.js';
import * as AuditLog from './models/AuditLog.js';

export {
  // Database connector
  initializeDatabase,
  readData,
  writeData,
  findById,
  insertDocument,
  updateDocument,
  deleteDocument,
  findDocuments,
  countDocuments,
  getDatabaseStatus,
  
  // Models
  Transaction,
  AuditLog
};

/**
 * Initialize the database
 */
export async function initialize() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}