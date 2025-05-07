/**
 * Sunny Payment Gateway - High Performance Database Connector
 * 
 * Provides scalable database connectivity for high transaction volumes
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to database files
const DB_DIR = path.join(__dirname, '../../db');

// In-memory cache for high-performance reads
const memoryCache = new Map();

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

// Cache metadata to track expiration
const cacheMetadata = new Map();

/**
 * Initialize database
 * 
 * @returns {Promise<void>}
 */
export async function initializeDatabase() {
  try {
    await initializeFileSystem();
    console.log('High-performance database initialized');
    
    // Start cache cleanup interval
    startCacheCleanup();
  } catch (error) {
    console.error('Database initialization error:', error);
    throw new Error('Failed to initialize high-performance database');
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
      'encryption_keys.json',
      'shards'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(DB_DIR, file);
      
      if (file === 'shards') {
        // Create shards directory
        try {
          await fs.access(filePath);
        } catch (error) {
          await fs.mkdir(filePath, { recursive: true });
        }
      } else {
        // Create JSON files
        try {
          await fs.access(filePath);
        } catch (error) {
          await fs.writeFile(filePath, JSON.stringify([], null, 2));
        }
      }
    }
    
    console.log('File system storage initialized');
  } catch (error) {
    console.error('Failed to initialize file system storage:', error);
    throw new Error('Failed to initialize database');
  }
}

/**
 * Get shard key for a document
 * 
 * @param {Object} document - Document to shard
 * @returns {string} Shard key
 */
function getShardKey(document) {
  // Use merchant ID and month as shard key
  const merchantId = document.merchantId || 'default';
  const date = new Date(document.timestamp || new Date());
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  return `${merchantId}-${year}-${month.toString().padStart(2, '0')}`;
}

/**
 * Get shard path for a shard key
 * 
 * @param {string} collection - Collection name
 * @param {string} shardKey - Shard key
 * @returns {string} Path to shard file
 */
function getShardPath(collection, shardKey) {
  return path.join(DB_DIR, 'shards', `${collection}-${shardKey}.json`);
}

/**
 * Read shard data
 * 
 * @param {string} collection - Collection name
 * @param {string} shardKey - Shard key
 * @returns {Promise<Array>} Shard data
 */
async function readShard(collection, shardKey) {
  const cacheKey = `${collection}-${shardKey}`;
  
  // Check cache first
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }
  
  const shardPath = getShardPath(collection, shardKey);
  
  try {
    // Check if shard file exists
    try {
      await fs.access(shardPath);
    } catch (error) {
      // Create empty shard if it doesn't exist
      await fs.writeFile(shardPath, JSON.stringify([], null, 2));
      return [];
    }
    
    // Read shard data
    const data = await fs.readFile(shardPath, 'utf8');
    const parsedData = JSON.parse(data);
    
    // Cache the data
    memoryCache.set(cacheKey, parsedData);
    cacheMetadata.set(cacheKey, {
      timestamp: Date.now(),
      size: data.length
    });
    
    return parsedData;
  } catch (error) {
    console.error(`Failed to read shard ${shardKey} for collection ${collection}:`, error);
    return [];
  }
}

/**
 * Write shard data
 * 
 * @param {string} collection - Collection name
 * @param {string} shardKey - Shard key
 * @param {Array} data - Data to write
 * @returns {Promise<void>}
 */
async function writeShard(collection, shardKey, data) {
  const shardPath = getShardPath(collection, shardKey);
  const cacheKey = `${collection}-${shardKey}`;
  
  try {
    // Write data to file
    await fs.writeFile(shardPath, JSON.stringify(data, null, 2));
    
    // Update cache
    memoryCache.set(cacheKey, data);
    cacheMetadata.set(cacheKey, {
      timestamp: Date.now(),
      size: JSON.stringify(data).length
    });
  } catch (error) {
    console.error(`Failed to write shard ${shardKey} for collection ${collection}:`, error);
    throw new Error(`Failed to write shard ${shardKey} for collection ${collection}`);
  }
}

/**
 * Read data from database with sharding
 * 
 * @param {string} collection - Collection name
 * @returns {Promise<Array>} Collection data
 */
export async function readData(collection) {
  try {
    // For non-sharded collections, use the original file
    if (['encryption_keys', 'audit_logs'].includes(collection)) {
      const filePath = path.join(DB_DIR, `${collection}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    }
    
    // For sharded collections, read all shards
    const shardsDir = path.join(DB_DIR, 'shards');
    const files = await fs.readdir(shardsDir);
    
    // Filter files for this collection
    const shardFiles = files.filter(file => file.startsWith(`${collection}-`));
    
    // Read all shards
    const allData = [];
    for (const file of shardFiles) {
      const shardKey = file.replace(`${collection}-`, '').replace('.json', '');
      const shardData = await readShard(collection, shardKey);
      allData.push(...shardData);
    }
    
    return allData;
  } catch (error) {
    console.error(`Failed to read ${collection} data:`, error);
    return [];
  }
}

/**
 * Write data to database with sharding
 * 
 * @param {string} collection - Collection name
 * @param {Array} data - Data to write
 * @returns {Promise<void>}
 */
export async function writeData(collection, data) {
  try {
    // For non-sharded collections, use the original file
    if (['encryption_keys', 'audit_logs'].includes(collection)) {
      const filePath = path.join(DB_DIR, `${collection}.json`);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return;
    }
    
    // For sharded collections, group by shard key
    const shards = new Map();
    
    for (const item of data) {
      const shardKey = getShardKey(item);
      
      if (!shards.has(shardKey)) {
        shards.set(shardKey, []);
      }
      
      shards.get(shardKey).push(item);
    }
    
    // Write each shard
    for (const [shardKey, shardData] of shards.entries()) {
      await writeShard(collection, shardKey, shardData);
    }
  } catch (error) {
    console.error(`Failed to write ${collection} data:`, error);
    throw new Error(`Failed to write ${collection} data`);
  }
}

/**
 * Find document by ID with caching
 * 
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @returns {Promise<Object|null>} Document or null if not found
 */
export async function findById(collection, id) {
  // Check cache first
  const cacheKey = `${collection}-id-${id}`;
  
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }
  
  try {
    // For non-sharded collections, read the entire collection
    if (['encryption_keys', 'audit_logs'].includes(collection)) {
      const data = await readData(collection);
      const document = data.find(item => item.id === id);
      
      if (document) {
        // Cache the result
        memoryCache.set(cacheKey, document);
        cacheMetadata.set(cacheKey, {
          timestamp: Date.now(),
          size: JSON.stringify(document).length
        });
      }
      
      return document || null;
    }
    
    // For transactions, try to find the document in any shard
    const shardsDir = path.join(DB_DIR, 'shards');
    const files = await fs.readdir(shardsDir);
    
    // Filter files for this collection
    const shardFiles = files.filter(file => file.startsWith(`${collection}-`));
    
    // Search each shard
    for (const file of shardFiles) {
      const shardKey = file.replace(`${collection}-`, '').replace('.json', '');
      const shardData = await readShard(collection, shardKey);
      const document = shardData.find(item => item.id === id || item.transactionId === id);
      
      if (document) {
        // Cache the result
        memoryCache.set(cacheKey, document);
        cacheMetadata.set(cacheKey, {
          timestamp: Date.now(),
          size: JSON.stringify(document).length
        });
        
        return document;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to find document in ${collection}:`, error);
    return null;
  }
}

/**
 * Insert document with sharding
 * 
 * @param {string} collection - Collection name
 * @param {Object} document - Document to insert
 * @returns {Promise<Object>} Inserted document
 */
export async function insertDocument(collection, document) {
  try {
    // For non-sharded collections, append to the collection
    if (['encryption_keys', 'audit_logs'].includes(collection)) {
      const data = await readData(collection);
      data.push(document);
      await writeData(collection, data);
      return document;
    }
    
    // For sharded collections, add to the appropriate shard
    const shardKey = getShardKey(document);
    const shardData = await readShard(collection, shardKey);
    
    shardData.push(document);
    await writeShard(collection, shardKey, shardData);
    
    // Invalidate any cached queries that might include this document
    invalidateCollectionCaches(collection);
    
    return document;
  } catch (error) {
    console.error(`Failed to insert document into ${collection}:`, error);
    throw new Error(`Failed to insert document into ${collection}`);
  }
}

/**
 * Update document with sharding
 * 
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @param {Object} update - Update data
 * @returns {Promise<Object|null>} Updated document or null if not found
 */
export async function updateDocument(collection, id, update) {
  try {
    // For non-sharded collections, update in place
    if (['encryption_keys', 'audit_logs'].includes(collection)) {
      const data = await readData(collection);
      const index = data.findIndex(item => item.id === id);
      
      if (index === -1) {
        return null;
      }
      
      data[index] = { ...data[index], ...update };
      await writeData(collection, data);
      
      // Update cache
      const cacheKey = `${collection}-id-${id}`;
      memoryCache.set(cacheKey, data[index]);
      cacheMetadata.set(cacheKey, {
        timestamp: Date.now(),
        size: JSON.stringify(data[index]).length
      });
      
      return data[index];
    }
    
    // For sharded collections, find the document first
    const document = await findById(collection, id);
    
    if (!document) {
      return null;
    }
    
    // Get the current shard key
    const currentShardKey = getShardKey(document);
    
    // Read the shard
    const shardData = await readShard(collection, currentShardKey);
    
    // Find and update the document
    const index = shardData.findIndex(item => item.id === id || item.transactionId === id);
    
    if (index === -1) {
      return null;
    }
    
    // Update the document
    const updatedDocument = { ...shardData[index], ...update };
    shardData[index] = updatedDocument;
    
    // Check if the shard key has changed
    const newShardKey = getShardKey(updatedDocument);
    
    if (newShardKey !== currentShardKey) {
      // Remove from current shard
      shardData.splice(index, 1);
      await writeShard(collection, currentShardKey, shardData);
      
      // Add to new shard
      const newShardData = await readShard(collection, newShardKey);
      newShardData.push(updatedDocument);
      await writeShard(collection, newShardKey, newShardData);
    } else {
      // Update current shard
      await writeShard(collection, currentShardKey, shardData);
    }
    
    // Update cache
    const cacheKey = `${collection}-id-${id}`;
    memoryCache.set(cacheKey, updatedDocument);
    cacheMetadata.set(cacheKey, {
      timestamp: Date.now(),
      size: JSON.stringify(updatedDocument).length
    });
    
    // Invalidate any cached queries that might include this document
    invalidateCollectionCaches(collection);
    
    return updatedDocument;
  } catch (error) {
    console.error(`Failed to update document in ${collection}:`, error);
    throw new Error(`Failed to update document in ${collection}`);
  }
}

/**
 * Delete document with sharding
 * 
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @returns {Promise<boolean>} Whether document was deleted
 */
export async function deleteDocument(collection, id) {
  try {
    // For non-sharded collections, filter out the document
    if (['encryption_keys', 'audit_logs'].includes(collection)) {
      const data = await readData(collection);
      const initialLength = data.length;
      
      const filtered = data.filter(item => item.id !== id);
      
      if (filtered.length === initialLength) {
        return false;
      }
      
      await writeData(collection, filtered);
      
      // Invalidate cache
      const cacheKey = `${collection}-id-${id}`;
      memoryCache.delete(cacheKey);
      cacheMetadata.delete(cacheKey);
      
      return true;
    }
    
    // For sharded collections, find the document first
    const document = await findById(collection, id);
    
    if (!document) {
      return false;
    }
    
    // Get the shard key
    const shardKey = getShardKey(document);
    
    // Read the shard
    const shardData = await readShard(collection, shardKey);
    
    // Filter out the document
    const filtered = shardData.filter(item => item.id !== id && item.transactionId !== id);
    
    if (filtered.length === shardData.length) {
      return false;
    }
    
    // Write the updated shard
    await writeShard(collection, shardKey, filtered);
    
    // Invalidate cache
    const cacheKey = `${collection}-id-${id}`;
    memoryCache.delete(cacheKey);
    cacheMetadata.delete(cacheKey);
    
    // Invalidate any cached queries that might include this document
    invalidateCollectionCaches(collection);
    
    return true;
  } catch (error) {
    console.error(`Failed to delete document from ${collection}:`, error);
    throw new Error(`Failed to delete document from ${collection}`);
  }
}

/**
 * Find documents by query with caching
 * 
 * @param {string} collection - Collection name
 * @param {Object} query - Query object
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Matching documents
 */
export async function findDocuments(collection, query = {}, options = {}) {
  // Generate cache key based on query and options
  const cacheKey = `${collection}-query-${JSON.stringify(query)}-${JSON.stringify(options)}`;
  
  // Check cache first
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }
  
  try {
    // Get all documents for the collection
    const allDocuments = await readData(collection);
    
    // Apply filters
    let filtered = filterData(allDocuments, query);
    
    // Apply sorting
    if (options.sort) {
      filtered = sortData(filtered, options.sort);
    }
    
    // Apply pagination
    if (options.skip || options.limit) {
      const skip = options.skip || 0;
      const limit = options.limit || filtered.length;
      filtered = filtered.slice(skip, skip + limit);
    }
    
    // Cache the results
    memoryCache.set(cacheKey, filtered);
    cacheMetadata.set(cacheKey, {
      timestamp: Date.now(),
      size: JSON.stringify(filtered).length
    });
    
    return filtered;
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
  try {
    const data = await readData(collection);
    return filterData(data, query).length;
  } catch (error) {
    console.error(`Failed to count documents in ${collection}:`, error);
    return 0;
  }
}

/**
 * Invalidate collection caches
 * 
 * @param {string} collection - Collection name
 */
function invalidateCollectionCaches(collection) {
  // Remove all cache entries for this collection
  for (const key of memoryCache.keys()) {
    if (key.startsWith(`${collection}-query-`)) {
      memoryCache.delete(key);
      cacheMetadata.delete(key);
    }
  }
}

/**
 * Start cache cleanup interval
 */
function startCacheCleanup() {
  setInterval(() => {
    const now = Date.now();
    
    // Check each cache entry
    for (const [key, metadata] of cacheMetadata.entries()) {
      // Remove if expired
      if (now - metadata.timestamp > CACHE_TTL) {
        memoryCache.delete(key);
        cacheMetadata.delete(key);
      }
    }
    
    // Log cache stats
    const totalSize = Array.from(cacheMetadata.values())
      .reduce((sum, metadata) => sum + metadata.size, 0);
    
    console.log(`Cache stats: ${memoryCache.size} entries, ~${Math.round(totalSize / 1024)} KB`);
  }, 60000); // Run every minute
}

/**
 * Get database status
 * 
 * @returns {Object} Database status
 */
export function getDatabaseStatus() {
  return {
    type: 'high-performance-file',
    cacheSize: memoryCache.size,
    cacheEntries: Array.from(memoryCache.keys()),
    shardingEnabled: true
  };
}