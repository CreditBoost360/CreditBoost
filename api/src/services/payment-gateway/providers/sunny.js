/**
 * Sunny Payment Gateway Client
 * 
 * This client provides integration with the Sunny Payment Gateway.
 */

const axios = require('axios');
const crypto = require('crypto');
const logger = require('../../../utils/logger');

class SunnyClient {
  /**
   * Create a new Sunny API client
   * 
   * @param {Object} config - Configuration options
   * @param {string} config.apiKey - Your Sunny API key
   * @param {string} config.apiSecret - Your Sunny API secret
   * @param {string} config.environment - 'sandbox' or 'production'
   * @param {Object} config.options - Additional options
   */
  constructor(config = {}) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.environment = config.environment || 'sandbox';
    this.options = config.options || {};
    
    // Set base URL based on environment
    this.baseUrl = this.environment === 'production'
      ? 'https://api.sunnypayments.com/v2'
      : 'https://sandbox.sunnypayments.com/v2';
    
    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.options.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CreditBoost/SunnyClient/1.0.0'
      }
    });
    
    // Add request interceptor for authentication
    this.client.interceptors.request.use(request => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const path = request.url.replace(this.baseUrl, '');
      
      // Generate signature
      const signature = this._generateSignature(
        request.method.toUpperCase(),
        path,
        timestamp,
        request.data ? JSON.stringify(request.data) : ''
      );
      
      // Add auth headers
      request.headers['X-Sunny-Key'] = this.apiKey;
      request.headers['X-Sunny-Timestamp'] = timestamp;
      request.headers['X-Sunny-Signature'] = signature;
      
      return request;
    });
  }
  
  /**
   * Process a payment
   * 
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} Payment result
   */
  async processPayment(paymentData) {
    try {
      // Add CreditBoost-specific data if available
      const enhancedPaymentData = {
        ...paymentData,
        metadata: {
          ...(paymentData.metadata || {}),
          integration: 'creditboost'
        }
      };
      
      // If credit data is provided, add it to the request
      if (paymentData.creditData) {
        enhancedPaymentData.creditBoost = {
          creditScore: paymentData.creditData.score,
          creditTier: paymentData.creditData.tier,
          riskLevel: paymentData.creditData.riskLevel
        };
        
        // Remove from the original location
        delete enhancedPaymentData.creditData;
      }
      
      const response = await this.client.post('/payments', enhancedPaymentData);
      return response.data;
    } catch (error) {
      logger.error('Sunny payment processing failed', { error });
      this._handleApiError(error);
    }
  }
  
  /**
   * Get payment details
   * 
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Payment details
   */
  async getPayment(paymentId) {
    try {
      const response = await this.client.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get Sunny payment details', { error, paymentId });
      this._handleApiError(error);
    }
  }
  
  /**
   * List payments
   * 
   * @param {Object} options - Query options
   * @returns {Promise<Object>} List of payments
   */
  async listPayments(options = {}) {
    try {
      const response = await this.client.get('/payments', { params: options });
      return response.data;
    } catch (error) {
      logger.error('Failed to list Sunny payments', { error });
      this._handleApiError(error);
    }
  }
  
  /**
   * Create a refund
   * 
   * @param {Object} refundData - Refund information
   * @returns {Promise<Object>} Refund result
   */
  async createRefund(refundData) {
    try {
      const response = await this.client.post('/refunds', refundData);
      return response.data;
    } catch (error) {
      logger.error('Failed to create Sunny refund', { error, paymentId: refundData.paymentId });
      this._handleApiError(error);
    }
  }
  
  /**
   * Create a customer
   * 
   * @param {Object} customerData - Customer information
   * @returns {Promise<Object>} Customer result
   */
  async createCustomer(customerData) {
    try {
      // Add CreditBoost-specific metadata
      const enhancedCustomerData = {
        ...customerData,
        metadata: {
          ...(customerData.metadata || {}),
          integration: 'creditboost'
        }
      };
      
      const response = await this.client.post('/customers', enhancedCustomerData);
      return response.data;
    } catch (error) {
      logger.error('Failed to create Sunny customer', { error });
      this._handleApiError(error);
    }
  }
  
  /**
   * Create a subscription
   * 
   * @param {Object} subscriptionData - Subscription information
   * @returns {Promise<Object>} Subscription result
   */
  async createSubscription(subscriptionData) {
    try {
      const response = await this.client.post('/subscriptions', subscriptionData);
      return response.data;
    } catch (error) {
      logger.error('Failed to create Sunny subscription', { error });
      this._handleApiError(error);
    }
  }
  
  /**
   * Create a marketplace payment with splits
   * 
   * @param {Object} marketplaceData - Marketplace payment information
   * @returns {Promise<Object>} Marketplace payment result
   */
  async createMarketplacePayment(marketplaceData) {
    try {
      const response = await this.client.post('/marketplace/payments', marketplaceData);
      return response.data;
    } catch (error) {
      logger.error('Failed to create Sunny marketplace payment', { error });
      this._handleApiError(error);
    }
  }
  
  /**
   * Get available payment methods
   * 
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Available payment methods
   */
  async getAvailablePaymentMethods(options = {}) {
    try {
      const response = await this.client.get('/payment_methods/available', { params: options });
      return response.data;
    } catch (error) {
      logger.error('Failed to get available Sunny payment methods', { error });
      this._handleApiError(error);
    }
  }
  
  /**
   * Get account balance
   * 
   * @returns {Promise<Object>} Balance information
   */
  async getBalance() {
    try {
      const response = await this.client.get('/balance');
      return response.data;
    } catch (error) {
      logger.error('Failed to get Sunny balance', { error });
      this._handleApiError(error);
    }
  }
  
  /**
   * Generate signature for API authentication
   * 
   * @private
   * @param {string} method - HTTP method
   * @param {string} path - Request path
   * @param {string} timestamp - Request timestamp
   * @param {string} body - Request body
   * @returns {string} Signature
   */
  _generateSignature(method, path, timestamp, body) {
    const message = `${method}${path}${timestamp}${body}`;
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');
  }
  
  /**
   * Handle API errors
   * 
   * @private
   * @param {Error} error - API error
   * @throws {Error} Enhanced error with details
   */
  _handleApiError(error) {
    if (error.response) {
      // The request was made and the server responded with an error status
      const apiError = new Error(error.response.data.error?.message || 'Sunny API error');
      apiError.status = error.response.status;
      apiError.code = error.response.data.error?.code;
      apiError.type = error.response.data.error?.type;
      apiError.param = error.response.data.error?.param;
      throw apiError;
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response received from Sunny API');
    } else {
      // Something happened in setting up the request
      throw new Error(`Error setting up request: ${error.message}`);
    }
  }
}

module.exports = SunnyClient;