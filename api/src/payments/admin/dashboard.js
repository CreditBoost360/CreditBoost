/**
 * Sunny Payment Gateway - Admin Dashboard
 * 
 * Provides admin dashboard functionality for monitoring transactions
 */

import express from 'express';
import { authenticateToken } from '../../auth.js';
import { getTransactionById, getTransactionsByMerchant, getTransactionStats, searchTransactions } from '../transactionLogger.js';
import { searchAuditLogs } from '../security/auditLogger.js';
import { ipWhitelist } from '../security/ipWhitelist.js';
import { require2FA } from '../security/twoFactorAuth.js';
import { generatePCIComplianceReport } from '../security/pciCompliance.js';

const router = express.Router();

// Apply security middleware
router.use(authenticateToken);
router.use(require2FA);
router.use(ipWhitelist());

/**
 * Get dashboard overview
 * GET /api/payments/admin/dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    const { userId } = req;
    
    // Get transaction statistics
    const stats = await getTransactionStats(userId);
    
    // Get recent transactions
    const recentTransactions = await getTransactionsByMerchant(userId, {
      limit: 10,
      offset: 0
    });
    
    // Get recent audit logs
    const recentAuditLogs = await searchAuditLogs({ userId }, {
      limit: 10,
      offset: 0
    });
    
    res.json({
      success: true,
      stats,
      recentTransactions,
      recentAuditLogs
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'DASHBOARD_ERROR',
      message: 'Failed to get dashboard data'
    });
  }
});

/**
 * Get transaction details
 * GET /api/payments/admin/transactions/:transactionId
 */
router.get('/transactions/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const transaction = await getTransactionById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'TRANSACTION_NOT_FOUND',
        message: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Transaction details error:', error);
    res.status(500).json({
      success: false,
      error: 'TRANSACTION_DETAILS_ERROR',
      message: 'Failed to get transaction details'
    });
  }
});

/**
 * Search transactions
 * POST /api/payments/admin/transactions/search
 */
router.post('/transactions/search', async (req, res) => {
  try {
    const searchParams = req.body;
    const { limit = 10, offset = 0 } = req.query;
    
    const transactions = await searchTransactions(searchParams, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      transactions,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: transactions.length
      }
    });
  } catch (error) {
    console.error('Transaction search error:', error);
    res.status(500).json({
      success: false,
      error: 'TRANSACTION_SEARCH_ERROR',
      message: 'Failed to search transactions'
    });
  }
});

/**
 * Get audit logs
 * GET /api/payments/admin/audit-logs
 */
router.get('/audit-logs', async (req, res) => {
  try {
    const { userId } = req;
    const { limit = 10, offset = 0, action, startDate, endDate } = req.query;
    
    const auditLogs = await searchAuditLogs({
      userId,
      action,
      startDate,
      endDate
    }, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      auditLogs,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: auditLogs.length
      }
    });
  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({
      success: false,
      error: 'AUDIT_LOGS_ERROR',
      message: 'Failed to get audit logs'
    });
  }
});

/**
 * Get PCI compliance report
 * GET /api/payments/admin/compliance-report
 */
router.get('/compliance-report', async (req, res) => {
  try {
    const report = generatePCIComplianceReport();
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Compliance report error:', error);
    res.status(500).json({
      success: false,
      error: 'COMPLIANCE_REPORT_ERROR',
      message: 'Failed to generate compliance report'
    });
  }
});

/**
 * Get system alerts
 * GET /api/payments/admin/alerts
 */
router.get('/alerts', async (req, res) => {
  try {
    // In a real implementation, this would fetch actual alerts from a monitoring system
    // For this example, we'll return mock data
    
    const alerts = [
      {
        id: 'alert-1',
        type: 'security',
        severity: 'high',
        message: 'Multiple failed login attempts detected',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'active'
      },
      {
        id: 'alert-2',
        type: 'performance',
        severity: 'medium',
        message: 'API response time above threshold',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      },
      {
        id: 'alert-3',
        type: 'security',
        severity: 'low',
        message: 'New IP address detected for user login',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        status: 'resolved'
      }
    ];
    
    res.json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'ALERTS_ERROR',
      message: 'Failed to get alerts'
    });
  }
});

export default router;