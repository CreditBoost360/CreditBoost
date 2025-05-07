/**
 * Sunny Payment Gateway - Request Validator
 * 
 * Advanced request validation middleware for payment API endpoints
 */

import { PAYMENT_METHODS, CURRENCY_CODES } from '../constants.js';

// Schema for card payment data
const cardSchema = {
  validate: (card) => {
    const errors = [];
    
    if (!card) {
      return { isValid: false, errors: ['Card data is required'] };
    }
    
    if (!card.number) {
      errors.push('Card number is required');
    } else if (!/^[0-9]{13,19}$/.test(card.number.replace(/\s/g, ''))) {
      errors.push('Card number must contain 13-19 digits only');
    } else if (!validateCardNumber(card.number)) {
      errors.push('Invalid card number (failed Luhn check)');
    }
    
    if (!card.expiryMonth) {
      errors.push('Expiry month is required');
    } else if (!/^(0[1-9]|1[0-2])$/.test(card.expiryMonth)) {
      errors.push('Expiry month must be between 01-12');
    }
    
    if (!card.expiryYear) {
      errors.push('Expiry year is required');
    } else if (!/^[0-9]{4}$/.test(card.expiryYear)) {
      errors.push('Expiry year must be a 4-digit number');
    } else {
      // Check if card is expired
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
      
      const expiryYear = parseInt(card.expiryYear, 10);
      const expiryMonth = parseInt(card.expiryMonth, 10);
      
      if (expiryYear < currentYear || 
          (expiryYear === currentYear && expiryMonth < currentMonth)) {
        errors.push('Card has expired');
      }
    }
    
    if (!card.cvv) {
      errors.push('CVV is required');
    } else if (!/^[0-9]{3,4}$/.test(card.cvv)) {
      errors.push('CVV must be 3-4 digits');
    }
    
    if (!card.holderName) {
      errors.push('Cardholder name is required');
    } else if (card.holderName.length < 2) {
      errors.push('Cardholder name must be at least 2 characters');
    } else if (card.holderName.length > 100) {
      errors.push('Cardholder name cannot exceed 100 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Schema for bank account data
const bankAccountSchema = {
  validate: (bankAccount) => {
    const errors = [];
    
    if (!bankAccount) {
      return { isValid: false, errors: ['Bank account data is required'] };
    }
    
    if (!bankAccount.accountNumber) {
      errors.push('Account number is required');
    } else if (!/^[0-9]{5,17}$/.test(bankAccount.accountNumber.replace(/\s/g, ''))) {
      errors.push('Account number must contain 5-17 digits');
    }
    
    if (!bankAccount.routingNumber && !bankAccount.swiftCode) {
      errors.push('Either routing number or SWIFT code is required');
    } else {
      if (bankAccount.routingNumber && !/^[0-9]{9}$/.test(bankAccount.routingNumber)) {
        errors.push('Routing number must contain 9 digits');
      }
      
      if (bankAccount.swiftCode && !/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bankAccount.swiftCode)) {
        errors.push('Invalid SWIFT/BIC code format');
      }
    }
    
    if (!bankAccount.accountHolderName) {
      errors.push('Account holder name is required');
    } else if (bankAccount.accountHolderName.length < 2) {
      errors.push('Account holder name must be at least 2 characters');
    } else if (bankAccount.accountHolderName.length > 100) {
      errors.push('Account holder name cannot exceed 100 characters');
    }
    
    if (!bankAccount.bankName) {
      errors.push('Bank name is required');
    } else if (bankAccount.bankName.length < 2) {
      errors.push('Bank name must be at least 2 characters');
    } else if (bankAccount.bankName.length > 100) {
      errors.push('Bank name cannot exceed 100 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Schema for mobile money data
const mobileMoneySchema = {
  validate: (mobileMoney) => {
    const errors = [];
    
    if (!mobileMoney) {
      return { isValid: false, errors: ['Mobile money data is required'] };
    }
    
    if (!mobileMoney.phoneNumber) {
      errors.push('Phone number is required');
    } else if (!/^\+?[0-9]{10,15}$/.test(mobileMoney.phoneNumber.replace(/\s/g, ''))) {
      errors.push('Invalid phone number format');
    }
    
    if (!mobileMoney.provider) {
      errors.push('Mobile money provider is required');
    }
    
    if (!mobileMoney.accountHolderName) {
      errors.push('Account holder name is required');
    } else if (mobileMoney.accountHolderName.length < 2) {
      errors.push('Account holder name must be at least 2 characters');
    } else if (mobileMoney.accountHolderName.length > 100) {
      errors.push('Account holder name cannot exceed 100 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Schema for crypto payment data
const cryptoSchema = {
  validate: (crypto) => {
    const errors = [];
    
    if (!crypto) {
      return { isValid: false, errors: ['Cryptocurrency data is required'] };
    }
    
    if (!crypto.currency) {
      errors.push('Cryptocurrency type is required');
    } else {
      const supportedCurrencies = ['BTC', 'ETH', 'XRP', 'LTC', 'BCH'];
      if (!supportedCurrencies.includes(crypto.currency)) {
        errors.push(`Supported cryptocurrencies: ${supportedCurrencies.join(', ')}`);
      }
    }
    
    if (!crypto.walletAddress) {
      errors.push('Wallet address is required');
    } else if (crypto.walletAddress.length < 26) {
      errors.push('Wallet address is too short');
    } else if (crypto.walletAddress.length > 100) {
      errors.push('Wallet address is too long');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Schema for customer data
const customerSchema = {
  validate: (customer) => {
    const errors = [];
    
    if (!customer) {
      return { isValid: false, errors: ['Customer information is required'] };
    }
    
    if (!customer.email) {
      errors.push('Email is required');
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(customer.email)) {
      errors.push('Invalid email format');
    }
    
    if (customer.phone && !/^\+?[0-9\s\-()]{8,20}$/.test(customer.phone)) {
      errors.push('Invalid phone number format');
    }
    
    if (customer.address) {
      if (!customer.address.country) {
        errors.push('Country is required in address');
      } else if (customer.address.country.length !== 2) {
        errors.push('Country code must be 2 characters (ISO 3166-1 alpha-2)');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

/**
 * Validate a credit card number using Luhn algorithm
 * 
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} True if card number is valid
 */
function validateCardNumber(cardNumber) {
  if (!cardNumber) return false;
  
  // Remove spaces and dashes
  const sanitized = cardNumber.replace(/[\s-]/g, '');
  
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
 * Validate payment request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function validatePaymentRequest(req, res, next) {
  const paymentData = req.body;
  const errors = [];
  
  // Validate required fields
  if (!paymentData) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Payment data is required',
      details: ['Request body is empty']
    });
  }
  
  // Validate amount
  if (!paymentData.amount) {
    errors.push('Amount is required');
  } else if (typeof paymentData.amount !== 'number' || isNaN(paymentData.amount)) {
    errors.push('Amount must be a number');
  } else if (paymentData.amount <= 0) {
    errors.push('Amount must be greater than zero');
  } else if (!/^\d+(\.\d{1,2})?$/.test(paymentData.amount.toString())) {
    errors.push('Amount cannot have more than 2 decimal places');
  }
  
  // Validate currency
  if (!paymentData.currency) {
    errors.push('Currency is required');
  } else if (!CURRENCY_CODES.includes(paymentData.currency.toUpperCase())) {
    errors.push('Unsupported currency');
  }
  
  // Validate payment method
  if (!paymentData.paymentMethod) {
    errors.push('Payment method is required');
  } else {
    const method = paymentData.paymentMethod.toLowerCase();
    const validMethods = Object.values(PAYMENT_METHODS).map(m => m.toLowerCase());
    
    if (!validMethods.includes(method)) {
      errors.push(`Unsupported payment method. Valid methods: ${Object.values(PAYMENT_METHODS).join(', ')}`);
    } else {
      // Validate payment method specific data
      switch (method) {
        case PAYMENT_METHODS.CARD.toLowerCase():
          const cardValidation = cardSchema.validate(paymentData.card);
          if (!cardValidation.isValid) {
            errors.push(...cardValidation.errors);
          }
          break;
        case PAYMENT_METHODS.BANK_TRANSFER.toLowerCase():
          const bankValidation = bankAccountSchema.validate(paymentData.bankAccount);
          if (!bankValidation.isValid) {
            errors.push(...bankValidation.errors);
          }
          break;
        case PAYMENT_METHODS.MOBILE_MONEY.toLowerCase():
          const mobileValidation = mobileMoneySchema.validate(paymentData.mobileMoney);
          if (!mobileValidation.isValid) {
            errors.push(...mobileValidation.errors);
          }
          break;
        case PAYMENT_METHODS.CRYPTO.toLowerCase():
          const cryptoValidation = cryptoSchema.validate(paymentData.crypto);
          if (!cryptoValidation.isValid) {
            errors.push(...cryptoValidation.errors);
          }
          break;
      }
    }
  }
  
  // Validate customer data
  const customerValidation = customerSchema.validate(paymentData.customer);
  if (!customerValidation.isValid) {
    errors.push(...customerValidation.errors);
  }
  
  // Validate description length if provided
  if (paymentData.description && paymentData.description.length > 255) {
    errors.push('Description cannot exceed 255 characters');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Invalid payment data',
      details: errors
    });
  }
  
  next();
}

/**
 * Validate refund request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function validateRefundRequest(req, res, next) {
  const refundData = req.body;
  const errors = [];
  
  // Validate amount if provided
  if (refundData.amount !== undefined) {
    if (typeof refundData.amount !== 'number' || isNaN(refundData.amount)) {
      errors.push('Amount must be a number');
    } else if (refundData.amount <= 0) {
      errors.push('Amount must be greater than zero');
    } else if (!/^\d+(\.\d{1,2})?$/.test(refundData.amount.toString())) {
      errors.push('Amount cannot have more than 2 decimal places');
    }
  }
  
  // Validate reason length if provided
  if (refundData.reason && refundData.reason.length > 255) {
    errors.push('Reason cannot exceed 255 characters');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Invalid refund data',
      details: errors
    });
  }
  
  next();
}

/**
 * Validate payment link request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function validatePaymentLinkRequest(req, res, next) {
  const linkData = req.body;
  const errors = [];
  
  // Validate required fields
  if (!linkData) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Payment link data is required',
      details: ['Request body is empty']
    });
  }
  
  // Validate amount
  if (!linkData.amount) {
    errors.push('Amount is required');
  } else if (typeof linkData.amount !== 'number' || isNaN(linkData.amount)) {
    errors.push('Amount must be a number');
  } else if (linkData.amount <= 0) {
    errors.push('Amount must be greater than zero');
  } else if (!/^\d+(\.\d{1,2})?$/.test(linkData.amount.toString())) {
    errors.push('Amount cannot have more than 2 decimal places');
  }
  
  // Validate currency
  if (!linkData.currency) {
    errors.push('Currency is required');
  } else if (!CURRENCY_CODES.includes(linkData.currency.toUpperCase())) {
    errors.push('Unsupported currency');
  }
  
  // Validate description
  if (!linkData.description) {
    errors.push('Description is required');
  } else if (linkData.description.length > 255) {
    errors.push('Description cannot exceed 255 characters');
  }
  
  // Validate expiresIn if provided
  if (linkData.expiresIn !== undefined) {
    if (typeof linkData.expiresIn !== 'number' || isNaN(linkData.expiresIn)) {
      errors.push('Expiry time must be a number');
    } else if (!Number.isInteger(linkData.expiresIn)) {
      errors.push('Expiry time must be an integer');
    } else if (linkData.expiresIn < 3600) {
      errors.push('Expiry time must be at least 1 hour (3600 seconds)');
    } else if (linkData.expiresIn > 7776000) {
      errors.push('Expiry time cannot exceed 90 days (7776000 seconds)');
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Invalid payment link data',
      details: errors
    });
  }
  
  next();
}

/**
 * Validate token request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function validateTokenRequest(req, res, next) {
  const tokenData = req.body;
  const errors = [];
  
  // Validate required fields
  if (!tokenData) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Token data is required',
      details: ['Request body is empty']
    });
  }
  
  // Validate token type
  if (!tokenData.type) {
    errors.push('Token type is required');
  } else if (!['card', 'bank_account'].includes(tokenData.type)) {
    errors.push('Token type must be either card or bank_account');
  } else {
    // Validate based on token type
    if (tokenData.type === 'card') {
      const cardValidation = cardSchema.validate(tokenData.card);
      if (!cardValidation.isValid) {
        errors.push(...cardValidation.errors);
      }
    } else if (tokenData.type === 'bank_account') {
      const bankValidation = bankAccountSchema.validate(tokenData.bankAccount);
      if (!bankValidation.isValid) {
        errors.push(...bankValidation.errors);
      }
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Invalid token data',
      details: errors
    });
  }
  
  next();
}