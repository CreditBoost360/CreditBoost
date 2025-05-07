/**
 * Payment Gateway Configuration
 * 
 * This file contains configuration for payment gateways used by CreditBoost.
 * Environment variables should be set in .env file or through the environment.
 */

module.exports = {
  // Default payment gateway provider
  defaultProvider: process.env.DEFAULT_PAYMENT_PROVIDER || 'sunny',
  
  // Payment gateway providers configuration
  providers: {
    // Sunny Payment Gateway
    sunny: process.env.SUNNY_ENABLED === 'true' ? {
      apiKey: process.env.SUNNY_API_KEY,
      apiSecret: process.env.SUNNY_API_SECRET,
      environment: process.env.SUNNY_ENVIRONMENT || 'sandbox',
      options: {
        timeout: parseInt(process.env.SUNNY_TIMEOUT || '30000', 10),
        webhookSecret: process.env.SUNNY_WEBHOOK_SECRET
      }
    } : null,
    
    // Stripe Payment Gateway
    stripe: process.env.STRIPE_ENABLED === 'true' ? {
      apiKey: process.env.STRIPE_API_KEY,
      environment: process.env.STRIPE_ENVIRONMENT || 'sandbox',
      options: {
        timeout: parseInt(process.env.STRIPE_TIMEOUT || '30000', 10),
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        maxRetries: parseInt(process.env.STRIPE_MAX_RETRIES || '2', 10)
      }
    } : null,
    
    // PayPal Payment Gateway
    paypal: process.env.PAYPAL_ENABLED === 'true' ? {
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
      environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
      options: {
        timeout: parseInt(process.env.PAYPAL_TIMEOUT || '30000', 10),
        webhookId: process.env.PAYPAL_WEBHOOK_ID
      }
    } : null,
    
    // Adyen Payment Gateway
    adyen: process.env.ADYEN_ENABLED === 'true' ? {
      apiKey: process.env.ADYEN_API_KEY,
      merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT,
      environment: process.env.ADYEN_ENVIRONMENT || 'test',
      options: {
        timeout: parseInt(process.env.ADYEN_TIMEOUT || '30000', 10),
        hmacKey: process.env.ADYEN_HMAC_KEY
      }
    } : null
  },
  
  // Payment method configuration
  paymentMethods: {
    // Enable/disable specific payment methods
    card: process.env.ENABLE_CARD_PAYMENTS !== 'false',
    bankTransfer: process.env.ENABLE_BANK_TRANSFERS === 'true',
    crypto: process.env.ENABLE_CRYPTO_PAYMENTS === 'true',
    mobileMoney: process.env.ENABLE_MOBILE_MONEY === 'true',
    
    // 3D Secure configuration
    threeDSecure: {
      enabled: process.env.ENABLE_3DS === 'true',
      requiredCountries: (process.env.REQUIRED_3DS_COUNTRIES || 'GB,FR,DE,IT,ES').split(',')
    }
  },
  
  // Credit score integration
  creditScoreIntegration: {
    enabled: process.env.ENABLE_CREDIT_SCORE_INTEGRATION === 'true',
    
    // Tiers and thresholds
    tiers: [
      { name: 'platinum', minScore: 800, feeDiscount: 0.5 },
      { name: 'gold', minScore: 700, feeDiscount: 0.25 },
      { name: 'silver', minScore: 600, feeDiscount: 0.1 },
      { name: 'bronze', minScore: 500, feeDiscount: 0 }
    ],
    
    // Risk levels
    riskLevels: [
      { name: 'very_low', maxScore: 850, minScore: 750 },
      { name: 'low', maxScore: 749, minScore: 650 },
      { name: 'medium', maxScore: 649, minScore: 550 },
      { name: 'high', maxScore: 549, minScore: 450 },
      { name: 'very_high', maxScore: 449, minScore: 300 }
    ]
  },
  
  // Webhook configuration
  webhooks: {
    enabled: process.env.ENABLE_PAYMENT_WEBHOOKS !== 'false',
    endpointSecret: process.env.WEBHOOK_ENDPOINT_SECRET,
    retryAttempts: parseInt(process.env.WEBHOOK_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.WEBHOOK_RETRY_DELAY || '60000', 10) // 1 minute
  },
  
  // Fraud detection configuration
  fraudDetection: {
    enabled: process.env.ENABLE_FRAUD_DETECTION !== 'false',
    blockHighRiskCountries: process.env.BLOCK_HIGH_RISK_COUNTRIES === 'true',
    highRiskCountries: (process.env.HIGH_RISK_COUNTRIES || '').split(',').filter(Boolean),
    maxAmountWithoutVerification: parseInt(process.env.MAX_AMOUNT_WITHOUT_VERIFICATION || '1000', 10),
    velocityChecks: {
      enabled: process.env.ENABLE_VELOCITY_CHECKS !== 'false',
      maxTransactionsPerHour: parseInt(process.env.MAX_TRANSACTIONS_PER_HOUR || '10', 10),
      maxAmountPerHour: parseInt(process.env.MAX_AMOUNT_PER_HOUR || '5000', 10)
    }
  }
};