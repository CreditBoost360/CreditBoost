/**
 * Sunny Payment Gateway - Metrics Collector
 * 
 * Collects performance and operational metrics
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to metrics storage
const METRICS_DIR = path.join(__dirname, '../../db/metrics');

// Metrics storage
const metrics = {
  counters: new Map(),
  gauges: new Map(),
  histograms: new Map(),
  timers: new Map()
};

// Metrics metadata
const metricsMetadata = new Map();

/**
 * Initialize metrics collector
 * 
 * @returns {Promise<void>}
 */
export async function initializeMetricsCollector() {
  try {
    // Create metrics directory if it doesn't exist
    try {
      await fs.access(METRICS_DIR);
    } catch (error) {
      await fs.mkdir(METRICS_DIR, { recursive: true });
    }
    
    // Start metrics collection interval
    startMetricsCollection();
    
    console.log('Metrics collector initialized');
  } catch (error) {
    console.error('Failed to initialize metrics collector:', error);
    throw new Error('Failed to initialize metrics collector');
  }
}

/**
 * Start metrics collection interval
 * 
 * @private
 */
function startMetricsCollection() {
  // Collect system metrics every 10 seconds
  setInterval(collectSystemMetrics, 10000);
  
  // Persist metrics every minute
  setInterval(persistMetrics, 60000);
}

/**
 * Collect system metrics
 * 
 * @private
 */
function collectSystemMetrics() {
  try {
    // CPU usage
    const cpus = os.cpus();
    const cpuUsage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((sum, time) => sum + time, 0);
      const idle = cpu.times.idle;
      return acc + (1 - idle / total);
    }, 0) / cpus.length;
    
    // Memory usage
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsage = 1 - freeMemory / totalMemory;
    
    // Update metrics
    gauge('system.cpu.usage', cpuUsage);
    gauge('system.memory.usage', memoryUsage);
    gauge('system.memory.total', totalMemory);
    gauge('system.memory.free', freeMemory);
    gauge('system.uptime', os.uptime());
    gauge('system.load_average', os.loadavg()[0]);
  } catch (error) {
    console.error('Failed to collect system metrics:', error);
  }
}

/**
 * Persist metrics to disk
 * 
 * @private
 */
async function persistMetrics() {
  try {
    const timestamp = new Date().toISOString();
    const metricsData = {
      timestamp,
      counters: Object.fromEntries(metrics.counters),
      gauges: Object.fromEntries(metrics.gauges),
      histograms: Object.fromEntries(
        Array.from(metrics.histograms.entries()).map(([key, values]) => [key, {
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((sum, value) => sum + value, 0) / values.length,
          p95: percentile(values, 95),
          p99: percentile(values, 99),
          count: values.length
        }])
      ),
      timers: Object.fromEntries(
        Array.from(metrics.timers.entries()).map(([key, values]) => [key, {
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((sum, value) => sum + value, 0) / values.length,
          p95: percentile(values, 95),
          p99: percentile(values, 99),
          count: values.length
        }])
      )
    };
    
    // Write metrics to file
    const metricsPath = path.join(METRICS_DIR, `metrics-${timestamp.replace(/:/g, '-')}.json`);
    await fs.writeFile(metricsPath, JSON.stringify(metricsData, null, 2));
    
    // Reset histograms and timers
    metrics.histograms.clear();
    metrics.timers.clear();
  } catch (error) {
    console.error('Failed to persist metrics:', error);
  }
}

/**
 * Calculate percentile
 * 
 * @private
 * @param {Array<number>} values - Values
 * @param {number} p - Percentile (0-100)
 * @returns {number} Percentile value
 */
function percentile(values, p) {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[index];
}

/**
 * Increment counter
 * 
 * @param {string} name - Counter name
 * @param {number} value - Increment value
 * @param {Object} tags - Counter tags
 * @returns {number} New counter value
 */
export function increment(name, value = 1, tags = {}) {
  const key = formatMetricKey(name, tags);
  
  // Initialize counter if it doesn't exist
  if (!metrics.counters.has(key)) {
    metrics.counters.set(key, 0);
    
    // Store metadata
    metricsMetadata.set(key, {
      name,
      type: 'counter',
      tags,
      createdAt: Date.now()
    });
  }
  
  // Increment counter
  const newValue = metrics.counters.get(key) + value;
  metrics.counters.set(key, newValue);
  
  return newValue;
}

/**
 * Decrement counter
 * 
 * @param {string} name - Counter name
 * @param {number} value - Decrement value
 * @param {Object} tags - Counter tags
 * @returns {number} New counter value
 */
export function decrement(name, value = 1, tags = {}) {
  return increment(name, -value, tags);
}

/**
 * Set gauge value
 * 
 * @param {string} name - Gauge name
 * @param {number} value - Gauge value
 * @param {Object} tags - Gauge tags
 * @returns {number} Gauge value
 */
export function gauge(name, value, tags = {}) {
  const key = formatMetricKey(name, tags);
  
  // Store metadata if it doesn't exist
  if (!metricsMetadata.has(key)) {
    metricsMetadata.set(key, {
      name,
      type: 'gauge',
      tags,
      createdAt: Date.now()
    });
  }
  
  // Set gauge value
  metrics.gauges.set(key, value);
  
  return value;
}

/**
 * Record histogram value
 * 
 * @param {string} name - Histogram name
 * @param {number} value - Histogram value
 * @param {Object} tags - Histogram tags
 */
export function histogram(name, value, tags = {}) {
  const key = formatMetricKey(name, tags);
  
  // Initialize histogram if it doesn't exist
  if (!metrics.histograms.has(key)) {
    metrics.histograms.set(key, []);
    
    // Store metadata
    metricsMetadata.set(key, {
      name,
      type: 'histogram',
      tags,
      createdAt: Date.now()
    });
  }
  
  // Add value to histogram
  metrics.histograms.get(key).push(value);
}

/**
 * Start timer
 * 
 * @param {string} name - Timer name
 * @param {Object} tags - Timer tags
 * @returns {Function} Stop timer function
 */
export function startTimer(name, tags = {}) {
  const startTime = process.hrtime.bigint();
  
  // Return stop timer function
  return () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1e6; // Convert to milliseconds
    
    const key = formatMetricKey(name, tags);
    
    // Initialize timer if it doesn't exist
    if (!metrics.timers.has(key)) {
      metrics.timers.set(key, []);
      
      // Store metadata
      metricsMetadata.set(key, {
        name,
        type: 'timer',
        tags,
        createdAt: Date.now()
      });
    }
    
    // Add duration to timer
    metrics.timers.get(key).push(duration);
    
    return duration;
  };
}

/**
 * Format metric key
 * 
 * @private
 * @param {string} name - Metric name
 * @param {Object} tags - Metric tags
 * @returns {string} Metric key
 */
function formatMetricKey(name, tags = {}) {
  if (Object.keys(tags).length === 0) {
    return name;
  }
  
  const tagString = Object.entries(tags)
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join(',');
  
  return `${name}{${tagString}}`;
}

/**
 * Get metrics
 * 
 * @returns {Object} Metrics
 */
export function getMetrics() {
  return {
    counters: Object.fromEntries(metrics.counters),
    gauges: Object.fromEntries(metrics.gauges),
    histograms: Object.fromEntries(
      Array.from(metrics.histograms.entries()).map(([key, values]) => [key, {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((sum, value) => sum + value, 0) / values.length,
        p95: percentile(values, 95),
        p99: percentile(values, 99),
        count: values.length
      }])
    ),
    timers: Object.fromEntries(
      Array.from(metrics.timers.entries()).map(([key, values]) => [key, {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((sum, value) => sum + value, 0) / values.length,
        p95: percentile(values, 95),
        p99: percentile(values, 99),
        count: values.length
      }])
    )
  };
}

/**
 * Get metrics metadata
 * 
 * @returns {Object} Metrics metadata
 */
export function getMetricsMetadata() {
  return Object.fromEntries(metricsMetadata);
}