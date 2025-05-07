/**
 * Payment Gateway Service
 * 
 * This service provides a unified interface for interacting with multiple payment gateways,
 * including Sunny and other providers.
 */

const config = require('../../config');
const logger = require('../../utils/logger');
const SunnyClient = require('./providers/sunny');
const StripeClient = require('./providers/stripe');
const PayPalClient = require('./providers/paypal');
const AdyenClient = require('./providers/adyen');

class PaymentGatewayService {
  /**
   * Create a new Payment Gateway Service
   */
  constructor() {
    this.providers = {};
    this.defaultProvider = config.payment.defaultProvider || 'sunny';
    
    // Initialize configured providers
    this._initializeProviders();
  }
  
  /**
   * Initialize payment gateway providers based on configuration
   * 
   * @private
   */
  _initializeProviders() {
    const providerConfigs = config.payment.providers || {};
    
    // Initialize Sunny if configured
    if (providerConfigs.sunny) {
      try {
        this.providers.sunny = new SunnyClient({
          apiKey: providerConfigs.sunny.apiKey,
          apiSecret: providerConfigs.sunny.apiSecret,
          environment: providerConfigs.sunny.environment || 'sandbox',
          options: providerConfigs.sunny.options || {}
        });
        logger.info('Sunny payment gateway initialized');
      } catch (error) {
        logger.error('Failed to initialize Sunny payment gateway', { error });
      }
    }
    
    // Initialize Stripe if configured
    if (providerConfigs.stripe) {
      try {
        this.providers.stripe = new StripeClient({
          apiKey: providerConfigs.stripe.apiKey,
          environment: providerConfigs.stripe.environment || 'sandbox',
          options: providerConfigs.stripe.options || {}
        });
        logger.info('Stripe payment gateway initialized');
      } catch (error) {
        logger.error('Failed to initialize Stripe payment gateway', { error });
      }
    }
    
    // Initialize PayPal if configured
    if (providerConfigs.paypal) {
      try {
        this.providers.paypal = new PayPalClient({
          clientId: providerConfigs.paypal.clientId,
          clientSecret: providerConfigs.paypal.clientSecret,
          environment: providerConfigs.paypal.environment || 'sandbox',
          options: providerConfigs.paypal.options || {}
        });
        logger.info('PayPal payment gateway initialized');
      } catch (error) {
        logger.error('Failed to initialize PayPal payment gateway', { error });
      }
    }
    
    // Initialize Adyen if configured
    if (providerConfigs.adyen) {
      try {
        this.providers.adyen = new AdyenClient({
          apiKey: providerConfigs.adyen.apiKey,
          merchantAccount: providerConfigs.adyen.merchantAccount,
          environment: providerConfigs.adyen.environment || 'test',
          options: providerConfigs.adyen.options || {}
        });
        logger.info('Adyen payment gateway initialized');
      } catch (error) {
        logger.error('Failed to initialize Adyen payment gateway', { error });
      }
    }
    
    // Check if we have at least one provider
    if (Object.keys(this.providers).length === 0) {
      logger.warn('No payment gateway providers initialized');
    }
  }
  
  /**
   * Get a payment gateway provider
   * 
   * @param {string} [provider] - Provider name (defaults to the configured default provider)
   * @returns {Object} Provider client
   * @throws {Error} If the provider is not available
   */
  getProvider(provider = this.defaultProvider) {
    const client = this.providers[provider];
    
    if (!client) {
      throw new Error(`Payment gateway provider '${provider}' not available`);
    }
    
    return client;
  }
  
  /**
   * Process a payment using the specified provider
   * 
   * @param {Object} paymentData - Payment information
   * @param {string} [provider] - Provider name (defaults to the configured default provider)
   * @returns {Promise<Object>} Payment result
   */
  async processPayment(paymentData, provider) {
    const client = this.getProvider(provider);
    
    try {
      // Add CreditBoost-specific data if available
      if (paymentData.userId && paymentData.creditScore) {
        paymentData.creditData = {
          score: paymentData.creditScore,
          tier: paymentData.creditTier,
          riskLevel: paymentData.riskLevel
        };
      }
      
      logger.info(`Processing payment with ${provider || this.defaultProvider}`, { 
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethodType: paymentData.paymentMethod?.type
      });
      
      const result = await client.processPayment(paymentData);
      
      logger.info(`Payment processed successfully with ${provider || this.defaultProvider}`, { 
        paymentId: result.id,
        status: result.status
      });
      
      return result;
    } catch (error) {
      logger.error(`Payment processing failed with ${provider || this.defaultProvider}`, { 
        error,
        amount: paymentData.amount,
        currency: paymentData.currency
      });
      
      throw error;
    }
  }
  
  /**
   * Get payment details
   * 
   * @param {string} paymentId - Payment ID
   * @param {string} [provider] - Provider name (defaults to the configured default provider)
   * @returns {Promise<Object>} Payment details
   */
  async getPayment(paymentId, provider) {
    const client = this.getProvider(provider);
    
    try {
      logger.info(`Getting payment details from ${provider || this.defaultProvider}`, { paymentId });
      
      const result = await client.getPayment(paymentId);
      
      return result;
    } catch (error) {
      logger.error(`Failed to get payment details from ${provider || this.defaultProvider}`, { 
        error,
        paymentId
      });
      
      throw error;
    }
  }
  
  /**
   * List payments
   * 
   * @param {Object} options - Query options
   * @param {string} [provider] - Provider name (defaults to the configured default provider)
   * @returns {Promise<Object>} List of payments
   */
  async listPayments(options = {}, provider) {
    const client = this.getProvider(provider);
    
    try {
      logger.info(`Listing payments from ${provider || this.defaultProvider}`);
      
      const result = await client.listPayments(options);
      
      return result;
    } catch (error) {
      logger.error(`Failed to list payments from ${provider || this.defaultProvider}`, { error });
      
      throw error;
    }
  }
  
  /**
   * Create a refund
   * 
   * @param {Object} refundData - Refund information
   * @param {string} [provider] - Provider name (defaults to the configured default provider)
   * @returns {Promise<Object>} Refund result
   */
  async createRefund(refundData, provider) {
    const client = this.getProvider(provider);
    
    try {
      logger.info(`Creating refund with ${provider || this.defaultProvider}`, { 
        paymentId: refundData.paymentId,
        amount: refundData.amount
      });
      
      const result = await client.createRefund(refundData);
      
      logger.info(`Refund created successfully with ${provider || this.defaultProvider}`, { 
        refundId: result.id,
        status: result.status
      });
      
      return result;
    } catch (error) {
      logger.error(`Failed to create refund with ${provider || this.defaultProvider}`, { 
        error,
        paymentId: refundData.paymentId
      });
      
      throw error;
    }
  }
  
  /**
   * Create a customer
   * 
   * @param {Object} customerData - Customer information
   * @param {string} [provider] - Provider name (defaults to the configured default provider)
   * @returns {Promise<Object>} Customer result
   */
  async createCustomer(customerData, provider) {
    const client = this.getProvider(provider);
    
    try {
      logger.info(`Creating customer with ${provider || this.defaultProvider}`, { 
        email: customerData.email
      });
      
      const result = await client.createCustomer(customerData);
      
      logger.info(`Customer created successfully with ${provider || this.defaultProvider}`, { 
        customerId: result.id
      });
      
      return result;
    } catch (error) {
      logger.error(`Failed to create customer with ${provider || this.defaultProvider}`, { 
        error,
        email: customerData.email
      });
      
      throw error;
    }
  }
  
  /**
   * Create a subscription
   * 
   * @param {Object} subscriptionData - Subscription information
   * @param {string} [provider] - Provider name (defaults to the configured default provider)
   * @returns {Promise<Object>} Subscription result
   */
  async createSubscription(subscriptionData, provider) {
    const client = this.getProvider(provider);
    
    try {
      logger.info(`Creating subscription with ${provider || this.defaultProvider}`, { 
        customerId: subscriptionData.customerId,
        planId: subscriptionData.planId
      });
      
      const result = await client.createSubscription(subscriptionData);
      
      logger.info(`Subscription created successfully with ${provider || this.defaultProvider}`, { 
        subscriptionId: result.id,
        status: result.status
      });
      
      return result;
    } catch (error) {
      logger.error(`Failed to create subscription with ${provider || this.defaultProvider}`, { 
        error,
        customerId: subscriptionData.customerId
      });
      
      throw error;
    }
  }
  
  /**
   * Get available payment methods for a customer
   * 
   * @param {Object} options - Query options
   * @param {string} [provider] - Provider name (defaults to the configured default provider)
   * @returns {Promise<Array>} Available payment methods
   */
  async getAvailablePaymentMethods(options = {}, provider) {
    const client = this.getProvider(provider);
    
    // Check if the provider supports this method
    if (!client.getAvailablePaymentMethods) {
      throw new Error(`Provider '${provider || this.defaultProvider}' does not support getAvailablePaymentMethods`);
    }
    
    try {
      logger.info(`Getting available payment methods from ${provider || this.defaultProvider}`);
      
      const result = await client.getAvailablePaymentMethods(options);
      
      return result;
    } catch (error) {
      logger.error(`Failed to get available payment methods from ${provider || this.defaultProvider}`, { error });
      
      throw error;
    }
  }
  
  /**
   * Get account balance
   * 
   * @param {string} [provider] - Provider name (defaults to the configured default provider)
   * @returns {Promise<Object>} Balance information
   */
  async getBalance(provider) {
    const client = this.getProvider(provider);
    
    // Check if the provider supports this method
    if (!client.getBalance) {
      throw new Error(`Provider '${provider || this.defaultProvider}' does not support getBalance`);
    }
    
    try {
      logger.info(`Getting balance from ${provider || this.defaultProvider}`);
      
      const result = await client.getBalance();
      
      return result;
    } catch (error) {
      logger.error(`Failed to get balance from ${provider || this.defaultProvider}`, { error });
      
      throw error;
    }
  }
}

module.exports = new PaymentGatewayService();