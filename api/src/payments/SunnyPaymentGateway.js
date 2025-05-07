/**
 * Sunny Payment Gateway - Core Module
 * 
 * A proprietary payment processing system for CreditBoost
 * Handles payment processing, multiple payment methods, and security
 */

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { encryptData, decryptData } from './encryption.js';
import { validatePaymentData } from './validation.js';
import { detectFraud } from './fraudDetection.js';
import { logTransaction, getTransactionById } from './transactionLogger.js';
import { 
  PAYMENT_STATUS, 
  PAYMENT_METHODS, 
  TRANSACTION_TYPES,
  ERROR_CODES
} from './constants.js';

class SunnyPaymentGateway {
  constructor(config = {}) {
    this.merchantId = config.merchantId || process.env.SUNNY_MERCHANT_ID;
    this.apiKey = config.apiKey || process.env.SUNNY_API_KEY;
    this.apiSecret = config.apiSecret || process.env.SUNNY_API_SECRET;
    this.environment = config.environment || process.env.SUNNY_ENVIRONMENT || 'sandbox';
    this.baseUrl = this.environment === 'production' 
      ? 'https://api.sunnypayments.com/v1'
      : 'https://sandbox.sunnypayments.com/v1';
    
    // Validate required configuration
    if (!this.merchantId || !this.apiKey || !this.apiSecret) {
      throw new Error('Missing required Sunny Payment Gateway configuration');
    }
  }

  /**
   * Process a payment transaction
   * 
   * @param {Object} paymentData - Payment information
   * @param {string} paymentData.amount - Amount to charge
   * @param {string} paymentData.currency - Currency code (e.g., USD, EUR)
   * @param {string} paymentData.paymentMethod - Payment method (card, bank_transfer, mobile_money)
   * @param {Object} paymentData.customer - Customer information
   * @param {Object} paymentData.metadata - Additional transaction metadata
   * @returns {Promise<Object>} Transaction result
   */
  async processPayment(paymentData) {
    try {
      // Validate payment data
      const validationResult = validatePaymentData(paymentData);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: ERROR_CODES.VALIDATION_ERROR,
          message: validationResult.errors.join(', '),
          transactionId: null
        };
      }

      // Generate transaction ID
      const transactionId = uuidv4();
      
      // Check for fraud
      const fraudCheck = await detectFraud({
        ...paymentData,
        transactionId,
        merchantId: this.merchantId
      });
      
      if (fraudCheck.isFraudulent) {
        await logTransaction({
          transactionId,
          merchantId: this.merchantId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: PAYMENT_STATUS.REJECTED,
          paymentMethod: paymentData.paymentMethod,
          errorCode: ERROR_CODES.FRAUD_DETECTED,
          metadata: {
            fraudReason: fraudCheck.reason,
            riskScore: fraudCheck.riskScore
          }
        });
        
        return {
          success: false,
          error: ERROR_CODES.FRAUD_DETECTED,
          message: 'Transaction flagged as potentially fraudulent',
          transactionId
        };
      }

      // Process payment based on payment method
      let paymentResult;
      switch (paymentData.paymentMethod) {
        case PAYMENT_METHODS.CARD:
          paymentResult = await this.processCardPayment(paymentData, transactionId);
          break;
        case PAYMENT_METHODS.BANK_TRANSFER:
          paymentResult = await this.processBankTransfer(paymentData, transactionId);
          break;
        case PAYMENT_METHODS.MOBILE_MONEY:
          paymentResult = await this.processMobileMoney(paymentData, transactionId);
          break;
        case PAYMENT_METHODS.CRYPTO:
          paymentResult = await this.processCryptoPayment(paymentData, transactionId);
          break;
        default:
          paymentResult = {
            success: false,
            error: ERROR_CODES.UNSUPPORTED_PAYMENT_METHOD,
            message: 'Unsupported payment method'
          };
      }

      // Log transaction
      await logTransaction({
        transactionId,
        merchantId: this.merchantId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentResult.success ? PAYMENT_STATUS.COMPLETED : PAYMENT_STATUS.FAILED,
        paymentMethod: paymentData.paymentMethod,
        errorCode: paymentResult.error || null,
        metadata: {
          ...paymentData.metadata,
          processorResponse: paymentResult.processorResponse
        }
      });

      return {
        ...paymentResult,
        transactionId
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      
      // Log the failed transaction
      try {
        await logTransaction({
          transactionId: paymentData.transactionId || uuidv4(),
          merchantId: this.merchantId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: PAYMENT_STATUS.ERROR,
          paymentMethod: paymentData.paymentMethod,
          errorCode: ERROR_CODES.SYSTEM_ERROR,
          metadata: {
            errorMessage: error.message
          }
        });
      } catch (logError) {
        console.error('Failed to log transaction error:', logError);
      }
      
      return {
        success: false,
        error: ERROR_CODES.SYSTEM_ERROR,
        message: 'An unexpected error occurred while processing payment',
        transactionId: paymentData.transactionId || null
      };
    }
  }

  /**
   * Process card payment
   * @private
   */
  async processCardPayment(paymentData, transactionId) {
    // Encrypt sensitive card data
    const encryptedCardData = encryptData({
      cardNumber: paymentData.card.number,
      cvv: paymentData.card.cvv
    });

    // In a real implementation, this would make an API call to a payment processor
    // For this example, we'll simulate a successful payment
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful payment
    return {
      success: true,
      processorResponse: {
        authorizationCode: crypto.randomBytes(6).toString('hex').toUpperCase(),
        processorTransactionId: `CARD_${crypto.randomBytes(8).toString('hex')}`,
        processorName: 'SunnyCardProcessor'
      }
    };
  }

  /**
   * Process bank transfer
   * @private
   */
  async processBankTransfer(paymentData, transactionId) {
    // In a real implementation, this would initiate a bank transfer
    // For this example, we'll simulate a successful transfer initiation
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      processorResponse: {
        transferId: `BANK_${crypto.randomBytes(8).toString('hex')}`,
        estimatedSettlementTime: new Date(Date.now() + 86400000).toISOString(), // +24 hours
        processorName: 'SunnyBankProcessor'
      }
    };
  }

  /**
   * Process mobile money payment
   * @private
   */
  async processMobileMoney(paymentData, transactionId) {
    // In a real implementation, this would initiate a mobile money payment
    // For this example, we'll simulate a successful payment
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      processorResponse: {
        mobileMoneyId: `MM_${crypto.randomBytes(8).toString('hex')}`,
        providerReference: crypto.randomBytes(10).toString('hex').toUpperCase(),
        processorName: 'SunnyMobileProcessor'
      }
    };
  }

  /**
   * Process cryptocurrency payment
   * @private
   */
  async processCryptoPayment(paymentData, transactionId) {
    // In a real implementation, this would initiate a crypto payment
    // For this example, we'll simulate a successful payment
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      success: true,
      processorResponse: {
        cryptoTransactionId: `CRYPTO_${crypto.randomBytes(8).toString('hex')}`,
        walletAddress: `0x${crypto.randomBytes(20).toString('hex')}`,
        confirmations: 1,
        processorName: 'SunnyCryptoProcessor'
      }
    };
  }

  /**
   * Verify a payment transaction
   * 
   * @param {string} transactionId - ID of the transaction to verify
   * @returns {Promise<Object>} Transaction verification result
   */
  async verifyPayment(transactionId) {
    try {
      const transaction = await getTransactionById(transactionId);
      
      if (!transaction) {
        return {
          success: false,
          error: ERROR_CODES.TRANSACTION_NOT_FOUND,
          message: 'Transaction not found'
        };
      }
      
      return {
        success: true,
        transaction: {
          transactionId: transaction.transactionId,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          paymentMethod: transaction.paymentMethod,
          timestamp: transaction.timestamp,
          metadata: transaction.metadata
        }
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: ERROR_CODES.VERIFICATION_ERROR,
        message: 'Failed to verify payment'
      };
    }
  }

  /**
   * Refund a payment transaction
   * 
   * @param {string} transactionId - ID of the transaction to refund
   * @param {Object} refundData - Refund information
   * @param {string} refundData.amount - Amount to refund (optional, defaults to full amount)
   * @param {string} refundData.reason - Reason for refund
   * @returns {Promise<Object>} Refund result
   */
  async refundPayment(transactionId, refundData = {}) {
    try {
      const transaction = await getTransactionById(transactionId);
      
      if (!transaction) {
        return {
          success: false,
          error: ERROR_CODES.TRANSACTION_NOT_FOUND,
          message: 'Transaction not found'
        };
      }
      
      if (transaction.status !== PAYMENT_STATUS.COMPLETED) {
        return {
          success: false,
          error: ERROR_CODES.INVALID_TRANSACTION_STATE,
          message: 'Only completed transactions can be refunded'
        };
      }
      
      const refundAmount = refundData.amount || transaction.amount;
      
      if (refundAmount > transaction.amount) {
        return {
          success: false,
          error: ERROR_CODES.INVALID_REFUND_AMOUNT,
          message: 'Refund amount cannot exceed original transaction amount'
        };
      }
      
      // In a real implementation, this would call the payment processor's refund API
      // For this example, we'll simulate a successful refund
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const refundId = uuidv4();
      
      // Log refund transaction
      await logTransaction({
        transactionId: refundId,
        relatedTransactionId: transactionId,
        merchantId: this.merchantId,
        amount: refundAmount,
        currency: transaction.currency,
        status: PAYMENT_STATUS.REFUNDED,
        paymentMethod: transaction.paymentMethod,
        type: TRANSACTION_TYPES.REFUND,
        metadata: {
          reason: refundData.reason || 'Customer requested refund',
          originalTransactionId: transactionId
        }
      });
      
      return {
        success: true,
        refundId,
        amount: refundAmount,
        currency: transaction.currency,
        originalTransactionId: transactionId
      };
    } catch (error) {
      console.error('Payment refund error:', error);
      return {
        success: false,
        error: ERROR_CODES.REFUND_ERROR,
        message: 'Failed to process refund'
      };
    }
  }

  /**
   * Generate a payment token for secure payment processing
   * 
   * @param {Object} paymentData - Payment method data to tokenize
   * @returns {Promise<Object>} Tokenization result
   */
  async generatePaymentToken(paymentData) {
    try {
      // Validate payment data
      if (!paymentData || !paymentData.type) {
        return {
          success: false,
          error: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid payment data for tokenization'
        };
      }
      
      // Encrypt the payment data
      const encryptedData = encryptData(paymentData);
      
      // Generate token
      const token = crypto.randomBytes(16).toString('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiry
      
      // In a real implementation, store the token and encrypted data in a secure database
      // For this example, we'll just return the token
      
      return {
        success: true,
        token,
        expiresAt: expiresAt.toISOString(),
        type: paymentData.type
      };
    } catch (error) {
      console.error('Payment tokenization error:', error);
      return {
        success: false,
        error: ERROR_CODES.TOKENIZATION_ERROR,
        message: 'Failed to generate payment token'
      };
    }
  }

  /**
   * Create a payment link that can be shared with customers
   * 
   * @param {Object} paymentLinkData - Payment link information
   * @returns {Promise<Object>} Payment link result
   */
  async createPaymentLink(paymentLinkData) {
    try {
      const { amount, currency, description, expiresIn, metadata } = paymentLinkData;
      
      if (!amount || !currency || !description) {
        return {
          success: false,
          error: ERROR_CODES.VALIDATION_ERROR,
          message: 'Amount, currency, and description are required'
        };
      }
      
      const paymentLinkId = uuidv4();
      const expiryTime = expiresIn ? Date.now() + expiresIn : Date.now() + 7 * 24 * 60 * 60 * 1000; // Default 7 days
      
      // In a real implementation, store the payment link in a database
      // For this example, we'll just return the link details
      
      const paymentLink = `${this.baseUrl}/pay/${paymentLinkId}`;
      
      return {
        success: true,
        paymentLinkId,
        paymentLink,
        amount,
        currency,
        description,
        expiresAt: new Date(expiryTime).toISOString()
      };
    } catch (error) {
      console.error('Payment link creation error:', error);
      return {
        success: false,
        error: ERROR_CODES.PAYMENT_LINK_ERROR,
        message: 'Failed to create payment link'
      };
    }
  }

  /**
   * Get payment gateway balance
   * 
   * @returns {Promise<Object>} Balance information
   */
  async getBalance() {
    try {
      // In a real implementation, this would call the payment gateway's API
      // For this example, we'll return mock data
      
      return {
        success: true,
        balance: {
          available: {
            USD: 10000.00,
            EUR: 8500.00,
            GBP: 7200.00
          },
          pending: {
            USD: 1500.00,
            EUR: 1200.00,
            GBP: 800.00
          }
        },
        asOf: new Date().toISOString()
      };
    } catch (error) {
      console.error('Balance check error:', error);
      return {
        success: false,
        error: ERROR_CODES.BALANCE_CHECK_ERROR,
        message: 'Failed to retrieve balance information'
      };
    }
  }

  /**
   * Generate a secure signature for API requests
   * 
   * @private
   * @param {Object} data - Data to sign
   * @returns {string} Signature
   */
  _generateSignature(data) {
    const payload = JSON.stringify(data);
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(payload)
      .digest('hex');
  }
}

export default SunnyPaymentGateway;