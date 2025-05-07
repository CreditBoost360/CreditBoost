/**
 * Sunny Payment Gateway - Admin Module
 * 
 * Exports all admin components
 */

import express from 'express';
import dashboardRouter from './dashboard.js';
import { authenticateToken } from '../../auth.js';
import { ipWhitelist } from '../security/ipWhitelist.js';
import { require2FA } from '../security/twoFactorAuth.js';
import { auditLogMiddleware } from '../security/auditLogger.js';

const router = express.Router();

// Apply security middleware to all admin routes
router.use(authenticateToken);
router.use(require2FA);
router.use(ipWhitelist());
router.use(auditLogMiddleware());

// Mount dashboard routes
router.use('/dashboard', dashboardRouter);

export default router;