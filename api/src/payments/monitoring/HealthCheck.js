/**
 * Sunny Payment Gateway - Health Check
 * 
 * Implements health checks for system components
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Health check registry
const healthChecks = new Map();

// Health check results
const healthCheckResults = new Map();

// Health check status
let systemStatus = 'starting';

/**
 * Initialize health check system
 * 
 * @returns {Promise<void>}
 */
export async function initializeHealthChecks() {
  try {
    // Register default health checks
    registerHealthCheck('system', checkSystemHealth);
    registerHealthCheck('filesystem', checkFilesystemHealth);
    registerHealthCheck('memory', checkMemoryHealth);
    
    // Run initial health checks
    await runHealthChecks();
    
    // Start health check interval
    startHealthCheckInterval();
    
    // Set system status to running
    systemStatus = 'running';
    
    console.log('Health check system initialized');
  } catch (error) {
    console.error('Failed to initialize health checks:', error);
    systemStatus = 'error';
    throw new Error('Failed to initialize health checks');
  }
}

/**
 * Start health check interval
 * 
 * @private
 */
function startHealthCheckInterval() {
  // Run health checks every 30 seconds
  setInterval(async () => {
    try {
      await runHealthChecks();
    } catch (error) {
      console.error('Failed to run health checks:', error);
    }
  }, 30000);
}

/**
 * Register health check
 * 
 * @param {string} name - Health check name
 * @param {Function} checkFn - Health check function
 */
export function registerHealthCheck(name, checkFn) {
  healthChecks.set(name, checkFn);
}

/**
 * Run health checks
 * 
 * @returns {Promise<Object>} Health check results
 */
export async function runHealthChecks() {
  const results = {
    timestamp: new Date().toISOString(),
    status: 'ok',
    checks: {}
  };
  
  // Run each health check
  for (const [name, checkFn] of healthChecks.entries()) {
    try {
      const result = await checkFn();
      results.checks[name] = result;
      
      // Update overall status
      if (result.status === 'error') {
        results.status = 'error';
      } else if (result.status === 'warning' && results.status !== 'error') {
        results.status = 'warning';
      }
      
      // Store result
      healthCheckResults.set(name, result);
    } catch (error) {
      console.error(`Health check ${name} failed:`, error);
      
      results.checks[name] = {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
      
      results.status = 'error';
      
      // Store result
      healthCheckResults.set(name, results.checks[name]);
    }
  }
  
  // Update system status
  systemStatus = results.status;
  
  return results;
}

/**
 * Get health check status
 * 
 * @returns {Object} Health check status
 */
export function getHealthStatus() {
  return {
    status: systemStatus,
    timestamp: new Date().toISOString(),
    checks: Object.fromEntries(healthCheckResults)
  };
}

/**
 * Check system health
 * 
 * @private
 * @returns {Promise<Object>} Health check result
 */
async function checkSystemHealth() {
  try {
    // Check CPU load
    const loadAvg = os.loadavg()[0];
    const cpuCount = os.cpus().length;
    const normalizedLoad = loadAvg / cpuCount;
    
    let status = 'ok';
    let message = 'System is healthy';
    
    if (normalizedLoad > 0.8) {
      status = 'error';
      message = `High CPU load: ${loadAvg.toFixed(2)} (${(normalizedLoad * 100).toFixed(0)}%)`;
    } else if (normalizedLoad > 0.5) {
      status = 'warning';
      message = `Elevated CPU load: ${loadAvg.toFixed(2)} (${(normalizedLoad * 100).toFixed(0)}%)`;
    }
    
    return {
      status,
      message,
      metrics: {
        loadAverage: loadAvg,
        cpuCount,
        normalizedLoad,
        uptime: os.uptime()
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      message: `System health check failed: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check filesystem health
 * 
 * @private
 * @returns {Promise<Object>} Health check result
 */
async function checkFilesystemHealth() {
  try {
    // Check if database directory is writable
    const testFile = path.join(__dirname, '../../db/health-check-test.txt');
    
    // Write test file
    await fs.writeFile(testFile, `Health check: ${new Date().toISOString()}`);
    
    // Read test file
    await fs.readFile(testFile, 'utf8');
    
    // Delete test file
    await fs.unlink(testFile);
    
    return {
      status: 'ok',
      message: 'Filesystem is writable',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      message: `Filesystem health check failed: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check memory health
 * 
 * @private
 * @returns {Promise<Object>} Health check result
 */
async function checkMemoryHealth() {
  try {
    // Check memory usage
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = usedMemory / totalMemory;
    
    let status = 'ok';
    let message = 'Memory usage is normal';
    
    if (memoryUsage > 0.9) {
      status = 'error';
      message = `High memory usage: ${(memoryUsage * 100).toFixed(0)}%`;
    } else if (memoryUsage > 0.7) {
      status = 'warning';
      message = `Elevated memory usage: ${(memoryUsage * 100).toFixed(0)}%`;
    }
    
    return {
      status,
      message,
      metrics: {
        totalMemory,
        freeMemory,
        usedMemory,
        memoryUsage
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      message: `Memory health check failed: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check database health
 * 
 * @param {Object} db - Database connection
 * @returns {Promise<Object>} Health check result
 */
export async function checkDatabaseHealth(db) {
  try {
    // Check if database is connected
    const status = db.getDatabaseStatus();
    
    if (!status) {
      return {
        status: 'error',
        message: 'Database connection is not available',
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      status: 'ok',
      message: 'Database connection is healthy',
      details: status,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      message: `Database health check failed: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check cache health
 * 
 * @param {Object} cache - Cache manager
 * @returns {Promise<Object>} Health check result
 */
export async function checkCacheHealth(cache) {
  try {
    // Check if cache is available
    const stats = cache.getStats();
    
    if (!stats) {
      return {
        status: 'error',
        message: 'Cache is not available',
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      status: 'ok',
      message: 'Cache is healthy',
      details: stats,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      message: `Cache health check failed: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}