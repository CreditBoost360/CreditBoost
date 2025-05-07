/**
 * Stripe Payment Gateway Client
 * 
 * This client provides integration with the Stripe payment gateway.
 */

const stripe = require('stripe');
const logger = require('../../../utils/logger');

class StripeClient {
  /**
   * Create a new Stripe API client
   * 
   * @param {Object} config - Configuration options
   * @param {string} config.apiKey - Your Stripe API key
   * @param {string} config.environment - 'sandbox' or 'production'
   * @param {Object} config.options - Additional options
   */
  constructor(config = {}) {
    this.apiKey = config.apiKey;
    this.environment = config.environment || 'sandbox';
    this.options = config.options || {};
    
    // Initialize Stripe client
    this.client = stripe(this.apiKey, {
      apiVersion: '2023-10-16',
      maxNetworkRetries: this.options.maxRetries || 2,
      timeout: this.options.timeout || 30000
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
      let paymentIntent;
      
      // Handle different payment method types
      if (paymentData.paymentMethod?.type === 'card') {
        // For card payments, create a payment method first if card details are provided
        if (paymentData.paymentMethod.card?.number) {
          const paymentMethod = await this.client.paymentMethods.create({
            type: 'card',
            card: {
              number: paymentData.paymentMethod.card.number,
              exp_month: paymentData.paymentMethod.card.exp_month,
              exp_year: paymentData.paymentMethod.card.exp_year,
              cvc: paymentData.paymentMethod.card.cvc
            },
            billing_details: paymentData.billingDetails || {}
          });
          
          // Create payment intent with the payment method
          paymentIntent = await this.client.paymentIntents.create({
            amount: paymentData.amount,
            currency: paymentData.currency.toLowerCase(),
            payment_method: paymentMethod.id,
            confirm: true,
            description: paymentData.description,
            metadata: {
              ...paymentData.metadata,
              integration: 'creditboost'
            },
            receipt_email: paymentData.receiptEmail || paymentData.billingDetails?.email
          });
        } else if (paymentData.paymentMethod.id) {
          // If a payment method ID is provided, use it directly
          paymentIntent = await this.client.paymentIntents.create({
            amount: paymentData.amount,
            currency: paymentData.currency.toLowerCase(),
            payment_method: paymentData.paymentMethod.id,
            confirm: true,
            description: paymentData.description,
            metadata: {
              ...paymentData.metadata,
              integration: 'creditboost'
            },
            receipt_email: paymentData.receiptEmail || paymentData.billingDetails?.email
          });
        } else {
          throw new Error('Invalid payment method: either card details or payment method ID is required');
        }
      } else if (paymentData.paymentMethod?.type === 'bank_transfer') {
        // For bank transfers, create a payment intent with bank transfer details
        paymentIntent = await this.client.paymentIntents.create({
          amount: paymentData.amount,
          currency: paymentData.currency.toLowerCase(),
          payment_method_types: ['ach_debit'],
          description: paymentData.description,
          metadata: {
            ...paymentData.metadata,
            integration: 'creditboost'
          }
        });
      } else {
        // For other payment methods, create a payment intent with the specified type
        paymentIntent = await this.client.paymentIntents.create({
          amount: paymentData.amount,
          currency: paymentData.currency.toLowerCase(),
          payment_method_types: [paymentData.paymentMethod?.type || 'card'],
          description: paymentData.description,
          metadata: {
            ...paymentData.metadata,
            integration: 'creditboost'
          }
        });
      }
      
      // Map Stripe response to standardized format
      return this._mapPaymentResponse(paymentIntent);
    } catch (error) {
      logger.error('Stripe payment processing failed', { error });
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
      const paymentIntent = await this.client.paymentIntents.retrieve(paymentId);
      return this._mapPaymentResponse(paymentIntent);
    } catch (error) {
      logger.error('Failed to get Stripe payment details', { error, paymentId });
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
      const stripeOptions = {
        limit: options.limit || 10
      };
      
      // Map pagination parameters
      if (options.startingAfter) {
        stripeOptions.starting_after = options.startingAfter;
      }
      
      if (options.endingBefore) {
        stripeOptions.ending_before = options.endingBefore;
      }
      
      // Map date filters
      if (options.createdAfter) {
        stripeOptions.created = {
          gte: Math.floor(options.createdAfter.getTime() / 1000)
        };
      }
      
      if (options.createdBefore) {
        stripeOptions.created = {
          ...(stripeOptions.created || {}),
          lte: Math.floor(options.createdBefore.getTime() / 1000)
        };
      }
      
      const paymentIntents = await this.client.paymentIntents.list(stripeOptions);
      
      // Map to standardized format
      return {
        data: paymentIntents.data.map(this._mapPaymentResponse),
        has_more: paymentIntents.has_more,
        next_cursor: paymentIntents.data.length > 0 ? paymentIntents.data[paymentIntents.data.length - 1].id : null
      };
    } catch (error) {
      logger.error('Failed to list Stripe payments', { error });
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
      const refund = await this.client.refunds.create({
        payment_intent: refundData.paymentId,
        amount: refundData.amount,
        reason: this._mapRefundReason(refundData.reason),
        metadata: {
          ...refundData.metadata,
          integration: 'creditboost'
        }
      });
      
      // Map to standardized format
      return {
        id: refund.id,
        payment_id: refundData.paymentId,
        amount: refund.amount,
        currency: refund.currency,
        status: this._mapRefundStatus(refund.status),
        reason: refundData.reason,
        metadata: refund.metadata,
        created_at: new Date(refund.created * 1000).toISOString()
      };
    } catch (error) {
      logger.error('Failed to create Stripe refund', { error, paymentId: refundData.paymentId });
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
      const customer = await this.client.customers.create({
        email: customerData.email,
        name: customerData.name,
        phone: customerData.phone,
        address: customerData.address,
        metadata: {
          ...customerData.metadata,
          integration: 'creditboost'
        }
      });
      
      // Map to standardized format
      return {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        metadata: customer.metadata,
        created_at: new Date(customer.created * 1000).toISOString()
      };
    } catch (error) {
      logger.error('Failed to create Stripe customer', { error });
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
      const subscription = await this.client.subscriptions.create({
        customer: subscriptionData.customerId,
        items: [
          {
            price: subscriptionData.planId
          }
        ],
        default_payment_method: subscriptionData.paymentMethodId,
        metadata: {
          ...subscriptionData.metadata,
          integration: 'creditboost'
        }
      });
      
      // Map to standardized format
      return {
        id: subscription.id,
        customer_id: subscription.customer,
        payment_method_id: subscription.default_payment_method,
        plan_id: subscription.items.data[0].price.id,
        status: this._mapSubscriptionStatus(subscription.status),
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        metadata: subscription.metadata,
        created_at: new Date(subscription.created * 1000).toISOString()
      };
    } catch (error) {
      logger.error('Failed to create Stripe subscription', { error });
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
      // Stripe doesn't have a direct equivalent, so we'll return a standard list
      // based on the country and currency
      const country = options.country || 'US';
      const currency = options.currency || 'USD';
      
      // Basic payment methods available everywhere
      const paymentMethods = [
        {
          type: 'card',
          name: 'Credit or Debit Card',
          currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
          countries: ['US', 'CA', 'GB', 'AU', 'JP', 'FR', 'DE', 'IT', 'ES']
        }
      ];
      
      // Add country-specific payment methods
      if (country === 'US') {
        paymentMethods.push({
          type: 'ach_debit',
          name: 'ACH Direct Debit',
          currencies: ['USD'],
          countries: ['US']
        });
      } else if (country === 'GB') {
        paymentMethods.push({
          type: 'bacs_debit',
          name: 'BACS Direct Debit',
          currencies: ['GBP'],
          countries: ['GB']
        });
      } else if (country === 'EU' || ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT'].includes(country)) {
        paymentMethods.push({
          type: 'sepa_debit',
          name: 'SEPA Direct Debit',
          currencies: ['EUR'],
          countries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT']
        });
      }
      
      // Filter by currency if provided
      const filteredMethods = currency
        ? paymentMethods.filter(method => method.currencies.includes(currency))
        : paymentMethods;
      
      return filteredMethods;
    } catch (error) {
      logger.error('Failed to get available Stripe payment methods', { error });
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
      const balance = await this.client.balance.retrieve();
      
      // Map to standardized format
      const available = balance.available.reduce((acc, b) => {
        acc[b.currency.toUpperCase()] = b.amount;
        return acc;
      }, {});
      
      const pending = balance.pending.reduce((acc, b) => {
        acc[b.currency.toUpperCase()] = b.amount;
        return acc;
      }, {});
      
      return {
        available,
        pending,
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to get Stripe balance', { error });
      this._handleApiError(error);
    }
  }
  
  /**
   * Map Stripe payment intent to standardized response format
   * 
   * @private
   * @param {Object} paymentIntent - Stripe payment intent
   * @returns {Object} Standardized payment response
   */
  _mapPaymentResponse(paymentIntent) {
    // Extract payment method details
    let paymentMethod = {
      type: 'unknown'
    };
    
    if (paymentIntent.payment_method_types && paymentIntent.payment_method_types.length > 0) {
      paymentMethod.type = paymentIntent.payment_method_types[0];
    }
    
    if (paymentIntent.charges && paymentIntent.charges.data.length > 0) {
      const charge = paymentIntent.charges.data[0];
      if (charge.payment_method_details) {
        if (charge.payment_method_details.card) {
          paymentMethod = {
            type: 'card',
            card: {
              brand: charge.payment_method_details.card.brand,
              last4: charge.payment_method_details.card.last4,
              exp_month: charge.payment_method_details.card.exp_month,
              exp_year: charge.payment_method_details.card.exp_year
            }
          };
        } else if (charge.payment_method_details.ach_debit) {
          paymentMethod = {
            type: 'bank_transfer',
            bank_transfer: {
              bank_name: charge.payment_method_details.ach_debit.bank_name,
              last4: charge.payment_method_details.ach_debit.last4
            }
          };
        }
      }
    }
    
    // Map to standardized format
    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase(),
      status: this._mapPaymentStatus(paymentIntent.status),
      payment_method: paymentMethod,
      description: paymentIntent.description,
      metadata: paymentIntent.metadata,
      created_at: new Date(paymentIntent.created * 1000).toISOString()
    };
  }
  
  /**
   * Map Stripe payment status to standardized status
   * 
   * @private
   * @param {string} status - Stripe payment status
   * @returns {string} Standardized payment status
   */
  _mapPaymentStatus(status) {
    switch (status) {
      case 'succeeded':
        return 'succeeded';
      case 'processing':
        return 'processing';
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
      case 'requires_capture':
        return 'pending';
      case 'canceled':
        return 'canceled';
      default:
        return 'failed';
    }
  }
  
  /**
   * Map standardized refund reason to Stripe refund reason
   * 
   * @private
   * @param {string} reason - Standardized refund reason
   * @returns {string} Stripe refund reason
   */
  _mapRefundReason(reason) {
    switch (reason) {
      case 'duplicate':
        return 'duplicate';
      case 'fraudulent':
        return 'fraudulent';
      case 'customer_requested':
        return 'requested_by_customer';
      default:
        return null;
    }
  }
  
  /**
   * Map Stripe refund status to standardized status
   * 
   * @private
   * @param {string} status - Stripe refund status
   * @returns {string} Standardized refund status
   */
  _mapRefundStatus(status) {
    switch (status) {
      case 'succeeded':
        return 'succeeded';
      case 'pending':
        return 'pending';
      case 'failed':
        return 'failed';
      case 'canceled':
        return 'canceled';
      default:
        return 'processing';
    }
  }
  
  /**
   * Map Stripe subscription status to standardized status
   * 
   * @private
   * @param {string} status - Stripe subscription status
   * @returns {string} Standardized subscription status
   */
  _mapSubscriptionStatus(status) {
    switch (status) {
      case 'active':
        return 'active';
      case 'trialing':
        return 'trialing';
      case 'past_due':
        return 'past_due';
      case 'canceled':
        return 'canceled';
      case 'unpaid':
        return 'unpaid';
      case 'incomplete':
      case 'incomplete_expired':
        return 'incomplete';
      default:
        return 'unknown';
    }
  }
  
  /**
   * Handle API errors
   * 
   * @private
   * @param {Error} error - API error
   * @throws {Error} Enhanced error with details
   */
  _handleApiError(error) {
    if (error.type) {
      // This is a Stripe error
      const apiError = new Error(error.message || 'Stripe API error');
      apiError.status = error.statusCode;
      apiError.code = error.code;
      apiError.type = error.type;
      apiError.param = error.param;
      throw apiError;
    } else {
      // This is some other error
      throw error;
    }
  }
}

module.exports = StripeClient;