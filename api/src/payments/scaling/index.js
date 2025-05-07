/**
 * Sunny Payment Gateway - Scaling Module
 * 
 * Exports high-performance scaling components
 */

import * as DatabaseConnector from './DatabaseConnector.js';
import * as AsyncProcessor from './AsyncProcessor.js';
import * as CacheManager from './CacheManager.js';
import * as LoadBalancer from './LoadBalancer.js';

export {
  DatabaseConnector,
  AsyncProcessor,
  CacheManager,
  LoadBalancer
};

/**
 * Initialize all scaling components
 * 
 * @param {Object} options - Initialization options
 * @returns {Promise<void>}
 */
export async function initialize(options = {}) {
  try {
    // Initialize components
    await DatabaseConnector.initializeDatabase();
    await AsyncProcessor.initializeAsyncProcessor();
    CacheManager.initializeCache();
    
    // Initialize load balancer if enabled
    if (options.loadBalancing) {
      await LoadBalancer.initializeLoadBalancer(options.loadBalancer);
    }
    
    console.log('Scaling components initialized');
  } catch (error) {
    console.error('Failed to initialize scaling components:', error);
    throw error;
  }
}