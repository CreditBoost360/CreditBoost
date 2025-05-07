/**
 * Sunny Payment Gateway - Validation Module
 * 
 * Validates payment data before processing
 */

import { PAYMENT_METHODS, CURRENCY_CODES } from './constants.js';

/**
 * Validate payment data
 * 
 * @param {Object} paymentData - Payment data to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
export function validatePaymentData(paymentData) {
  const errors = [];
  
  // Check required fields
  if (!paymentData) {
    return { isValid: false, errors: ['Payment data is required'] };
  }
  
  // Validate amount
  if (!paymentData.amount) {
    errors.push('Amount is required');
  } else if (typeof paymentData.amount !== 'number' || isNaN(paymentData.amount)) {
    errors.push('Amount must be a valid number');
  } else if (paymentData.amount <= 0) {
    errors.push('Amount must be greater than zero');
  }
  
  // Validate currency
  if (!paymentData.currency) {
    errors.push('Currency is required');
  } else if (!CURRENCY_CODES.includes(paymentData.currency.toUpperCase())) {
    errors.push(`Currency ${paymentData.currency} is not supported`);
  }
  
  // Validate payment method
  if (!paymentData.paymentMethod) {
    errors.push('Payment method is required');
  } else {
    const method = paymentData.paymentMethod.toLowerCase();
    const validMethods = Object.values(PAYMENT_METHODS).map(m => m.toLowerCase());
    
    if (!validMethods.includes(method)) {
      errors.push(`Payment method ${paymentData.paymentMethod} is not supported`);
    } else {
      // Validate payment method specific data
      switch (method) {
        case PAYMENT_METHODS.CARD.toLowerCase():
          errors.push(...validateCardData(paymentData.card));
          break;
        case PAYMENT_METHODS.BANK_TRANSFER.toLowerCase():
          errors.push(...validateBankData(paymentData.bankAccount));
          break;
        case PAYMENT_METHODS.MOBILE_MONEY.toLowerCase():
          errors.push(...validateMobileMoneyData(paymentData.mobileMoney));
          break;
        case PAYMENT_METHODS.CRYPTO.toLowerCase():
          errors.push(...validateCryptoData(paymentData.crypto));
          break;
      }
    }
  }
  
  // Validate customer data
  if (paymentData.customer) {
    errors.push(...validateCustomerData(paymentData.customer));
  }
  
  // Return validation result
  return {
    isValid: errors.length === 0,
    errors: errors.filter(Boolean) // Remove any undefined/null entries
  };
}

/**
 * Validate card payment data
 * 
 * @param {Object} cardData - Card data to validate
 * @returns {Array} Array of validation errors
 */
function validateCardData(cardData) {
  const errors = [];
  
  if (!cardData) {
    return ['Card data is required for card payments'];
  }
  
  // Validate card number
  if (!cardData.number) {
    errors.push('Card number is required');
  } else if (!isValidCardNumber(cardData.number)) {
    errors.push('Invalid card number');
  }
  
  // Validate expiration
  if (!cardData.expiryMonth || !cardData.expiryYear) {
    errors.push('Card expiration date is required');
  } else {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    
    const expiryMonth = parseInt(cardData.expiryMonth, 10);
    const expiryYear = parseInt(cardData.expiryYear, 10);
    
    if (isNaN(expiryMonth) || expiryMonth < 1 || expiryMonth > 12) {
      errors.push('Invalid expiration month');
    }
    
    if (isNaN(expiryYear)) {
      errors.push('Invalid expiration year');
    } else if (expiryYear < currentYear || 
              (expiryYear === currentYear && expiryMonth < currentMonth)) {
      errors.push('Card has expired');
    }
  }
  
  // Validate CVV
  if (!cardData.cvv) {
    errors.push('CVV is required');
  } else if (!/^[0-9]{3,4}$/.test(cardData.cvv)) {
    errors.push('Invalid CVV format');
  }
  
  // Validate cardholder name
  if (!cardData.holderName) {
    errors.push('Cardholder name is required');
  } else if (cardData.holderName.length < 2) {
    errors.push('Cardholder name is too short');
  }
  
  return errors;
}

/**
 * Validate bank transfer data
 * 
 * @param {Object} bankData - Bank account data to validate
 * @returns {Array} Array of validation errors
 */
function validateBankData(bankData) {
  const errors = [];
  
  if (!bankData) {
    return ['Bank account data is required for bank transfers'];
  }
  
  // Validate account holder name
  if (!bankData.accountHolderName) {
    errors.push('Account holder name is required');
  } else if (bankData.accountHolderName.length < 2) {
    errors.push('Account holder name is too short');
  }
  
  // Validate account number
  if (!bankData.accountNumber) {
    errors.push('Account number is required');
  } else if (!/^[0-9]{5,17}$/.test(bankData.accountNumber.replace(/\\s/g, ''))) {
    errors.push('Invalid account number format');
  }
  
  // Validate routing number / sort code / SWIFT / BIC
  if (!bankData.routingNumber && !bankData.swiftCode) {
    errors.push('Routing number or SWIFT code is required');
  } else if (bankData.routingNumber && !/^[0-9]{9}$/.test(bankData.routingNumber)) {
    errors.push('Invalid routing number format');
  } else if (bankData.swiftCode && !/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bankData.swiftCode)) {
    errors.push('Invalid SWIFT/BIC code format');
  }
  
  // Validate bank name
  if (!bankData.bankName) {
    errors.push('Bank name is required');
  }
  
  return errors;
}

/**
 * Validate mobile money data
 * 
 * @param {Object} mobileData - Mobile money data to validate
 * @returns {Array} Array of validation errors
 */
function validateMobileMoneyData(mobileData) {
  const errors = [];
  
  if (!mobileData) {
    return ['Mobile money data is required for mobile money payments'];
  }
  
  // Validate phone number
  if (!mobileData.phoneNumber) {
    errors.push('Phone number is required');
  } else if (!/^\\+?[0-9]{10,15}$/.test(mobileData.phoneNumber.replace(/\\s/g, ''))) {
    errors.push('Invalid phone number format');
  }
  
  // Validate provider
  if (!mobileData.provider) {
    errors.push('Mobile money provider is required');
  }
  
  // Validate account holder name
  if (!mobileData.accountHolderName) {
    errors.push('Account holder name is required');
  }
  
  return errors;
}

/**
 * Validate cryptocurrency data
 * 
 * @param {Object} cryptoData - Cryptocurrency data to validate
 * @returns {Array} Array of validation errors
 */
function validateCryptoData(cryptoData) {
  const errors = [];
  
  if (!cryptoData) {
    return ['Cryptocurrency data is required for crypto payments'];
  }
  
  // Validate currency
  if (!cryptoData.currency) {
    errors.push('Cryptocurrency type is required');
  }
  
  // Validate wallet address
  if (!cryptoData.walletAddress) {
    errors.push('Wallet address is required');
  } else {
    // Basic validation for common crypto addresses
    // In a real implementation, you would use more specific validation per currency
    if (cryptoData.currency === 'BTC' && !/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(cryptoData.walletAddress)) {
      errors.push('Invalid Bitcoin address format');
    } else if (cryptoData.currency === 'ETH' && !/^0x[a-fA-F0-9]{40}$/.test(cryptoData.walletAddress)) {
      errors.push('Invalid Ethereum address format');
    }
  }
  
  return errors;
}

/**
 * Validate customer data
 * 
 * @param {Object} customerData - Customer data to validate
 * @returns {Array} Array of validation errors
 */
function validateCustomerData(customerData) {
  const errors = [];
  
  if (!customerData) {
    return [];  // Customer data is optional
  }
  
  // Validate email if provided
  if (customerData.email && !isValidEmail(customerData.email)) {
    errors.push('Invalid email format');
  }
  
  // Validate phone if provided
  if (customerData.phone && !isValidPhone(customerData.phone)) {
    errors.push('Invalid phone number format');
  }
  
  // Validate address if provided
  if (customerData.address) {
    if (!customerData.address.country) {
      errors.push('Country is required in address');
    }
  }
  
  return errors;
}

/**
 * Validate a credit card number using Luhn algorithm
 * 
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} True if card number is valid
 */
function isValidCardNumber(cardNumber) {
  if (!cardNumber) return false;
  
  // Remove spaces and dashes
  const sanitized = cardNumber.replace(/[\\s-]/g, '');
  
  // Check if contains only digits
  if (!/^[0-9]{13,19}$/.test(sanitized)) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let double = false;
  
  // Loop from right to left
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);
    
    if (double) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    double = !double;
  }
  
  return sum % 10 === 0;
}

/**
 * Validate email format
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} True if email format is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 * 
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone format is valid
 */
function isValidPhone(phone) {
  // Basic international phone validation
  // Allows +, spaces, dashes, and parentheses
  const phoneRegex = /^\\+?[0-9\\s\\-()]{8,20}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate refund data
 * 
 * @param {Object} refundData - Refund data to validate
 * @param {Object} originalTransaction - Original transaction data
 * @returns {Object} Validation result with isValid flag and errors array
 */
export function validateRefundData(refundData, originalTransaction) {
  const errors = [];
  
  if (!refundData) {
    return { isValid: false, errors: ['Refund data is required'] };
  }
  
  // Validate refund amount if provided
  if (refundData.amount !== undefined) {
    if (typeof refundData.amount !== 'number' || isNaN(refundData.amount)) {
      errors.push('Refund amount must be a valid number');
    } else if (refundData.amount <= 0) {
      errors.push('Refund amount must be greater than zero');
    } else if (refundData.amount > originalTransaction.amount) {
      errors.push('Refund amount cannot exceed original transaction amount');
    }
  }
  
  // Validate reason if provided
  if (refundData.reason && typeof refundData.reason !== 'string') {
    errors.push('Refund reason must be a string');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate payment link data
 * 
 * @param {Object} paymentLinkData - Payment link data to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
export function validatePaymentLinkData(paymentLinkData) {
  const errors = [];
  
  if (!paymentLinkData) {
    return { isValid: false, errors: ['Payment link data is required'] };
  }
  
  // Validate amount
  if (!paymentLinkData.amount) {
    errors.push('Amount is required');
  } else if (typeof paymentLinkData.amount !== 'number' || isNaN(paymentLinkData.amount)) {
    errors.push('Amount must be a valid number');
  } else if (paymentLinkData.amount <= 0) {
    errors.push('Amount must be greater than zero');
  }
  
  // Validate currency
  if (!paymentLinkData.currency) {
    errors.push('Currency is required');
  } else if (!CURRENCY_CODES.includes(paymentLinkData.currency.toUpperCase())) {
    errors.push(`Currency ${paymentLinkData.currency} is not supported`);
  }
  
  // Validate description
  if (!paymentLinkData.description) {
    errors.push('Description is required');
  } else if (typeof paymentLinkData.description !== 'string') {
    errors.push('Description must be a string');
  }
  
  // Validate expiry if provided
  if (paymentLinkData.expiresIn !== undefined) {
    if (typeof paymentLinkData.expiresIn !== 'number' || isNaN(paymentLinkData.expiresIn)) {
      errors.push('Expiry time must be a valid number');
    } else if (paymentLinkData.expiresIn <= 0) {
      errors.push('Expiry time must be greater than zero');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}