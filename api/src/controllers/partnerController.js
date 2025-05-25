import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';
import { sendEmail } from '../services/emailService.js';

/**
 * Generate a secure API key
 * @returns {string} Secure API key
 */
const generateSecureApiKey = () => {
  // Generate a random key with 32 bytes of entropy
  const apiKey = crypto.randomBytes(32).toString('hex');
  return `cbk_${apiKey}`;
};

/**
 * Send welcome email to new partner
 * @param {string} email Partner email
 * @param {Object} data Template data
 */
const sendWelcomeEmail = async (email, data) => {
  await sendEmail({
    to: email,
    subject: 'Welcome to CreditBoost Partner API Program',
    template: 'partner-welcome',
    data
  });
};

/**
 * Register a new partner
 * @route POST /api/partners/register
 */
export const registerPartner = async (req, res) => {
  try {
    const { name, email, company, useCase } = req.body;
    
    // Validate required fields
    if (!name || !email || !company || !useCase) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Check if partner with email already exists
    const existingPartner = await db.partners.findOne({ where: { email } });
    if (existingPartner) {
      return res.status(409).json({
        success: false,
        message: 'Partner with this email already exists'
      });
    }
    
    // Generate unique API key
    const apiKey = generateSecureApiKey();
    
    // Store partner details
    const partner = await db.partners.create({
      name,
      email,
      company,
      useCase,
      apiKey,
      status: 'pending_approval',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Send welcome email with initial setup instructions
    await sendWelcomeEmail(email, {
      name,
      portalUrl: 'https://developers.creditboost.co.ke',
      apiKey
    });

    return res.status(201).json({
      success: true,
      message: 'Partner registration successful',
      data: {
        partnerId: partner.id,
        portalUrl: 'https://developers.creditboost.co.ke'
      }
    });
  } catch (error) {
    console.error('Partner registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register partner'
    });
  }
};

/**
 * Generate JWT token for partner API access
 * @route POST /api/auth/partner-token
 */
export const generatePartnerToken = async (req, res) => {
  try {
    // Get API key from header
    const apiKey = req.headers['x-api-key'];
    const { partnerId } = req.body;
    
    // Validate inputs
    if (!apiKey || !partnerId) {
      return res.status(400).json({
        success: false,
        message: 'Missing API key or partner ID'
      });
    }
    
    // Find partner by API key
    const partner = await db.partners.findOne({ 
      where: { 
        id: partnerId,
        apiKey
      } 
    });
    
    if (!partner) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key or partner ID'
      });
    }
    
    // Check if partner is approved
    if (partner.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your partner account is pending approval'
      });
    }
    
    // Generate JWT token valid for 24 hours
    const token = jwt.sign(
      { 
        partnerId: partner.id,
        name: partner.name,
        type: 'partner' 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    return res.status(200).json({
      success: true,
      token,
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate token'
    });
  }
};

/**
 * Get partner profile
 * @route GET /api/partners/profile
 */
export const getPartnerProfile = async (req, res) => {
  try {
    const { partnerId } = req.user;
    
    // Find partner
    const partner = await db.partners.findByPk(partnerId, {
      attributes: ['id', 'name', 'email', 'company', 'status', 'createdAt', 'usageStats']
    });
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: partner
    });
  } catch (error) {
    console.error('Get partner profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve partner profile'
    });
  }
};

/**
 * Rotate partner API key
 * @route POST /api/partners/rotate-key
 */
export const rotateApiKey = async (req, res) => {
  try {
    const { partnerId } = req.user;
    
    // Find partner
    const partner = await db.partners.findByPk(partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }
    
    // Generate new API key
    const newApiKey = generateSecureApiKey();
    
    // Update partner record
    partner.apiKey = newApiKey;
    partner.updatedAt = new Date();
    await partner.save();
    
    // Notify partner about key rotation
    await sendEmail({
      to: partner.email,
      subject: 'Your CreditBoost API Key Has Been Rotated',
      template: 'api-key-rotated',
      data: {
        name: partner.name,
        apiKey: newApiKey
      }
    });
    
    return res.status(200).json({
      success: true,
      message: 'API key rotated successfully',
      data: {
        apiKey: newApiKey
      }
    });
  } catch (error) {
    console.error('Rotate API key error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to rotate API key'
    });
  }
};

