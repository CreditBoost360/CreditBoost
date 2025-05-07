/**
 * Sunny Payment Gateway - Constants
 * 
 * Defines constants used throughout the payment gateway
 */

// Payment status codes
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REJECTED: 'rejected',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
  CANCELED: 'canceled',
  ERROR: 'error'
};

// Payment methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  MOBILE_MONEY: 'mobile_money',
  CRYPTO: 'crypto',
  WALLET: 'wallet'
};

// Transaction types
export const TRANSACTION_TYPES = {
  PAYMENT: 'payment',
  REFUND: 'refund',
  PAYOUT: 'payout',
  TRANSFER: 'transfer',
  FEE: 'fee',
  ADJUSTMENT: 'adjustment'
};

// Error codes
export const ERROR_CODES = {
  // Validation errors
  VALIDATION_ERROR: 'validation_error',
  INVALID_AMOUNT: 'invalid_amount',
  INVALID_CURRENCY: 'invalid_currency',
  INVALID_PAYMENT_METHOD: 'invalid_payment_method',
  INVALID_CARD: 'invalid_card',
  INVALID_BANK_ACCOUNT: 'invalid_bank_account',
  INVALID_MOBILE_NUMBER: 'invalid_mobile_number',
  INVALID_CRYPTO_ADDRESS: 'invalid_crypto_address',
  INVALID_REFUND_AMOUNT: 'invalid_refund_amount',
  
  // Processing errors
  PROCESSING_ERROR: 'processing_error',
  INSUFFICIENT_FUNDS: 'insufficient_funds',
  CARD_DECLINED: 'card_declined',
  EXPIRED_CARD: 'expired_card',
  INCORRECT_CVV: 'incorrect_cvv',
  BANK_ACCOUNT_ERROR: 'bank_account_error',
  MOBILE_MONEY_ERROR: 'mobile_money_error',
  CRYPTO_ERROR: 'crypto_error',
  
  // System errors
  SYSTEM_ERROR: 'system_error',
  NETWORK_ERROR: 'network_error',
  TIMEOUT_ERROR: 'timeout_error',
  
  // Security errors
  FRAUD_DETECTED: 'fraud_detected',
  SECURITY_VIOLATION: 'security_violation',
  INVALID_SIGNATURE: 'invalid_signature',
  
  // Transaction errors
  TRANSACTION_NOT_FOUND: 'transaction_not_found',
  DUPLICATE_TRANSACTION: 'duplicate_transaction',
  INVALID_TRANSACTION_STATE: 'invalid_transaction_state',
  
  // API errors
  AUTHENTICATION_ERROR: 'authentication_error',
  AUTHORIZATION_ERROR: 'authorization_error',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  
  // Feature errors
  UNSUPPORTED_PAYMENT_METHOD: 'unsupported_payment_method',
  UNSUPPORTED_CURRENCY: 'unsupported_currency',
  UNSUPPORTED_COUNTRY: 'unsupported_country',
  
  // Other errors
  VERIFICATION_ERROR: 'verification_error',
  REFUND_ERROR: 'refund_error',
  TOKENIZATION_ERROR: 'tokenization_error',
  PAYMENT_LINK_ERROR: 'payment_link_error',
  BALANCE_CHECK_ERROR: 'balance_check_error'
};

// Currency codes
export const CURRENCY_CODES = [
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR', 'BRL', 'MXN',
  'ZAR', 'SGD', 'HKD', 'SEK', 'NOK', 'DKK', 'CHF', 'NZD', 'THB', 'KES',
  'NGN', 'UGX', 'TZS', 'RWF', 'BTC', 'ETH', 'XRP', 'LTC', 'BCH'
];

// Country codes
export const COUNTRY_CODES = [
  'US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'AU', 'JP', 'CN', 'IN', 'BR',
  'MX', 'ZA', 'SG', 'HK', 'SE', 'NO', 'DK', 'CH', 'NZ', 'TH', 'KE', 'NG',
  'UG', 'TZ', 'RW'
];

// Card brands
export const CARD_BRANDS = {
  VISA: 'visa',
  MASTERCARD: 'mastercard',
  AMEX: 'amex',
  DISCOVER: 'discover',
  JCB: 'jcb',
  DINERS: 'diners',
  UNIONPAY: 'unionpay'
};

// Bank account types
export const BANK_ACCOUNT_TYPES = {
  CHECKING: 'checking',
  SAVINGS: 'savings',
  BUSINESS_CHECKING: 'business_checking'
};

// Mobile money providers
export const MOBILE_MONEY_PROVIDERS = {
  MPESA: 'mpesa',
  MTN: 'mtn',
  AIRTEL: 'airtel',
  ORANGE: 'orange',
  VODAFONE: 'vodafone'
};

// Cryptocurrency networks
export const CRYPTO_NETWORKS = {
  BITCOIN: 'bitcoin',
  ETHEREUM: 'ethereum',
  RIPPLE: 'ripple',
  LITECOIN: 'litecoin',
  BITCOIN_CASH: 'bitcoin_cash'
};

// Webhook event types
export const WEBHOOK_EVENTS = {
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
  PAYMENT_DISPUTED: 'payment.disputed',
  PAYOUT_CREATED: 'payout.created',
  PAYOUT_PAID: 'payout.paid',
  PAYOUT_FAILED: 'payout.failed'
};

// API endpoints
export const API_ENDPOINTS = {
  PAYMENTS: '/payments',
  REFUNDS: '/refunds',
  PAYOUTS: '/payouts',
  TOKENS: '/tokens',
  PAYMENT_LINKS: '/payment_links',
  BALANCE: '/balance',
  WEBHOOKS: '/webhooks'
};

// Compliance levels
export const COMPLIANCE_LEVELS = {
  BASIC: 'basic',
  STANDARD: 'standard',
  ENHANCED: 'enhanced'
};

// Risk levels
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// Fee types
export const FEE_TYPES = {
  TRANSACTION: 'transaction',
  REFUND: 'refund',
  CHARGEBACK: 'chargeback',
  PAYOUT: 'payout',
  CURRENCY_CONVERSION: 'currency_conversion'
};

// Settlement periods (in hours)
export const SETTLEMENT_PERIODS = {
  CARD: 48,
  BANK_TRANSFER: 72,
  MOBILE_MONEY: 24,
  CRYPTO: 1
};