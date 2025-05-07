/**
 * Sunny Payment Gateway - PCI DSS Compliance
 * 
 * Implements PCI DSS compliance checks and validations
 */

/**
 * PCI DSS compliance levels
 */
export const PCI_COMPLIANCE_LEVELS = {
  LEVEL_1: 'level_1', // >6M transactions per year
  LEVEL_2: 'level_2', // 1M-6M transactions per year
  LEVEL_3: 'level_3', // 20K-1M transactions per year
  LEVEL_4: 'level_4'  // <20K transactions per year
};

/**
 * PCI DSS requirements
 */
export const PCI_REQUIREMENTS = {
  REQ_1: 'Install and maintain a firewall configuration to protect cardholder data',
  REQ_2: 'Do not use vendor-supplied defaults for system passwords and other security parameters',
  REQ_3: 'Protect stored cardholder data',
  REQ_4: 'Encrypt transmission of cardholder data across open, public networks',
  REQ_5: 'Use and regularly update anti-virus software or programs',
  REQ_6: 'Develop and maintain secure systems and applications',
  REQ_7: 'Restrict access to cardholder data by business need to know',
  REQ_8: 'Assign a unique ID to each person with computer access',
  REQ_9: 'Restrict physical access to cardholder data',
  REQ_10: 'Track and monitor all access to network resources and cardholder data',
  REQ_11: 'Regularly test security systems and processes',
  REQ_12: 'Maintain a policy that addresses information security for all personnel'
};

/**
 * Validate credit card number format and checksum (Luhn algorithm)
 * 
 * @param {string} cardNumber - Credit card number to validate
 * @returns {boolean} Whether the card number is valid
 */
export function validateCardNumber(cardNumber) {
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
 * Validate CVV format
 * 
 * @param {string} cvv - CVV to validate
 * @param {string} cardType - Card type (visa, mastercard, amex, etc.)
 * @returns {boolean} Whether the CVV is valid
 */
export function validateCVV(cvv, cardType) {
  if (!cvv) return false;
  
  // Remove spaces
  const sanitized = cvv.replace(/\\s/g, '');
  
  // Check if contains only digits
  if (!/^[0-9]+$/.test(sanitized)) {
    return false;
  }
  
  // Check length based on card type
  if (cardType && cardType.toLowerCase() === 'amex') {
    return sanitized.length === 4;
  }
  
  return sanitized.length === 3;
}

/**
 * Check if card data should be stored
 * 
 * @param {Object} options - Options
 * @param {boolean} options.tokenize - Whether to tokenize the card
 * @param {boolean} options.recurring - Whether this is for recurring payments
 * @returns {boolean} Whether card data should be stored
 */
export function shouldStoreCardData(options = {}) {
  // Only store card data if tokenization is requested or for recurring payments
  return options.tokenize === true || options.recurring === true;
}

/**
 * Validate that card data is not being logged
 * 
 * @param {Object} data - Data to validate
 * @returns {boolean} Whether the data is safe to log
 */
export function validateNoCardDataLogging(data) {
  if (!data || typeof data !== 'object') return true;
  
  // Check for common card data field names
  const sensitiveFields = [
    'cardNumber', 'card_number', 'ccNumber', 'cc_number',
    'cvv', 'cvc', 'cvv2', 'csc',
    'pan', 'primaryAccountNumber',
    'track1', 'track2', 'magneticStripe'
  ];
  
  // Recursive function to check for sensitive fields
  function checkForSensitiveFields(obj, path = '') {
    if (!obj || typeof obj !== 'object') return false;
    
    for (const key of Object.keys(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      // Check if key is a sensitive field
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        console.warn(`PCI violation: Sensitive field "${currentPath}" found in data`);
        return true;
      }
      
      // Check nested objects
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkForSensitiveFields(obj[key], currentPath)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  return !checkForSensitiveFields(data);
}

/**
 * Check if data is PCI compliant
 * 
 * @param {Object} data - Data to check
 * @returns {Object} Compliance check result
 */
export function checkPCICompliance(data) {
  const violations = [];
  
  // Check for unencrypted card data
  if (data.cardNumber && !data.cardNumber.startsWith('enc_')) {
    violations.push('Unencrypted card number found');
  }
  
  if (data.cvv && !data.cvv.startsWith('enc_')) {
    violations.push('Unencrypted CVV found');
  }
  
  // Check for sensitive data in clear text
  if (data.notes && /\\b(?:\d[ -]*?){13,19}\\b/.test(data.notes)) {
    violations.push('Possible card number found in notes field');
  }
  
  return {
    compliant: violations.length === 0,
    violations
  };
}

/**
 * Middleware to ensure PCI compliance
 */
export function pciComplianceMiddleware() {
  return (req, res, next) => {
    // Check request body for sensitive data
    if (req.body) {
      const isSafe = validateNoCardDataLogging(req.body);
      
      if (!isSafe) {
        console.error('PCI compliance violation: Request contains sensitive card data');
        return res.status(400).json({
          success: false,
          error: 'PCI_COMPLIANCE_VIOLATION',
          message: 'Request contains sensitive card data in an unsafe manner'
        });
      }
    }
    
    next();
  };
}

/**
 * Generate PCI compliance report
 * 
 * @returns {Object} PCI compliance report
 */
export function generatePCIComplianceReport() {
  // In a real implementation, this would check various systems and configurations
  // For this example, we'll return a mock report
  
  return {
    timestamp: new Date().toISOString(),
    complianceLevel: PCI_COMPLIANCE_LEVELS.LEVEL_4,
    requirements: {
      REQ_1: { compliant: true, notes: 'Firewall configured correctly' },
      REQ_2: { compliant: true, notes: 'No default passwords in use' },
      REQ_3: { compliant: true, notes: 'Cardholder data encrypted at rest' },
      REQ_4: { compliant: true, notes: 'TLS 1.2+ used for all transmissions' },
      REQ_5: { compliant: true, notes: 'Anti-virus software up to date' },
      REQ_6: { compliant: true, notes: 'Security patches applied' },
      REQ_7: { compliant: true, notes: 'Access control implemented' },
      REQ_8: { compliant: true, notes: 'Unique IDs assigned to all users' },
      REQ_9: { compliant: true, notes: 'Physical access restricted' },
      REQ_10: { compliant: true, notes: 'Audit logging implemented' },
      REQ_11: { compliant: true, notes: 'Vulnerability scanning performed' },
      REQ_12: { compliant: true, notes: 'Security policy in place' }
    },
    overallCompliance: true,
    nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
  };
}