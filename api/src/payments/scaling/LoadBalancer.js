/**
 * Sunny Payment Gateway - Load Balancer
 * 
 * Implements internal load balancing for high availability
 */

import cluster from 'cluster';
import os from 'os';
import { EventEmitter } from 'events';

// Number of CPUs
const numCPUs = os.cpus().length;

// Event emitter for load balancer events
const eventEmitter = new EventEmitter();

// Worker status
const workers = new Map();

// Load balancer status
const status = {
  active: false,
  workers: 0,
  totalRequests: 0,
  requestsPerWorker: new Map(),
  startTime: null
};

/**
 * Initialize load balancer
 * 
 * @param {Object} options - Load balancer options
 * @returns {Promise<void>}
 */
export async function initializeLoadBalancer(options = {}) {
  if (!cluster.isPrimary) {
    return;
  }
  
  const workerCount = options.workers || numCPUs;
  
  console.log(`Initializing load balancer with ${workerCount} workers`);
  
  // Set status
  status.active = true;
  status.startTime = Date.now();
  
  // Fork workers
  for (let i = 0; i < workerCount; i++) {
    forkWorker();
  }
  
  // Listen for worker events
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
    
    // Remove worker from status
    workers.delete(worker.id);
    status.workers--;
    status.requestsPerWorker.delete(worker.id);
    
    // Emit event
    eventEmitter.emit('worker:exit', { workerId: worker.id, code, signal });
    
    // Fork a new worker
    forkWorker();
  });
  
  // Listen for worker messages
  cluster.on('message', (worker, message) => {
    if (message.type === 'worker:status') {
      // Update worker status
      workers.set(worker.id, {
        id: worker.id,
        pid: worker.process.pid,
        status: message.status,
        lastUpdate: Date.now()
      });
      
      // Update request count
      if (message.status.requests) {
        status.requestsPerWorker.set(worker.id, message.status.requests);
        status.totalRequests = Array.from(status.requestsPerWorker.values())
          .reduce((sum, count) => sum + count, 0);
      }
    }
  });
  
  // Start health check interval
  startHealthCheck();
  
  console.log('Load balancer initialized');
}

/**
 * Fork a new worker
 * 
 * @private
 */
function forkWorker() {
  const worker = cluster.fork();
  
  // Initialize worker status
  workers.set(worker.id, {
    id: worker.id,
    pid: worker.process.pid,
    status: 'starting',
    lastUpdate: Date.now()
  });
  
  status.workers++;
  status.requestsPerWorker.set(worker.id, 0);
  
  // Emit event
  eventEmitter.emit('worker:fork', { workerId: worker.id, pid: worker.process.pid });
  
  console.log(`Worker ${worker.process.pid} started`);
}

/**
 * Start health check interval
 * 
 * @private
 */
function startHealthCheck() {
  setInterval(() => {
    const now = Date.now();
    
    // Check each worker
    for (const [id, worker] of workers.entries()) {
      // Check if worker is responsive
      if (now - worker.lastUpdate > 30000) {
        console.warn(`Worker ${worker.pid} is unresponsive, killing it`);
        
        // Kill worker
        const clusterWorker = cluster.workers[id];
        if (clusterWorker) {
          clusterWorker.kill();
        }
      }
    }
  }, 10000); // Check every 10 seconds
}

/**
 * Get load balancer status
 * 
 * @returns {Object} Load balancer status
 */
export function getStatus() {
  return {
    active: status.active,
    workers: status.workers,
    totalRequests: status.totalRequests,
    uptime: status.startTime ? Date.now() - status.startTime : 0,
    workerStatus: Array.from(workers.values())
  };
}

/**
 * Subscribe to load balancer events
 * 
 * @param {string} event - Event name
 * @param {Function} callback - Event callback
 * @returns {Function} Unsubscribe function
 */
export function subscribeToEvents(event, callback) {
  eventEmitter.on(event, callback);
  
  // Return unsubscribe function
  return () => {
    eventEmitter.off(event, callback);
  };
}

/**
 * Report worker status
 * 
 * @param {Object} status - Worker status
 */
export function reportWorkerStatus(status) {
  if (cluster.isPrimary) {
    return;
  }
  
  // Send status to primary
  process.send({
    type: 'worker:status',
    status: {
      ...status,
      pid: process.pid
    }
  });
}

/**
 * Gracefully shutdown worker
 * 
 * @param {Function} callback - Callback to run before shutdown
 */
export function gracefulShutdown(callback) {
  if (cluster.isPrimary) {
    return;
  }
  
  // Run callback
  if (callback) {
    callback();
  }
  
  // Disconnect from cluster
  cluster.worker.disconnect();
  
  // Set timeout to force exit if disconnect takes too long
  setTimeout(() => {
    console.warn('Forcing worker exit after timeout');
    process.exit(1);
  }, 5000);
}