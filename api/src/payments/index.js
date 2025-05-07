/**
 * Sunny Payment Gateway - Main Entry Point
 * 
 * Exports all payment gateway components
 */

import SunnyPaymentGateway from './SunnyPaymentGateway.js';
import paymentRoutes from './routes.js';
import * as constants from './constants.js';
import * as encryption from './encryption.js';
import * as validation from './validation/index.js';
import * as fraudDetection from './fraudDetection.js';
import * as database from './database/index.js';
import * as security from './security/index.js';
import * as backup from './backup/index.js';
import * as scaling from './scaling/index.js';
import * as monitoring from './monitoring/index.js';
import adminRouter from './admin/index.js';
import backupRouter from './backup/index.js';

/**
 * Initialize all components
 * 
 * @param {Object} options - Initialization options
 * @returns {Promise<void>}
 */
export async function initialize(options = {}) {
  try {
    // Initialize components in order
    await database.initialize();
    await security.initializeSecurity();
    await scaling.initialize(options.scaling);
    await monitoring.initializeMonitoring(options.monitoring);
    
    console.log('Sunny Payment Gateway initialized');
  } catch (error) {
    console.error('Failed to initialize Sunny Payment Gateway:', error);
    throw error;
  }
}

export {
  SunnyPaymentGateway,
  paymentRoutes,
  constants,
  encryption,
  validation,
  fraudDetection,
  database,
  security,
  backup,
  scaling,
  monitoring,
  adminRouter,
  backupRouter
};

export default SunnyPaymentGateway;