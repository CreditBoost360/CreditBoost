/**
 * Sunny Payment Gateway - Transaction Logger
 * 
 * Handles logging and retrieving transaction records
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { maskSensitiveData } from './encryption.js';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to transaction log file
const TRANSACTION_LOG_PATH = path.join(__dirname, '../db/transactions.json');

/**
 * Initialize transaction log file if it doesn't exist
 */
async function initializeTransactionLog() {
  try {
    // Check if directory exists
    const dbDir = path.join(__dirname, '../db');
    try {
      await fs.access(dbDir);
    } catch (error) {
      // Create directory if it doesn't exist
      await fs.mkdir(dbDir, { recursive: true });
    }
    
    // Check if file exists
    try {
      await fs.access(TRANSACTION_LOG_PATH);
    } catch (error) {
      // Create file with empty array if it doesn't exist
      await fs.writeFile(TRANSACTION_LOG_PATH, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('Failed to initialize transaction log:', error);
    throw new Error('Failed to initialize transaction log');
  }
}

/**
 * Read transaction log
 * 
 * @returns {Promise<Array>} Array of transaction records
 */
async function readTransactionLog() {
  try {
    await initializeTransactionLog();
    const data = await fs.readFile(TRANSACTION_LOG_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read transaction log:', error);
    throw new Error('Failed to read transaction log');
  }
}

/**
 * Write transaction log
 * 
 * @param {Array} transactions - Array of transaction records
 * @returns {Promise<void>}
 */
async function writeTransactionLog(transactions) {
  try {
    await fs.writeFile(TRANSACTION_LOG_PATH, JSON.stringify(transactions, null, 2));
  } catch (error) {
    console.error('Failed to write transaction log:', error);
    throw new Error('Failed to write transaction log');
  }
}

/**
 * Log a transaction
 * 
 * @param {Object} transaction - Transaction data to log
 * @returns {Promise<void>}
 */
export async function logTransaction(transaction) {
  try {
    // Validate required fields
    if (!transaction.transactionId || !transaction.merchantId) {
      throw new Error('Transaction ID and merchant ID are required');
    }
    
    // Read existing transactions
    const transactions = await readTransactionLog();
    
    // Add timestamp if not provided
    if (!transaction.timestamp) {
      transaction.timestamp = new Date().toISOString();
    }
    
    // Mask sensitive data for logging
    const sanitizedTransaction = sanitizeTransactionData(transaction);
    
    // Add transaction to log
    transactions.push(sanitizedTransaction);
    
    // Write updated log
    await writeTransactionLog(transactions);
    
    console.log(`Transaction logged: ${transaction.transactionId}`);
  } catch (error) {
    console.error('Failed to log transaction:', error);
    throw new Error('Failed to log transaction');
  }
}

/**
 * Get transaction by ID
 * 
 * @param {string} transactionId - ID of transaction to retrieve
 * @returns {Promise<Object|null>} Transaction data or null if not found
 */
export async function getTransactionById(transactionId) {
  try {
    const transactions = await readTransactionLog();
    return transactions.find(t => t.transactionId === transactionId) || null;
  } catch (error) {
    console.error('Failed to get transaction:', error);
    throw new Error('Failed to get transaction');
  }
}

/**
 * Get transactions by merchant ID
 * 
 * @param {string} merchantId - Merchant ID to filter by
 * @param {Object} options - Filter options
 * @param {number} options.limit - Maximum number of transactions to return
 * @param {number} options.offset - Number of transactions to skip
 * @param {string} options.status - Filter by transaction status
 * @param {string} options.startDate - Filter by start date (ISO string)
 * @param {string} options.endDate - Filter by end date (ISO string)
 * @returns {Promise<Array>} Array of transaction records
 */
export async function getTransactionsByMerchant(merchantId, options = {}) {
  try {
    const transactions = await readTransactionLog();
    
    // Filter by merchant ID
    let filtered = transactions.filter(t => t.merchantId === merchantId);
    
    // Apply additional filters
    if (options.status) {
      filtered = filtered.filter(t => t.status === options.status);
    }
    
    if (options.startDate) {
      const startDate = new Date(options.startDate).getTime();
      filtered = filtered.filter(t => new Date(t.timestamp).getTime() >= startDate);
    }
    
    if (options.endDate) {
      const endDate = new Date(options.endDate).getTime();
      filtered = filtered.filter(t => new Date(t.timestamp).getTime() <= endDate);
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || filtered.length;
    
    return filtered.slice(offset, offset + limit);
  } catch (error) {
    console.error('Failed to get transactions by merchant:', error);
    throw new Error('Failed to get transactions by merchant');
  }
}

/**
 * Get transaction statistics for a merchant
 * 
 * @param {string} merchantId - Merchant ID
 * @param {Object} options - Filter options
 * @param {string} options.startDate - Start date (ISO string)
 * @param {string} options.endDate - End date (ISO string)
 * @returns {Promise<Object>} Transaction statistics
 */
export async function getTransactionStats(merchantId, options = {}) {
  try {
    // Get filtered transactions
    const transactions = await getTransactionsByMerchant(merchantId, options);
    
    // Calculate statistics
    const stats = {
      totalCount: transactions.length,
      totalAmount: 0,
      successCount: 0,
      failureCount: 0,
      refundCount: 0,
      averageAmount: 0,
      byStatus: {},
      byPaymentMethod: {},
      byCurrency: {}
    };
    
    // Process transactions
    transactions.forEach(t => {
      // Count by status
      stats.byStatus[t.status] = (stats.byStatus[t.status] || 0) + 1;
      
      // Count by payment method
      if (t.paymentMethod) {
        stats.byPaymentMethod[t.paymentMethod] = (stats.byPaymentMethod[t.paymentMethod] || 0) + 1;
      }
      
      // Count by currency
      if (t.currency) {
        if (!stats.byCurrency[t.currency]) {
          stats.byCurrency[t.currency] = {
            count: 0,
            total: 0
          };
        }
        stats.byCurrency[t.currency].count += 1;
        stats.byCurrency[t.currency].total += t.amount || 0;
      }
      
      // Calculate totals
      if (t.status === 'completed') {
        stats.successCount += 1;
        stats.totalAmount += t.amount || 0;
      } else if (t.status === 'failed' || t.status === 'rejected' || t.status === 'error') {
        stats.failureCount += 1;
      } else if (t.status === 'refunded' || t.status === 'partially_refunded') {
        stats.refundCount += 1;
      }
    });
    
    // Calculate average amount
    if (stats.successCount > 0) {
      stats.averageAmount = stats.totalAmount / stats.successCount;
    }
    
    return stats;
  } catch (error) {
    console.error('Failed to get transaction statistics:', error);
    throw new Error('Failed to get transaction statistics');
  }
}

/**
 * Search transactions
 * 
 * @param {Object} searchParams - Search parameters
 * @param {string} searchParams.transactionId - Search by transaction ID
 * @param {string} searchParams.merchantId - Search by merchant ID
 * @param {string} searchParams.status - Search by status
 * @param {string} searchParams.paymentMethod - Search by payment method
 * @param {string} searchParams.currency - Search by currency
 * @param {number} searchParams.minAmount - Minimum amount
 * @param {number} searchParams.maxAmount - Maximum amount
 * @param {string} searchParams.startDate - Start date (ISO string)
 * @param {string} searchParams.endDate - End date (ISO string)
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of results
 * @param {number} options.offset - Number of results to skip
 * @returns {Promise<Array>} Array of matching transactions
 */
export async function searchTransactions(searchParams, options = {}) {
  try {
    const transactions = await readTransactionLog();
    
    // Apply filters
    let filtered = transactions;
    
    if (searchParams.transactionId) {
      filtered = filtered.filter(t => t.transactionId.includes(searchParams.transactionId));
    }
    
    if (searchParams.merchantId) {
      filtered = filtered.filter(t => t.merchantId === searchParams.merchantId);
    }
    
    if (searchParams.status) {
      filtered = filtered.filter(t => t.status === searchParams.status);
    }
    
    if (searchParams.paymentMethod) {
      filtered = filtered.filter(t => t.paymentMethod === searchParams.paymentMethod);
    }
    
    if (searchParams.currency) {
      filtered = filtered.filter(t => t.currency === searchParams.currency);
    }
    
    if (searchParams.minAmount !== undefined) {
      filtered = filtered.filter(t => (t.amount || 0) >= searchParams.minAmount);
    }
    
    if (searchParams.maxAmount !== undefined) {
      filtered = filtered.filter(t => (t.amount || 0) <= searchParams.maxAmount);
    }
    
    if (searchParams.startDate) {
      const startDate = new Date(searchParams.startDate).getTime();
      filtered = filtered.filter(t => new Date(t.timestamp).getTime() >= startDate);
    }
    
    if (searchParams.endDate) {
      const endDate = new Date(searchParams.endDate).getTime();
      filtered = filtered.filter(t => new Date(t.timestamp).getTime() <= endDate);
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || filtered.length;
    
    return filtered.slice(offset, offset + limit);
  } catch (error) {
    console.error('Failed to search transactions:', error);
    throw new Error('Failed to search transactions');
  }
}

/**
 * Delete transaction by ID
 * 
 * @param {string} transactionId - ID of transaction to delete
 * @returns {Promise<boolean>} True if transaction was deleted
 */
export async function deleteTransaction(transactionId) {
  try {
    const transactions = await readTransactionLog();
    const initialLength = transactions.length;
    
    // Filter out the transaction to delete
    const filtered = transactions.filter(t => t.transactionId !== transactionId);
    
    // Check if transaction was found and removed
    if (filtered.length === initialLength) {
      return false;
    }
    
    // Write updated log
    await writeTransactionLog(filtered);
    
    return true;
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    throw new Error('Failed to delete transaction');
  }
}

/**
 * Sanitize transaction data for logging
 * 
 * @param {Object} transaction - Transaction data to sanitize
 * @returns {Object} Sanitized transaction data
 */
function sanitizeTransactionData(transaction) {
  // Create a deep copy of the transaction
  const sanitized = JSON.parse(JSON.stringify(transaction));
  
  // Mask sensitive data if present
  if (sanitized.card) {
    if (sanitized.card.number) {
      sanitized.card.number = maskSensitiveData(sanitized.card.number, { showFirst: 6, showLast: 4 });
    }
    if (sanitized.card.cvv) {
      sanitized.card.cvv = '***';
    }
  }
  
  if (sanitized.bankAccount) {
    if (sanitized.bankAccount.accountNumber) {
      sanitized.bankAccount.accountNumber = maskSensitiveData(sanitized.bankAccount.accountNumber, { showLast: 4 });
    }
    if (sanitized.bankAccount.routingNumber) {
      sanitized.bankAccount.routingNumber = maskSensitiveData(sanitized.bankAccount.routingNumber, { showLast: 4 });
    }
  }
  
  if (sanitized.customer) {
    // Don't mask customer ID or email as these are needed for lookups
    // But do mask any other sensitive information
    if (sanitized.customer.phone) {
      sanitized.customer.phone = maskSensitiveData(sanitized.customer.phone, { showLast: 4 });
    }
  }
  
  return sanitized;
}