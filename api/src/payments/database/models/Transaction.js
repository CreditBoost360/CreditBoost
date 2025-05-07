/**
 * Sunny Payment Gateway - Transaction Model
 * 
 * Defines the transaction data model
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  insertDocument, 
  findById, 
  findDocuments, 
  updateDocument, 
  deleteDocument,
  countDocuments
} from '../dbConnector.js';

// Collection name
const COLLECTION = 'transactions';

/**
 * Create a new transaction
 * 
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<Object>} Created transaction
 */
export async function createTransaction(transactionData) {
  // Generate ID if not provided
  if (!transactionData.transactionId) {
    transactionData.transactionId = uuidv4();
  }
  
  // Add timestamp if not provided
  if (!transactionData.timestamp) {
    transactionData.timestamp = new Date().toISOString();
  }
  
  return await insertDocument(COLLECTION, transactionData);
}

/**
 * Get transaction by ID
 * 
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object|null>} Transaction or null if not found
 */
export async function getTransactionById(transactionId) {
  return await findById(COLLECTION, transactionId);
}

/**
 * Get transactions by merchant ID
 * 
 * @param {string} merchantId - Merchant ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Transactions
 */
export async function getTransactionsByMerchant(merchantId, options = {}) {
  const query = { merchantId };
  
  // Add status filter if provided
  if (options.status) {
    query.status = options.status;
  }
  
  // Add date range filters if provided
  if (options.startDate || options.endDate) {
    query.timestamp = {};
    
    if (options.startDate) {
      query.timestamp.$gte = options.startDate;
    }
    
    if (options.endDate) {
      query.timestamp.$lte = options.endDate;
    }
  }
  
  // Set up sort options
  const sort = { timestamp: -1 }; // Default sort by timestamp desc
  
  // Set up pagination options
  const skip = options.offset || 0;
  const limit = options.limit || 100;
  
  return await findDocuments(COLLECTION, query, { sort, skip, limit });
}

/**
 * Search transactions
 * 
 * @param {Object} searchParams - Search parameters
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Matching transactions
 */
export async function searchTransactions(searchParams, options = {}) {
  const query = {};
  
  // Add search filters
  if (searchParams.transactionId) {
    query.transactionId = searchParams.transactionId;
  }
  
  if (searchParams.merchantId) {
    query.merchantId = searchParams.merchantId;
  }
  
  if (searchParams.status) {
    query.status = searchParams.status;
  }
  
  if (searchParams.paymentMethod) {
    query.paymentMethod = searchParams.paymentMethod;
  }
  
  if (searchParams.currency) {
    query.currency = searchParams.currency;
  }
  
  // Add amount range filters
  if (searchParams.minAmount !== undefined || searchParams.maxAmount !== undefined) {
    query.amount = {};
    
    if (searchParams.minAmount !== undefined) {
      query.amount.$gte = searchParams.minAmount;
    }
    
    if (searchParams.maxAmount !== undefined) {
      query.amount.$lte = searchParams.maxAmount;
    }
  }
  
  // Add date range filters
  if (searchParams.startDate || searchParams.endDate) {
    query.timestamp = {};
    
    if (searchParams.startDate) {
      query.timestamp.$gte = searchParams.startDate;
    }
    
    if (searchParams.endDate) {
      query.timestamp.$lte = searchParams.endDate;
    }
  }
  
  // Set up sort options
  const sort = options.sortBy === 'amount' 
    ? { amount: options.sortOrder === 'asc' ? 1 : -1 } 
    : { timestamp: options.sortOrder === 'asc' ? 1 : -1 };
  
  // Set up pagination options
  const skip = options.offset || 0;
  const limit = options.limit || 100;
  
  return await findDocuments(COLLECTION, query, { sort, skip, limit });
}

/**
 * Get transaction statistics
 * 
 * @param {string} merchantId - Merchant ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Transaction statistics
 */
export async function getTransactionStats(merchantId, options = {}) {
  // Get all transactions for the merchant
  const query = { merchantId };
  
  // Add date range filters if provided
  if (options.startDate || options.endDate) {
    query.timestamp = {};
    
    if (options.startDate) {
      query.timestamp.$gte = options.startDate;
    }
    
    if (options.endDate) {
      query.timestamp.$lte = options.endDate;
    }
  }
  
  const transactions = await findDocuments(COLLECTION, query);
  
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
}

/**
 * Update transaction
 * 
 * @param {string} transactionId - Transaction ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object|null>} Updated transaction or null if not found
 */
export async function updateTransaction(transactionId, updateData) {
  // Add updated timestamp
  updateData.updatedAt = new Date().toISOString();
  
  return await updateDocument(COLLECTION, transactionId, updateData);
}

/**
 * Delete transaction
 * 
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<boolean>} Whether transaction was deleted
 */
export async function deleteTransaction(transactionId) {
  return await deleteDocument(COLLECTION, transactionId);
}

/**
 * Count transactions
 * 
 * @param {Object} query - Query object
 * @returns {Promise<number>} Transaction count
 */
export async function countTransactions(query = {}) {
  return await countDocuments(COLLECTION, query);
}