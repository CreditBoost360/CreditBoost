/**
 * Sunny Payment Gateway - Fraud Detection Module
 * 
 * Advanced fraud detection system for payment transactions
 */

import { RISK_LEVELS } from './constants.js';
import { maskSensitiveData } from './encryption.js';

// Risk scoring thresholds
const RISK_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 70
};

// Fraud detection rules and weights
const FRAUD_RULES = {
  // Location-based rules
  IP_COUNTRY_MISMATCH: {
    weight: 25,
    description: 'IP country does not match billing country'
  },
  HIGH_RISK_COUNTRY: {
    weight: 20,
    description: 'Transaction from high-risk country'
  },
  IP_PROXY_VPN: {
    weight: 30,
    description: 'IP address is from proxy or VPN'
  },
  LOCATION_VELOCITY: {
    weight: 40,
    description: 'Unusual location change velocity'
  },
  
  // Amount-based rules
  UNUSUAL_AMOUNT: {
    weight: 15,
    description: 'Transaction amount is unusual for customer'
  },
  AMOUNT_VELOCITY: {
    weight: 25,
    description: 'Unusual increase in transaction amounts'
  },
  ROUND_AMOUNT: {
    weight: 5,
    description: 'Suspiciously round amount'
  },
  
  // Frequency-based rules
  TRANSACTION_FREQUENCY: {
    weight: 20,
    description: 'Unusual transaction frequency'
  },
  MULTIPLE_CURRENCIES: {
    weight: 15,
    description: 'Multiple currencies in short timeframe'
  },
  MULTIPLE_CARDS: {
    weight: 35,
    description: 'Multiple cards used in short timeframe'
  },
  
  // Card-specific rules
  BIN_COUNTRY_MISMATCH: {
    weight: 30,
    description: 'Card BIN country does not match billing country'
  },
  CARD_TESTING: {
    weight: 45,
    description: 'Pattern suggests card testing'
  },
  
  // Customer data rules
  EMAIL_DOMAIN_TEMPORARY: {
    weight: 25,
    description: 'Email uses temporary/disposable domain'
  },
  EMAIL_FIRST_SEEN: {
    weight: 10,
    description: 'Email address first seen recently'
  },
  CUSTOMER_DATA_MISMATCH: {
    weight: 20,
    description: 'Customer data inconsistencies'
  },
  
  // Device rules
  DEVICE_FINGERPRINT_VELOCITY: {
    weight: 35,
    description: 'Multiple accounts using same device'
  },
  BROWSER_ANOMALIES: {
    weight: 15,
    description: 'Browser/device anomalies detected'
  },
  
  // Historical patterns
  PREVIOUS_CHARGEBACK: {
    weight: 50,
    description: 'Previous chargeback on customer or card'
  },
  PREVIOUS_DECLINE: {
    weight: 20,
    description: 'Recent declined transactions'
  },
  PREVIOUS_FRAUD: {
    weight: 80,
    description: 'Previous confirmed fraud'
  }
};

// High-risk countries list (example)
const HIGH_RISK_COUNTRIES = [
  'XX', 'YY', 'ZZ' // Replace with actual high-risk countries
];

// Temporary email domains (example)
const TEMPORARY_EMAIL_DOMAINS = [
  'tempmail.com', 'disposable.com', 'mailinator.com', 
  'guerrillamail.com', 'throwawaymail.com'
];

/**
 * Detect potential fraud in a payment transaction
 * 
 * @param {Object} transactionData - Transaction data to analyze
 * @returns {Promise<Object>} Fraud detection result
 */
export async function detectFraud(transactionData) {
  try {
    // Initialize risk score
    let riskScore = 0;
    const triggeredRules = [];
    
    // Get customer history (in a real implementation, this would query a database)
    const customerHistory = await getCustomerHistory(transactionData.customer);
    
    // Apply fraud detection rules
    
    // === Location-based checks ===
    if (transactionData.ipAddress && transactionData.customer?.address?.country) {
      const ipCountry = await getCountryFromIP(transactionData.ipAddress);
      
      if (ipCountry && ipCountry !== transactionData.customer.address.country) {
        riskScore += FRAUD_RULES.IP_COUNTRY_MISMATCH.weight;
        triggeredRules.push(FRAUD_RULES.IP_COUNTRY_MISMATCH.description);
      }
    }
    
    if (transactionData.customer?.address?.country && 
        HIGH_RISK_COUNTRIES.includes(transactionData.customer.address.country)) {
      riskScore += FRAUD_RULES.HIGH_RISK_COUNTRY.weight;
      triggeredRules.push(FRAUD_RULES.HIGH_RISK_COUNTRY.description);
    }
    
    if (transactionData.ipAddress && await isProxyOrVPN(transactionData.ipAddress)) {
      riskScore += FRAUD_RULES.IP_PROXY_VPN.weight;
      triggeredRules.push(FRAUD_RULES.IP_PROXY_VPN.description);
    }
    
    if (customerHistory.lastTransactionCountry && 
        transactionData.customer?.address?.country !== customerHistory.lastTransactionCountry &&
        customerHistory.timeSinceLastTransaction < 24) { // Less than 24 hours
      riskScore += FRAUD_RULES.LOCATION_VELOCITY.weight;
      triggeredRules.push(FRAUD_RULES.LOCATION_VELOCITY.description);
    }
    
    // === Amount-based checks ===
    if (customerHistory.averageTransactionAmount && 
        transactionData.amount > customerHistory.averageTransactionAmount * 3) {
      riskScore += FRAUD_RULES.UNUSUAL_AMOUNT.weight;
      triggeredRules.push(FRAUD_RULES.UNUSUAL_AMOUNT.description);
    }
    
    if (customerHistory.lastTransactionAmount && 
        transactionData.amount > customerHistory.lastTransactionAmount * 5 &&
        customerHistory.timeSinceLastTransaction < 48) { // Less than 48 hours
      riskScore += FRAUD_RULES.AMOUNT_VELOCITY.weight;
      triggeredRules.push(FRAUD_RULES.AMOUNT_VELOCITY.description);
    }
    
    if (transactionData.amount % 100 === 0 && transactionData.amount >= 1000) {
      riskScore += FRAUD_RULES.ROUND_AMOUNT.weight;
      triggeredRules.push(FRAUD_RULES.ROUND_AMOUNT.description);
    }
    
    // === Frequency-based checks ===
    if (customerHistory.transactionsLast24Hours > 5) {
      riskScore += FRAUD_RULES.TRANSACTION_FREQUENCY.weight;
      triggeredRules.push(FRAUD_RULES.TRANSACTION_FREQUENCY.description);
    }
    
    if (customerHistory.uniqueCurrenciesLast24Hours > 2) {
      riskScore += FRAUD_RULES.MULTIPLE_CURRENCIES.weight;
      triggeredRules.push(FRAUD_RULES.MULTIPLE_CURRENCIES.description);
    }
    
    if (customerHistory.uniqueCardsLast24Hours > 2) {
      riskScore += FRAUD_RULES.MULTIPLE_CARDS.weight;
      triggeredRules.push(FRAUD_RULES.MULTIPLE_CARDS.description);
    }
    
    // === Card-specific checks ===
    if (transactionData.paymentMethod === 'card' && transactionData.card) {
      const cardBinCountry = await getCardBinCountry(transactionData.card.number);
      
      if (cardBinCountry && 
          transactionData.customer?.address?.country && 
          cardBinCountry !== transactionData.customer.address.country) {
        riskScore += FRAUD_RULES.BIN_COUNTRY_MISMATCH.weight;
        triggeredRules.push(FRAUD_RULES.BIN_COUNTRY_MISMATCH.description);
      }
      
      if (customerHistory.smallTransactionsFollowedByLarge) {
        riskScore += FRAUD_RULES.CARD_TESTING.weight;
        triggeredRules.push(FRAUD_RULES.CARD_TESTING.description);
      }
    }
    
    // === Customer data checks ===
    if (transactionData.customer?.email) {
      const emailDomain = transactionData.customer.email.split('@')[1];
      
      if (TEMPORARY_EMAIL_DOMAINS.includes(emailDomain)) {
        riskScore += FRAUD_RULES.EMAIL_DOMAIN_TEMPORARY.weight;
        triggeredRules.push(FRAUD_RULES.EMAIL_DOMAIN_TEMPORARY.description);
      }
      
      if (customerHistory.emailFirstSeenDays < 1) {
        riskScore += FRAUD_RULES.EMAIL_FIRST_SEEN.weight;
        triggeredRules.push(FRAUD_RULES.EMAIL_FIRST_SEEN.description);
      }
    }
    
    if (customerHistory.dataInconsistencies) {
      riskScore += FRAUD_RULES.CUSTOMER_DATA_MISMATCH.weight;
      triggeredRules.push(FRAUD_RULES.CUSTOMER_DATA_MISMATCH.description);
    }
    
    // === Device checks ===
    if (transactionData.deviceFingerprint) {
      if (customerHistory.accountsOnDevice > 3) {
        riskScore += FRAUD_RULES.DEVICE_FINGERPRINT_VELOCITY.weight;
        triggeredRules.push(FRAUD_RULES.DEVICE_FINGERPRINT_VELOCITY.description);
      }
      
      if (customerHistory.browserAnomalies) {
        riskScore += FRAUD_RULES.BROWSER_ANOMALIES.weight;
        triggeredRules.push(FRAUD_RULES.BROWSER_ANOMALIES.description);
      }
    }
    
    // === Historical pattern checks ===
    if (customerHistory.previousChargebacks > 0) {
      riskScore += FRAUD_RULES.PREVIOUS_CHARGEBACK.weight;
      triggeredRules.push(FRAUD_RULES.PREVIOUS_CHARGEBACK.description);
    }
    
    if (customerHistory.recentDeclines > 1) {
      riskScore += FRAUD_RULES.PREVIOUS_DECLINE.weight;
      triggeredRules.push(FRAUD_RULES.PREVIOUS_DECLINE.description);
    }
    
    if (customerHistory.previousFraud) {
      riskScore += FRAUD_RULES.PREVIOUS_FRAUD.weight;
      triggeredRules.push(FRAUD_RULES.PREVIOUS_FRAUD.description);
    }
    
    // Determine risk level based on score
    let riskLevel;
    if (riskScore < RISK_THRESHOLDS.LOW) {
      riskLevel = RISK_LEVELS.LOW;
    } else if (riskScore < RISK_THRESHOLDS.MEDIUM) {
      riskLevel = RISK_LEVELS.MEDIUM;
    } else {
      riskLevel = RISK_LEVELS.HIGH;
    }
    
    // Determine if transaction should be flagged as fraudulent
    const isFraudulent = riskLevel === RISK_LEVELS.HIGH || 
                         triggeredRules.includes(FRAUD_RULES.PREVIOUS_FRAUD.description);
    
    // Log fraud detection results (in a real implementation, this would be more sophisticated)
    console.log(`Fraud detection for transaction ${transactionData.transactionId}:`, {
      riskScore,
      riskLevel,
      isFraudulent,
      triggeredRules
    });
    
    return {
      isFraudulent,
      riskScore,
      riskLevel,
      reason: isFraudulent ? triggeredRules[0] : null,
      triggeredRules
    };
  } catch (error) {
    console.error('Fraud detection error:', error);
    
    // Default to allowing the transaction if fraud detection fails
    return {
      isFraudulent: false,
      riskScore: 0,
      riskLevel: RISK_LEVELS.LOW,
      reason: null,
      triggeredRules: [],
      error: error.message
    };
  }
}

/**
 * Get customer transaction history
 * 
 * @param {Object} customer - Customer data
 * @returns {Promise<Object>} Customer history data
 */
async function getCustomerHistory(customer) {
  // In a real implementation, this would query a database
  // For this example, we'll return mock data
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    // Transaction patterns
    transactionsLast24Hours: Math.floor(Math.random() * 5),
    transactionsLast7Days: Math.floor(Math.random() * 20),
    averageTransactionAmount: 150 + Math.random() * 300,
    lastTransactionAmount: 100 + Math.random() * 200,
    lastTransactionCountry: customer?.address?.country || null,
    timeSinceLastTransaction: Math.floor(Math.random() * 72), // Hours
    
    // Currency and payment method patterns
    uniqueCurrenciesLast24Hours: Math.floor(Math.random() * 3),
    uniqueCardsLast24Hours: Math.floor(Math.random() * 3),
    
    // Card testing patterns
    smallTransactionsFollowedByLarge: Math.random() > 0.9,
    
    // Customer data patterns
    emailFirstSeenDays: Math.floor(Math.random() * 30),
    dataInconsistencies: Math.random() > 0.9,
    
    // Device patterns
    accountsOnDevice: Math.floor(Math.random() * 5),
    browserAnomalies: Math.random() > 0.9,
    
    // Historical issues
    previousChargebacks: Math.random() > 0.95 ? 1 : 0,
    recentDeclines: Math.floor(Math.random() * 3),
    previousFraud: Math.random() > 0.98
  };
}

/**
 * Get country from IP address
 * 
 * @param {string} ipAddress - IP address to geolocate
 * @returns {Promise<string|null>} Country code or null
 */
async function getCountryFromIP(ipAddress) {
  // In a real implementation, this would call a geolocation service
  // For this example, we'll return a mock result
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Return random country code for demonstration
  const countries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR'];
  return countries[Math.floor(Math.random() * countries.length)];
}

/**
 * Check if IP address is from proxy or VPN
 * 
 * @param {string} ipAddress - IP address to check
 * @returns {Promise<boolean>} True if IP is proxy/VPN
 */
async function isProxyOrVPN(ipAddress) {
  // In a real implementation, this would call a proxy/VPN detection service
  // For this example, we'll return a mock result
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // 5% chance of being a proxy/VPN for demonstration
  return Math.random() < 0.05;
}

/**
 * Get country from card BIN
 * 
 * @param {string} cardNumber - Card number to check
 * @returns {Promise<string|null>} Country code or null
 */
async function getCardBinCountry(cardNumber) {
  // In a real implementation, this would call a BIN lookup service
  // For this example, we'll return a mock result
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Return random country code for demonstration
  const countries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR'];
  return countries[Math.floor(Math.random() * countries.length)];
}

/**
 * Check if transaction matches known fraud patterns
 * 
 * @param {Object} transactionData - Transaction data to analyze
 * @returns {Promise<boolean>} True if matches fraud pattern
 */
async function matchesFraudPattern(transactionData) {
  // In a real implementation, this would check against known fraud patterns
  // For this example, we'll return a mock result
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 30));
  
  // 2% chance of matching fraud pattern for demonstration
  return Math.random() < 0.02;
}

/**
 * Analyze transaction velocity for a customer
 * 
 * @param {string} customerId - Customer ID
 * @param {Object} transactionData - Current transaction data
 * @returns {Promise<Object>} Velocity analysis result
 */
async function analyzeVelocity(customerId, transactionData) {
  // In a real implementation, this would analyze recent transaction patterns
  // For this example, we'll return mock data
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 40));
  
  return {
    isAnomalous: Math.random() < 0.1,
    velocityScore: Math.floor(Math.random() * 100),
    recentTransactions: Math.floor(Math.random() * 10)
  };
}

/**
 * Get device reputation score
 * 
 * @param {string} deviceFingerprint - Device fingerprint
 * @returns {Promise<number>} Reputation score (0-100)
 */
async function getDeviceReputation(deviceFingerprint) {
  // In a real implementation, this would check device reputation
  // For this example, we'll return a mock score
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 30));
  
  // Return random score between 0-100
  return Math.floor(Math.random() * 100);
}