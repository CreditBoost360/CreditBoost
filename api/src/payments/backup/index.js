/**
 * Sunny Payment Gateway - Backup Module
 * 
 * Exports backup and recovery functionality
 */

import express from 'express';
import { authenticateToken } from '../../auth.js';
import { require2FA } from '../security/twoFactorAuth.js';
import { ipWhitelist } from '../security/ipWhitelist.js';
import { logAuditEvent } from '../security/auditLogger.js';
import { 
  createBackup, 
  restoreFromBackup, 
  listBackups, 
  deleteBackup,
  scheduleAutomatedBackups
} from './backupService.js';

const router = express.Router();

// Apply security middleware
router.use(authenticateToken);
router.use(require2FA);
router.use(ipWhitelist());

/**
 * Create a backup
 * POST /api/payments/backup/create
 */
router.post('/create', async (req, res) => {
  try {
    const { encrypt = true } = req.body;
    
    const result = await createBackup(encrypt);
    
    // Log audit event
    logAuditEvent({
      action: 'BACKUP_CREATE',
      userId: req.userId,
      data: {
        backupId: result.backupId,
        encrypted: encrypt
      }
    });
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Backup creation error:', error);
    res.status(500).json({
      success: false,
      error: 'BACKUP_ERROR',
      message: error.message
    });
  }
});

/**
 * Restore from backup
 * POST /api/payments/backup/restore
 */
router.post('/restore', async (req, res) => {
  try {
    const { backupId } = req.body;
    
    if (!backupId) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'Backup ID is required'
      });
    }
    
    const result = await restoreFromBackup(backupId);
    
    // Log audit event
    logAuditEvent({
      action: 'BACKUP_RESTORE',
      userId: req.userId,
      data: {
        backupId,
        fileCount: result.fileCount
      }
    });
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({
      success: false,
      error: 'RESTORE_ERROR',
      message: error.message
    });
  }
});

/**
 * List backups
 * GET /api/payments/backup/list
 */
router.get('/list', async (req, res) => {
  try {
    const backups = await listBackups();
    
    res.json({
      success: true,
      backups
    });
  } catch (error) {
    console.error('List backups error:', error);
    res.status(500).json({
      success: false,
      error: 'LIST_BACKUPS_ERROR',
      message: error.message
    });
  }
});

/**
 * Delete backup
 * DELETE /api/payments/backup/:backupId
 */
router.delete('/:backupId', async (req, res) => {
  try {
    const { backupId } = req.params;
    
    const result = await deleteBackup(backupId);
    
    // Log audit event
    logAuditEvent({
      action: 'BACKUP_DELETE',
      userId: req.userId,
      data: {
        backupId
      }
    });
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Delete backup error:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_BACKUP_ERROR',
      message: error.message
    });
  }
});

// Initialize automated backups
const BACKUP_INTERVAL_HOURS = process.env.BACKUP_INTERVAL_HOURS 
  ? parseInt(process.env.BACKUP_INTERVAL_HOURS, 10) 
  : 24;

const BACKUP_RETENTION_COUNT = process.env.BACKUP_RETENTION_COUNT 
  ? parseInt(process.env.BACKUP_RETENTION_COUNT, 10) 
  : 7;

// Schedule automated backups if enabled
if (process.env.ENABLE_AUTOMATED_BACKUPS === 'true') {
  scheduleAutomatedBackups({
    intervalHours: BACKUP_INTERVAL_HOURS,
    encrypt: true,
    retentionCount: BACKUP_RETENTION_COUNT
  });
}

export default router;