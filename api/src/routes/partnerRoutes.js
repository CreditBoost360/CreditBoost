import express from 'express';
import { 
  registerPartner,
  generatePartnerToken,
  getPartnerProfile,
  rotateApiKey
} from '../controllers/partnerController.js';
import { authenticatePartner } from '../middleware/authentication.js';

const router = express.Router();

/**
 * @route POST /api/partners/register
 * @desc Register a new partner
 * @access Public
 */
router.post('/register', registerPartner);

/**
 * @route POST /api/auth/partner-token
 * @desc Generate JWT token for partner API access
 * @access Public (requires API key)
 */
router.post('/token', generatePartnerToken);

/**
 * @route GET /api/partners/profile
 * @desc Get partner profile
 * @access Private (partner only)
 */
router.get('/profile', authenticatePartner, getPartnerProfile);

/**
 * @route POST /api/partners/rotate-key
 * @desc Rotate partner API key
 * @access Private (partner only)
 */
router.post('/rotate-key', authenticatePartner, rotateApiKey);

export default router;

