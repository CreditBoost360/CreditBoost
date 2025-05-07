/**
 * Sunny Payment Gateway - Database Connector
 * 
 * Provides database connectivity for the payment gateway
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to database files
const DB_DIR = path.join(__dirname, '../../db');

// Database connection state
let useFileSystem = true;

/**
 * Initialize database
 * 
 * @returns {Promise<void>}
 */
export async function initializeDatabase() {
  try {
    await initializeFileSystem();
  } catch (error) {
    console.error('Database initialization error:', error);
    throw new Error('Failed to initialize database');
  }
}

/**
 * Initialize file system storage
 * 
 * @returns {Promise<void>}
 */
async function initializeFileSystem() {
  try {
    // Check if directory exists
    try {
      await fs.access(DB_DIR);
    } catch (error) {
      // Create directory if it doesn't exist
      await fs.mkdir(DB_DIR, { recursive: true });
    }
    
    // Initialize required files
    const requiredFiles = [
      'transactions.json',
      'audit_logs.json',
      'encryption_keys.json'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(DB_DIR, file);
      
      try {
        await fs.access(filePath);
      } catch (error) {
        // Create file with empty array if it doesn't exist
        await fs.writeFile(filePath, JSON.stringify([], null, 2));
      }
    }
    
    console.log('File system storage initialized');
  } catch (error) {
    console.error('Failed to initialize file system storage:', error);
    throw new Error('Failed to initialize database');
  }
}

/**
 * Read data from database
 * 
 * @param {string} collection - Collection name
 * @returns {Promise<Array>} Collection data
 */
export async function readData(collection) {
  // Read from file system
  try {
    const filePath = path.join(DB_DIR, `${collection}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to read ${collection} data:`, error);
    return [];
  }
}

/**
 * Write data to database
 * 
 * @param {string} collection - Collection name
 * @param {Array} data - Data to write
 * @returns {Promise<void>}
 */
export async function writeData(collection, data) {
  // Write to file system
  try {
    const filePath = path.join(DB_DIR, `${collection}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Failed to write ${collection} data:`, error);
    throw new Error(`Failed to write ${collection} data`);
  }
}

/**
 * Find document by ID
 * 
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @returns {Promise<Object|null>} Document or null if not found
 */
export async function findById(collection, id) {
  // Find in file system
  try {
    const data = await readData(collection);
    return data.find(item => item.id === id) || null;
  } catch (error) {
    console.error(`Failed to find document in ${collection}:`, error);
    return null;
  }
}

/**
 * Insert document
 * 
 * @param {string} collection - Collection name
 * @param {Object} document - Document to insert
 * @returns {Promise<Object>} Inserted document
 */
export async function insertDocument(collection, document) {
  // Insert into file system
  try {
    const data = await readData(collection);
    data.push(document);
    await writeData(collection, data);
    return document;
  } catch (error) {
    console.error(`Failed to insert document into ${collection}:`, error);
    throw new Error(`Failed to insert document into ${collection}`);
  }
}

/**
 * Update document
 * 
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @param {Object} update - Update data
 * @returns {Promise<Object|null>} Updated document or null if not found
 */
export async function updateDocument(collection, id, update) {
  // Update in file system
  try {
    const data = await readData(collection);
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }
    
    data[index] = { ...data[index], ...update };
    await writeData(collection, data);
    
    return data[index];
  } catch (error) {
    console.error(`Failed to update document in ${collection}:`, error);
    throw new Error(`Failed to update document in ${collection}`);
  }
}

/**
 * Delete document
 * 
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @returns {Promise<boolean>} Whether document was deleted
 */
export async function deleteDocument(collection, id) {
  // Delete from file system
  try {
    const data = await readData(collection);
    const initialLength = data.length;
    
    const filteredData = data.filter(item => item.id !== id);
    
    if (filteredData.length === initialLength) {
      return false;
    }
    
    await writeData(collection, filteredData);
    return true;
  } catch (error) {
    console.error(`Failed to delete document from ${collection}:`, error);
    throw new Error(`Failed to delete document from ${collection}`);
  }
}

/**
 * Find documents by query
 * 
 * @param {string} collection - Collection name
 * @param {Object} query - Query object
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Matching documents
 */
export async function findDocuments(collection, query = {}, options = {}) {
  // Find in file system
  try {
    let data = await readData(collection);
    
    // Apply filters
    data = filterData(data, query);
    
    // Apply sorting
    if (options.sort) {
      data = sortData(data, options.sort);
    }
    
    // Apply pagination
    if (options.skip || options.limit) {
      const skip = options.skip || 0;
      const limit = options.limit || data.length;
      data = data.slice(skip, skip + limit);
    }
    
    return data;
  } catch (error) {
    console.error(`Failed to find documents in ${collection}:`, error);
    return [];
  }
}

/**
 * Filter data by query
 * 
 * @param {Array} data - Data to filter
 * @param {Object} query - Query object
 * @returns {Array} Filtered data
 */
function filterData(data, query) {
  if (!query || Object.keys(query).length === 0) {
    return data;
  }
  
  return data.filter(item => {
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'object' && value !== null) {
        // Handle operators like $gt, $lt, etc.
        for (const [op, opValue] of Object.entries(value)) {
          switch (op) {
            case '$gt':
              if (!(item[key] > opValue)) return false;
              break;
            case '$gte':
              if (!(item[key] >= opValue)) return false;
              break;
            case '$lt':
              if (!(item[key] < opValue)) return false;
              break;
            case '$lte':
              if (!(item[key] <= opValue)) return false;
              break;
            case '$ne':
              if (item[key] === opValue) return false;
              break;
            case '$in':
              if (!Array.isArray(opValue) || !opValue.includes(item[key])) return false;
              break;
            case '$nin':
              if (!Array.isArray(opValue) || opValue.includes(item[key])) return false;
              break;
          }
        }
      } else if (item[key] !== value) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Sort data
 * 
 * @param {Array} data - Data to sort
 * @param {Object} sort - Sort object
 * @returns {Array} Sorted data
 */
function sortData(data, sort) {
  const sortEntries = Object.entries(sort);
  
  if (sortEntries.length === 0) {
    return data;
  }
  
  return [...data].sort((a, b) => {
    for (const [key, order] of sortEntries) {
      if (a[key] < b[key]) return order === 1 ? -1 : 1;
      if (a[key] > b[key]) return order === 1 ? 1 : -1;
    }
    return 0;
  });
}

/**
 * Count documents
 * 
 * @param {string} collection - Collection name
 * @param {Object} query - Query object
 * @returns {Promise<number>} Document count
 */
export async function countDocuments(collection, query = {}) {
  // Count in file system
  try {
    const data = await readData(collection);
    return filterData(data, query).length;
  } catch (error) {
    console.error(`Failed to count documents in ${collection}:`, error);
    return 0;
  }
}

/**
 * Get database status
 * 
 * @returns {Object} Database status
 */
export function getDatabaseStatus() {
  return {
    useFileSystem,
    type: 'file',
    path: DB_DIR
  };
}