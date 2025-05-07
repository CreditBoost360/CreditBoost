/**
 * Sunny Payment Gateway - Monitoring Module
 * 
 * Exports monitoring components
 */

import * as MetricsCollector from './MetricsCollector.js';
import * as HealthCheck from './HealthCheck.js';

export {
  MetricsCollector,
  HealthCheck
};

/**
 * Initialize monitoring components
 * 
 * @param {Object} options - Initialization options
 * @returns {Promise<void>}
 */
export async function initializeMonitoring(options = {}) {
  try {
    // Initialize components
    await MetricsCollector.initializeMetricsCollector();
    await HealthCheck.initializeHealthChecks();
    
    console.log('Monitoring components initialized');
  } catch (error) {
    console.error('Failed to initialize monitoring components:', error);
    throw error;
  }
}

/**
 * Create monitoring middleware
 * 
 * @returns {Function} Express middleware
 */
export function createMonitoringMiddleware() {
  return (req, res, next) => {
    // Start request timer
    const stopTimer = MetricsCollector.startTimer('http.request.duration', {
      method: req.method,
      path: req.path
    });
    
    // Increment request counter
    MetricsCollector.increment('http.requests.total', 1, {
      method: req.method,
      path: req.path
    });
    
    // Track response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      // Restore original end
      res.end = originalEnd;
      
      // Call original end
      res.end(chunk, encoding);
      
      // Stop timer
      const duration = stopTimer();
      
      // Record response metrics
      MetricsCollector.increment('http.responses.total', 1, {
        method: req.method,
        path: req.path,
        status: res.statusCode
      });
      
      // Record response size
      if (res.getHeader('content-length')) {
        MetricsCollector.histogram('http.response.size', parseInt(res.getHeader('content-length'), 10), {
          method: req.method,
          path: req.path
        });
      }
      
      // Record response time histogram
      MetricsCollector.histogram('http.response.time', duration, {
        method: req.method,
        path: req.path,
        status: res.statusCode
      });
    };
    
    next();
  };
}

/**
 * Create health check routes
 * 
 * @param {Object} router - Express router
 * @param {Object} options - Route options
 * @returns {Object} Router with health check routes
 */
export function createHealthCheckRoutes(router, options = {}) {
  // Health check endpoint
  router.get('/health', async (req, res) => {
    const health = await HealthCheck.runHealthChecks();
    
    // Set status code based on health status
    const statusCode = health.status === 'ok' ? 200 : 
                      health.status === 'warning' ? 200 : 503;
    
    res.status(statusCode).json(health);
  });
  
  // Liveness probe endpoint
  router.get('/health/liveness', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });
  
  // Readiness probe endpoint
  router.get('/health/readiness', async (req, res) => {
    const health = HealthCheck.getHealthStatus();
    
    // Set status code based on health status
    const statusCode = health.status === 'ok' ? 200 : 
                      health.status === 'warning' ? 200 : 503;
    
    res.status(statusCode).json(health);
  });
  
  // Metrics endpoint
  router.get('/metrics', (req, res) => {
    const metrics = MetricsCollector.getMetrics();
    res.json(metrics);
  });
  
  return router;
}