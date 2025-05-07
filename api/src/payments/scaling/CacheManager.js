/**
 * Sunny Payment Gateway - Cache Manager
 * 
 * Implements multi-level caching for high performance
 */

import crypto from 'crypto';

// Cache configuration
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_CACHE_SIZE = 10000; // Maximum number of items in cache
const CACHE_CLEANUP_INTERVAL = 60 * 1000; // 1 minute in milliseconds

// L1 cache (in-memory)
const memoryCache = new Map();

// Cache metadata
const cacheMetadata = new Map();

// Cache statistics
const cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  evictions: 0,
  cleanups: 0
};

/**
 * Initialize cache manager
 */
export function initializeCache() {
  // Start cache cleanup interval
  startCacheCleanup();
  
  console.log('Cache manager initialized');
}

/**
 * Get item from cache
 * 
 * @param {string} key - Cache key
 * @returns {*} Cached value or undefined if not found
 */
export function get(key) {
  // Check if key exists in cache
  if (memoryCache.has(key)) {
    const metadata = cacheMetadata.get(key);
    
    // Check if item has expired
    if (metadata.expiresAt < Date.now()) {
      // Item has expired, remove it
      memoryCache.delete(key);
      cacheMetadata.delete(key);
      
      cacheStats.evictions++;
      return undefined;
    }
    
    // Update access time
    metadata.lastAccessed = Date.now();
    
    // Increment hit count
    cacheStats.hits++;
    
    return memoryCache.get(key);
  }
  
  // Cache miss
  cacheStats.misses++;
  
  return undefined;
}

/**
 * Set item in cache
 * 
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {Object} options - Cache options
 * @param {number} options.ttl - Time to live in milliseconds
 * @returns {void}
 */
export function set(key, value, options = {}) {
  // Check if cache is full
  if (memoryCache.size >= MAX_CACHE_SIZE) {
    // Evict least recently used item
    evictLRU();
  }
  
  // Set item in cache
  memoryCache.set(key, value);
  
  // Set metadata
  cacheMetadata.set(key, {
    createdAt: Date.now(),
    lastAccessed: Date.now(),
    expiresAt: Date.now() + (options.ttl || DEFAULT_TTL),
    size: estimateSize(value)
  });
  
  // Increment set count
  cacheStats.sets++;
}

/**
 * Delete item from cache
 * 
 * @param {string} key - Cache key
 * @returns {boolean} Whether item was deleted
 */
export function del(key) {
  const deleted = memoryCache.delete(key);
  
  if (deleted) {
    cacheMetadata.delete(key);
  }
  
  return deleted;
}

/**
 * Clear all items from cache
 * 
 * @returns {void}
 */
export function clear() {
  memoryCache.clear();
  cacheMetadata.clear();
}

/**
 * Get cache statistics
 * 
 * @returns {Object} Cache statistics
 */
export function getStats() {
  const hitRate = cacheStats.hits + cacheStats.misses > 0
    ? cacheStats.hits / (cacheStats.hits + cacheStats.misses)
    : 0;
  
  return {
    ...cacheStats,
    hitRate: hitRate.toFixed(2),
    size: memoryCache.size,
    maxSize: MAX_CACHE_SIZE,
    memoryUsage: getTotalCacheSize()
  };
}

/**
 * Start cache cleanup interval
 * 
 * @private
 */
function startCacheCleanup() {
  setInterval(() => {
    const now = Date.now();
    let expiredCount = 0;
    
    // Check each cache entry
    for (const [key, metadata] of cacheMetadata.entries()) {
      // Remove if expired
      if (metadata.expiresAt < now) {
        memoryCache.delete(key);
        cacheMetadata.delete(key);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      cacheStats.evictions += expiredCount;
    }
    
    cacheStats.cleanups++;
  }, CACHE_CLEANUP_INTERVAL);
}

/**
 * Evict least recently used item from cache
 * 
 * @private
 */
function evictLRU() {
  let oldestKey = null;
  let oldestAccess = Infinity;
  
  // Find least recently used item
  for (const [key, metadata] of cacheMetadata.entries()) {
    if (metadata.lastAccessed < oldestAccess) {
      oldestAccess = metadata.lastAccessed;
      oldestKey = key;
    }
  }
  
  // Evict item
  if (oldestKey) {
    memoryCache.delete(oldestKey);
    cacheMetadata.delete(oldestKey);
    cacheStats.evictions++;
  }
}

/**
 * Estimate size of value in bytes
 * 
 * @private
 * @param {*} value - Value to estimate size of
 * @returns {number} Estimated size in bytes
 */
function estimateSize(value) {
  if (value === null || value === undefined) {
    return 0;
  }
  
  if (typeof value === 'boolean') {
    return 4;
  }
  
  if (typeof value === 'number') {
    return 8;
  }
  
  if (typeof value === 'string') {
    return value.length * 2;
  }
  
  if (typeof value === 'object') {
    try {
      const json = JSON.stringify(value);
      return json.length * 2;
    } catch (error) {
      return 1000; // Default size for objects that can't be stringified
    }
  }
  
  return 8; // Default size
}

/**
 * Get total cache size in bytes
 * 
 * @private
 * @returns {number} Total cache size in bytes
 */
function getTotalCacheSize() {
  let totalSize = 0;
  
  for (const metadata of cacheMetadata.values()) {
    totalSize += metadata.size;
  }
  
  return totalSize;
}

/**
 * Create a cache key from parameters
 * 
 * @param {string} prefix - Key prefix
 * @param {...*} args - Key arguments
 * @returns {string} Cache key
 */
export function createKey(prefix, ...args) {
  const key = `${prefix}:${args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      return JSON.stringify(arg);
    }
    return String(arg);
  }).join(':')}`;
  
  // Hash the key if it's too long
  if (key.length > 250) {
    return `${prefix}:${crypto.createHash('md5').update(key).digest('hex')}`;
  }
  
  return key;
}

/**
 * Memoize a function with caching
 * 
 * @param {Function} fn - Function to memoize
 * @param {Object} options - Cache options
 * @param {number} options.ttl - Time to live in milliseconds
 * @param {Function} options.keyFn - Function to generate cache key
 * @returns {Function} Memoized function
 */
export function memoize(fn, options = {}) {
  const keyFn = options.keyFn || ((...args) => createKey(fn.name, ...args));
  
  return async function(...args) {
    const key = keyFn(...args);
    
    // Check cache
    const cached = get(key);
    if (cached !== undefined) {
      return cached;
    }
    
    // Call function
    const result = await fn(...args);
    
    // Cache result
    set(key, result, options);
    
    return result;
  };
}