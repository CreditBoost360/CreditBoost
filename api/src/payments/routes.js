/**
 * Sunny Payment Gateway - API Routes
 * 
 * Express routes for the payment gateway API
 */

import express from 'express';
import { authenticateToken } from '../auth.js';
import SunnyPaymentGateway from './SunnyPaymentGateway.js';
import { 
  validatePaymentRequest, 
  validateRefundRequest, 
  validatePaymentLinkRequest,
  validateTokenRequest
} from './validation/requestValidator.js';
import { PAYMENT_METHODS, ERROR_CODES } from './constants.js';
import { Transaction } from './database/index.js';

const router = express.Router();

// Initialize payment gateway
const paymentGateway = new SunnyPaymentGateway({
  // Configuration will be loaded from environment variables
});

/**
 * Process a payment
 * POST /api/payments/process
 */
router.post('/process', authenticateToken, validatePaymentRequest, async (req, res) => {
  try {
    const paymentData = req.body;
    
    // Add user ID from auth token
    paymentData.userId = req.userId;
    
    // Add IP address for fraud detection
    paymentData.ipAddress = req.headers['x-forwarded-for'] || req.ip;
    
    // Process payment
    const result = await paymentGateway.processPayment(paymentData);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        transactionId: result.transactionId,
        status: 'completed',
        processorResponse: result.processorResponse
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: result.message,
        transactionId: result.transactionId
      });
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      error: ERROR_CODES.SYSTEM_ERROR,
      message: 'An unexpected error occurred while processing payment'
    });
  }
});

/**
 * Verify a payment
 * GET /api/payments/:transactionId/verify
 */
router.get('/:transactionId/verify', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const result = await paymentGateway.verifyPayment(transactionId);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        transaction: result.transaction
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: ERROR_CODES.VERIFICATION_ERROR,
      message: 'An unexpected error occurred while verifying payment'
    });
  }
});

/**
 * Refund a payment
 * POST /api/payments/:transactionId/refund
 */
router.post('/:transactionId/refund', authenticateToken, validateRefundRequest, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const refundData = req.body;
    
    // Get original transaction to validate refund
    const transaction = await Transaction.getTransactionById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: ERROR_CODES.TRANSACTION_NOT_FOUND,
        message: 'Transaction not found'
      });
    }
    
    // Process refund
    const result = await paymentGateway.refundPayment(transactionId, refundData);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        refundId: result.refundId,
        amount: result.amount,
        currency: result.currency,
        originalTransactionId: result.originalTransactionId
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Payment refund error:', error);
    res.status(500).json({
      success: false,
      error: ERROR_CODES.REFUND_ERROR,
      message: 'An unexpected error occurred while processing refund'
    });
  }
});

/**
 * Generate a payment token
 * POST /api/payments/token
 */
router.post('/token', authenticateToken, validateTokenRequest, async (req, res) => {
  try {
    const paymentData = req.body;
    
    // Generate token
    const result = await paymentGateway.generatePaymentToken(paymentData);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        token: result.token,
        expiresAt: result.expiresAt,
        type: result.type
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Payment tokenization error:', error);
    res.status(500).json({
      success: false,
      error: ERROR_CODES.TOKENIZATION_ERROR,
      message: 'An unexpected error occurred while generating payment token'
    });
  }
});

/**
 * Create a payment link
 * POST /api/payments/link
 */
router.post('/link', authenticateToken, validatePaymentLinkRequest, async (req, res) => {
  try {
    const paymentLinkData = req.body;
    
    // Add user ID from auth token
    paymentLinkData.userId = req.userId;
    
    // Create payment link
    const result = await paymentGateway.createPaymentLink(paymentLinkData);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        paymentLinkId: result.paymentLinkId,
        paymentLink: result.paymentLink,
        amount: result.amount,
        currency: result.currency,
        description: result.description,
        expiresAt: result.expiresAt
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Payment link creation error:', error);
    res.status(500).json({
      success: false,
      error: ERROR_CODES.PAYMENT_LINK_ERROR,
      message: 'An unexpected error occurred while creating payment link'
    });
  }
});

/**
 * Get payment gateway balance
 * GET /api/payments/balance
 */
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const result = await paymentGateway.getBalance();
    
    if (result.success) {
      res.status(200).json({
        success: true,
        balance: result.balance,
        asOf: result.asOf
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Balance check error:', error);
    res.status(500).json({
      success: false,
      error: ERROR_CODES.BALANCE_CHECK_ERROR,
      message: 'An unexpected error occurred while retrieving balance'
    });
  }
});

/**
 * Get transaction history
 * GET /api/payments/transactions
 */
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const { 
      limit = 10, 
      offset = 0, 
      status, 
      startDate, 
      endDate 
    } = req.query;
    
    // Get merchant ID from user ID
    const merchantId = req.userId;
    
    // Get transactions
    const transactions = await Transaction.getTransactionsByMerchant(merchantId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
      startDate,
      endDate
    });
    
    // Get total count for pagination
    const totalCount = await Transaction.countTransactions({ merchantId });
    
    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: totalCount,
        currentPage: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({
      success: false,
      error: 'TRANSACTION_HISTORY_ERROR',
      message: 'An unexpected error occurred while retrieving transaction history'
    });
  }
});

/**
 * Get transaction statistics
 * GET /api/payments/stats
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get merchant ID from user ID
    const merchantId = req.userId;
    
    // Get transaction statistics
    const stats = await Transaction.getTransactionStats(merchantId, {
      startDate,
      endDate
    });
    
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Transaction statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'TRANSACTION_STATS_ERROR',
      message: 'An unexpected error occurred while retrieving transaction statistics'
    });
  }
});

/**
 * Search transactions
 * POST /api/payments/transactions/search
 */
router.post('/transactions/search', authenticateToken, async (req, res) => {
  try {
    const searchParams = req.body;
    const { 
      limit = 10, 
      offset = 0,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;
    
    // Add merchant ID to search params
    searchParams.merchantId = req.userId;
    
    // Search transactions
    const transactions = await Transaction.searchTransactions(searchParams, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      sortBy,
      sortOrder
    });
    
    // Get total count for pagination
    const totalCount = await Transaction.countTransactions(searchParams);
    
    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: totalCount,
        currentPage: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      },
      filters: searchParams
    });
  } catch (error) {
    console.error('Transaction search error:', error);
    res.status(500).json({
      success: false,
      error: 'TRANSACTION_SEARCH_ERROR',
      message: 'An unexpected error occurred while searching transactions'
    });
  }
});

/**
 * Get supported payment methods
 * GET /api/payments/methods
 */
router.get('/methods', async (req, res) => {
  try {
    // Return supported payment methods
    res.status(200).json({
      success: true,
      methods: Object.values(PAYMENT_METHODS)
    });
  } catch (error) {
    console.error('Payment methods error:', error);
    res.status(500).json({
      success: false,
      error: 'PAYMENT_METHODS_ERROR',
      message: 'An unexpected error occurred while retrieving payment methods'
    });
  }
});

/**
 * Get API version and status
 * GET /api/payments/status
 */
router.get('/status', async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      name: 'Sunny Payment Gateway',
      version: '1.0.0',
      status: 'operational',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'STATUS_CHECK_ERROR',
      message: 'An unexpected error occurred while checking status'
    });
  }
});

export default router;