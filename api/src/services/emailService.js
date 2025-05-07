import nodemailer from 'nodemailer';
import { generateOtpEmailTemplate } from '../templates/email/otpTemplate.js';
import { config } from '../config.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to logo image
const LOGO_PATH = path.resolve(__dirname, '../public/images/logo-no-bg.png');

/**
 * Email Service
 * 
 * This service handles sending emails including OTP verification emails.
 */

// Create a transporter for development (using Ethereal)
// In production, replace with your actual SMTP configuration
let transporter;

// Initialize email transporter
const initializeTransporter = async () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration
    transporter = nodemailer.createTransport({
      host: config.email?.host || 'smtp.example.com',
      port: config.email?.port || 587,
      secure: config.email?.secure || false,
      auth: {
        user: config.email?.user || 'user@example.com',
        pass: config.email?.password || 'password'
      }
    });
  } else {
    // Development email configuration using Ethereal
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    console.log('Development email account created:', testAccount.web);
  }
};

// Initialize the transporter when the module is loaded
initializeTransporter().catch(console.error);

/**
 * Send an OTP verification email
 * @param {string} email - Recipient email address
 * @param {string} otp - One-time password
 * @param {string} name - Recipient name (optional)
 * @returns {Promise<Object>} Email sending result
 */
export const sendOtpEmail = async (email, otp, name = '') => {
  try {
    if (!transporter) {
      await initializeTransporter();
    }
    
    const htmlContent = generateOtpEmailTemplate(otp, name);
    
    const mailOptions = {
      from: `"CreditBoost Security" <${config.email?.from || 'security@creditboost.app'}>`,
      to: email,
      subject: 'Your CreditBoost Verification Code',
      html: htmlContent,
      attachments: [
        {
          filename: 'logo-no-bg.png',
          path: LOGO_PATH,
          cid: 'logo' // Same cid value as in the template
        }
      ]
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // For development, log the URL where the email can be previewed
    if (process.env.NODE_ENV !== 'production') {
      console.log('Email preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
    };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

/**
 * Send a general email
 * @param {Object} options - Email options
 * @returns {Promise<Object>} Email sending result
 */
export const sendEmail = async (options) => {
  try {
    if (!transporter) {
      await initializeTransporter();
    }
    
    const { to, subject, html, text, attachments = [] } = options;
    
    // Add logo to attachments if not already included
    const hasLogo = attachments.some(attachment => attachment.cid === 'logo');
    
    if (!hasLogo) {
      attachments.push({
        filename: 'logo-no-bg.png',
        path: LOGO_PATH,
        cid: 'logo'
      });
    }
    
    const mailOptions = {
      from: `"CreditBoost" <${config.email?.from || 'noreply@creditboost.app'}>`,
      to,
      subject,
      html,
      text,
      attachments
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // For development, log the URL where the email can be previewed
    if (process.env.NODE_ENV !== 'production') {
      console.log('Email preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
    };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

export default {
  sendOtpEmail,
  sendEmail
};