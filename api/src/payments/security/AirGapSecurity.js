/**
 * Sunny Payment Gateway - Air-Gap Security
 * 
 * Implements air-gapped security for payment processing
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to secure storage
const SECURE_STORAGE_DIR = path.join(__dirname, '../../db/secure');

// Security domains
const SECURITY_DOMAINS = {
  PUBLIC: 'public',
  PROCESSING: 'processing',
  STORAGE: 'storage',
  ADMIN: 'admin'
};

// Current security domain
let currentDomain = SECURITY_DOMAINS.PUBLIC;

// Domain transition log
const domainTransitions = [];

/**
 * Initialize air-gap security
 * 
 * @returns {Promise<void>}
 */
export async function initializeAirGapSecurity() {
  try {
    // Create secure storage directory if it doesn't exist
    try {
      await fs.access(SECURE_STORAGE_DIR);
    } catch (error) {
      await fs.mkdir(SECURE_STORAGE_DIR, { recursive: true });
    }
    
    // Create domain directories
    for (const domain of Object.values(SECURITY_DOMAINS)) {
      const domainDir = path.join(SECURE_STORAGE_DIR, domain);
      try {
        await fs.access(domainDir);
      } catch (error) {
        await fs.mkdir(domainDir, { recursive: true });
      }
    }
    
    // Log initialization
    await logSecurityEvent('SECURITY_INITIALIZED', {
      timestamp: new Date().toISOString()
    });
    
    console.log('Air-gap security initialized');
  } catch (error) {
    console.error('Failed to initialize air-gap security:', error);
    throw new Error('Failed to initialize air-gap security');
  }
}

/**
 * Enter security domain
 * 
 * @param {string} domain - Security domain to enter
 * @param {Object} context - Domain context
 * @returns {Promise<Object>} Domain context
 */
export async function enterSecurityDomain(domain, context = {}) {
  if (!Object.values(SECURITY_DOMAINS).includes(domain)) {
    throw new Error(`Invalid security domain: ${domain}`);
  }
  
  // Log domain transition
  const transition = {
    from: currentDomain,
    to: domain,
    timestamp: new Date().toISOString(),
    context: { ...context }
  };
  
  domainTransitions.push(transition);
  
  // Log security event
  await logSecurityEvent('DOMAIN_TRANSITION', transition);
  
  // Update current domain
  currentDomain = domain;
  
  // Return domain context
  return {
    domain,
    enteredAt: transition.timestamp,
    context: { ...context }
  };
}

/**
 * Exit security domain
 * 
 * @param {Object} result - Domain result
 * @returns {Promise<Object>} Domain result
 */
export async function exitSecurityDomain(result = {}) {
  // Get current domain
  const domain = currentDomain;
  
  // Default to public domain
  currentDomain = SECURITY_DOMAINS.PUBLIC;
  
  // Log domain transition
  const transition = {
    from: domain,
    to: currentDomain,
    timestamp: new Date().toISOString(),
    result: { ...result }
  };
  
  domainTransitions.push(transition);
  
  // Log security event
  await logSecurityEvent('DOMAIN_EXIT', transition);
  
  // Return domain result
  return {
    domain,
    exitedAt: transition.timestamp,
    result: { ...result }
  };
}

/**
 * One-way data transfer between domains
 * 
 * @param {string} fromDomain - Source domain
 * @param {string} toDomain - Destination domain
 * @param {Object} data - Data to transfer
 * @returns {Promise<string>} Transfer ID
 */
export async function oneWayTransfer(fromDomain, toDomain, data) {
  if (!Object.values(SECURITY_DOMAINS).includes(fromDomain)) {
    throw new Error(`Invalid source domain: ${fromDomain}`);
  }
  
  if (!Object.values(SECURITY_DOMAINS).includes(toDomain)) {
    throw new Error(`Invalid destination domain: ${toDomain}`);
  }
  
  // Generate transfer ID
  const transferId = crypto.randomUUID();
  
  // Create transfer object
  const transfer = {
    id: transferId,
    fromDomain,
    toDomain,
    timestamp: new Date().toISOString(),
    data: { ...data }
  };
  
  // Write to destination domain
  const transferPath = path.join(SECURE_STORAGE_DIR, toDomain, `${transferId}.json`);
  await fs.writeFile(transferPath, JSON.stringify(transfer, null, 2));
  
  // Log security event
  await logSecurityEvent('ONE_WAY_TRANSFER', {
    transferId,
    fromDomain,
    toDomain,
    timestamp: transfer.timestamp
  });
  
  return transferId;
}

/**
 * Receive data from one-way transfer
 * 
 * @param {string} transferId - Transfer ID
 * @returns {Promise<Object>} Transfer data
 */
export async function receiveTransfer(transferId) {
  // Check if transfer exists in current domain
  const transferPath = path.join(SECURE_STORAGE_DIR, currentDomain, `${transferId}.json`);
  
  try {
    await fs.access(transferPath);
  } catch (error) {
    throw new Error(`Transfer ${transferId} not found in domain ${currentDomain}`);
  }
  
  // Read transfer data
  const transferData = await fs.readFile(transferPath, 'utf8');
  const transfer = JSON.parse(transferData);
  
  // Verify transfer is for current domain
  if (transfer.toDomain !== currentDomain) {
    throw new Error(`Transfer ${transferId} is not for domain ${currentDomain}`);
  }
  
  // Log security event
  await logSecurityEvent('TRANSFER_RECEIVED', {
    transferId,
    fromDomain: transfer.fromDomain,
    toDomain: transfer.toDomain,
    timestamp: new Date().toISOString()
  });
  
  // Delete transfer file
  await fs.unlink(transferPath);
  
  return transfer.data;
}

/**
 * Secure operation in isolated domain
 * 
 * @param {string} domain - Security domain
 * @param {Function} operation - Operation to perform
 * @param {Object} context - Operation context
 * @returns {Promise<Object>} Operation result
 */
export async function secureOperation(domain, operation, context = {}) {
  // Enter domain
  await enterSecurityDomain(domain, context);
  
  try {
    // Perform operation
    const result = await operation(context);
    
    // Exit domain
    await exitSecurityDomain({ success: true });
    
    return result;
  } catch (error) {
    // Exit domain with error
    await exitSecurityDomain({ success: false, error: error.message });
    
    throw error;
  }
}

/**
 * Log security event
 * 
 * @param {string} eventType - Event type
 * @param {Object} eventData - Event data
 * @returns {Promise<void>}
 */
async function logSecurityEvent(eventType, eventData = {}) {
  try {
    // Create event object
    const event = {
      id: crypto.randomUUID(),
      type: eventType,
      timestamp: new Date().toISOString(),
      domain: currentDomain,
      data: { ...eventData }
    };
    
    // Write to security log
    const logPath = path.join(SECURE_STORAGE_DIR, 'security_log.jsonl');
    await fs.appendFile(logPath, JSON.stringify(event) + '\n');
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Get security domain transitions
 * 
 * @returns {Array} Domain transitions
 */
export function getDomainTransitions() {
  return [...domainTransitions];
}

/**
 * Get current security domain
 * 
 * @returns {string} Current domain
 */
export function getCurrentDomain() {
  return currentDomain;
}

/**
 * Get security domains
 * 
 * @returns {Object} Security domains
 */
export function getSecurityDomains() {
  return { ...SECURITY_DOMAINS };
}

/**
 * Create secure channel between domains
 * 
 * @param {string} domain1 - First domain
 * @param {string} domain2 - Second domain
 * @returns {Object} Secure channel
 */
export function createSecureChannel(domain1, domain2) {
  if (!Object.values(SECURITY_DOMAINS).includes(domain1)) {
    throw new Error(`Invalid domain: ${domain1}`);
  }
  
  if (!Object.values(SECURITY_DOMAINS).includes(domain2)) {
    throw new Error(`Invalid domain: ${domain2}`);
  }
  
  // Generate channel ID
  const channelId = crypto.randomUUID();
  
  // Return secure channel
  return {
    channelId,
    domains: [domain1, domain2],
    async send(data) {
      return oneWayTransfer(domain1, domain2, data);
    },
    async receive(transferId) {
      return receiveTransfer(transferId);
    }
  };
}