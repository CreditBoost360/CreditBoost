import { body, param, query, validationResult } from 'express-validator';
import { ValidationError } from './errorHandler.js';
import sanitizeHtml from 'sanitize-html';
import validator from 'validator';
import { sanitize } from 'dompurify';

// Regular expressions for validation
const PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
  PHONE: /^\+?[\d\s-()]{8,}$/,
  NAME: /^[a-zA-Z\s-']{2,50}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  JWT: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
  CREDIT_CARD: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
  AMOUNT: /^\d+(\.\d{1,2})?$/
};

// Validation rules with descriptive error messages
const VALIDATION_RULES = {
  email: {
    pattern: PATTERNS.EMAIL,
    message: 'Please enter a valid email address'
  },
  password: {
    pattern: PATTERNS.PASSWORD,
    message: 'Password must be at least 8 characters long and contain at least one letter, one number, and one special character'
  },
  phone: {
    pattern: PATTERNS.PHONE,
    message: 'Please enter a valid phone number'
  },
  name: {
    pattern: PATTERNS.NAME,
    message: 'Name must be between 2 and 50 characters and contain only letters, spaces, hyphens, and apostrophes'
  },
  uuid: {
    pattern: PATTERNS.UUID,
    message: 'Invalid UUID format'
  },
  jwt: {
    pattern: PATTERNS.JWT,
    message: 'Invalid JWT format'
  },
  creditCard: {
    pattern: PATTERNS.CREDIT_CARD,
    message: 'Invalid credit card number'
  },
  amount: {
    pattern: PATTERNS.AMOUNT,
    message: 'Amount must be a valid number with up to 2 decimal places'
  }
};

// Input sanitization functions
const sanitizeFunctions = {
  trim: (value) => (typeof value === 'string' ? value.trim() : value),
  toLowerCase: (value) => (typeof value === 'string' ? value.toLowerCase() : value),
  toUpperCase: (value) => (typeof value === 'string' ? value.toUpperCase() : value),
  removeSpaces: (value) => (typeof value === 'string' ? value.replace(/\s/g, '') : value),
  normalizeEmail: (value) => {
    if (typeof value !== 'string') return value;
    const [local, domain] = value.toLowerCase().trim().split('@');
    return `${local.replace(/\./g, '')}@${domain}`;
  }
};

// Validation utilities
export const validation = {
  // Validate a single field
  validateField: (field, value, rules = {}) => {
    if (rules.required && (value === undefined || value === null || value === '')) {
      throw new ValidationError(`${field} is required`);
    }

    if (value !== undefined && value !== null) {
      // Apply type validation
      if (rules.type && typeof value !== rules.type) {
        throw new ValidationError(`${field} must be a ${rules.type}`);
      }

      // Apply pattern validation
      if (rules.pattern && typeof value === 'string') {
        const pattern = typeof rules.pattern === 'string' ? 
          VALIDATION_RULES[rules.pattern]?.pattern : 
          rules.pattern;

        if (pattern && !pattern.test(value)) {
          throw new ValidationError(
            rules.message || 
            VALIDATION_RULES[rules.pattern]?.message || 
            `${field} format is invalid`
          );
        }
      }

      // Apply length validation
      if (rules.minLength !== undefined && String(value).length < rules.minLength) {
        throw new ValidationError(`${field} must be at least ${rules.minLength} characters`);
      }
      if (rules.maxLength !== undefined && String(value).length > rules.maxLength) {
        throw new ValidationError(`${field} must be at most ${rules.maxLength} characters`);
      }

      // Apply numeric range validation
      if (rules.min !== undefined && Number(value) < rules.min) {
        throw new ValidationError(`${field} must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && Number(value) > rules.max) {
        throw new ValidationError(`${field} must be at most ${rules.max}`);
      }

      // Apply custom validation
      if (rules.validate) {
        const result = rules.validate(value);
        if (result !== true) {
          throw new ValidationError(result || `${field} validation failed`);
        }
      }
    }

    return true;
  },

  // Validate multiple fields
  validateFields: (data, validationSchema) => {
    const errors = [];
    const validatedData = {};

    for (const [field, rules] of Object.entries(validationSchema)) {
      try {
        let value = data[field];

        // Apply sanitization if specified
        if (rules.sanitize) {
          const sanitizers = Array.isArray(rules.sanitize) ? rules.sanitize : [rules.sanitize];
          for (const sanitizer of sanitizers) {
            value = sanitizeFunctions[sanitizer]?.(value) ?? value;
          }
        }

        validation.validateField(field, value, rules);
        validatedData[field] = value;
      } catch (error) {
        errors.push({ field, message: error.message });
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    return validatedData;
  },

  // Create validation middleware
  createValidator: (validationSchema) => {
    return (req, res, next) => {
      try {
        req.validatedData = validation.validateFields(req.body, validationSchema);
        next();
      } catch (error) {
        next(error);
      }
    };
  },

  // Predefined validation schemas
  schemas: {
    registration: {
      firstName: {
        required: true,
        pattern: 'name',
        sanitize: ['trim']
      },
      lastName: {
        required: true,
        pattern: 'name',
        sanitize: ['trim']
      },
      email: {
        required: true,
        pattern: 'email',
        sanitize: ['normalizeEmail']
      },
      password: {
        required: true,
        pattern: 'password'
      },
      phone: {
        pattern: 'phone',
        sanitize: ['removeSpaces']
      }
    },

    login: {
      email: {
        required: true,
        pattern: 'email',
        sanitize: ['normalizeEmail']
      },
      password: {
        required: true,
        minLength: 8
      }
    },

    creditCardUpload: {
      cardNumber: {
        required: true,
        pattern: 'creditCard',
        sanitize: ['removeSpaces']
      },
      expiryMonth: {
        required: true,
        type: 'number',
        min: 1,
        max: 12
      },
      expiryYear: {
        required: true,
        type: 'number',
        min: new Date().getFullYear(),
        max: new Date().getFullYear() + 10
      },
      cvv: {
        required: true,
        pattern: /^[0-9]{3,4}$/,
        message: 'CVV must be 3 or 4 digits'
      }
    },

    profileUpdate: {
      firstName: {
        pattern: 'name',
        sanitize: ['trim']
      },
      lastName: {
        pattern: 'name',
        sanitize: ['trim']
      },
      email: {
        pattern: 'email',
        sanitize: ['normalizeEmail']
      },
      phone: {
        pattern: 'phone',
        sanitize: ['removeSpaces']
      }
    },

    // Add more schemas as needed
  }
};

// Sanitization middleware
export const sanitize = {
    xss: (value) => {
        if (typeof value !== 'string') return value;
        return value
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    },

    mongoId: (value) => {
        if (!value || !PATTERNS.UUID.test(value)) {
            throw new Error('Invalid ID format');
        }
        return value;
    }
};

// Validation middleware
export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

// Data sanitization middleware
export const sanitizeData = (data) => {
    if (typeof data !== 'object' || data === null) {
        return sanitize.xss(data);
    }

    const sanitized = Array.isArray(data) ? [] : {};
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeData(value);
        } else {
            sanitized[key] = sanitize.xss(value);
        }
    }
    return sanitized;
};

// Request sanitization middleware
export const sanitizeRequest = (req, res, next) => {
    req.body = sanitizeData(req.body);
    req.query = sanitizeData(req.query);
    req.params = sanitizeData(req.params);
    next();
};

// Sanitization options
const sanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {},
  stripIgnoreTag: true
};

// Common validation chains
const stringValidation = (field) => 
  body(field)
    .trim()
    .escape()
    .notEmpty().withMessage(`${field} cannot be empty`)
    .isString().withMessage(`${field} must be a string`)
    .customSanitizer(value => sanitizeHtml(value, sanitizeOptions));

const emailValidation = () =>
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail();

const passwordValidation = () =>
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character');

// Validation schemas
export const validationSchemas = {
  register: [
    emailValidation(),
    passwordValidation(),
    body('firstName')
      .trim()
      .escape()
      .notEmpty().withMessage('First name is required')
      .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s-']+$/).withMessage('First name can only contain letters, spaces, hyphens and apostrophes')
      .customSanitizer(value => sanitizeHtml(value, sanitizeOptions)),
    body('lastName')
      .trim()
      .escape()
      .notEmpty().withMessage('Last name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s-']+$/).withMessage('Last name can only contain letters, spaces, hyphens and apostrophes')
      .customSanitizer(value => sanitizeHtml(value, sanitizeOptions))
  ],

  login: [
    emailValidation(),
    body('password')
      .trim()
      .notEmpty().withMessage('Password is required')
  ],

  updateProfile: [
    body('firstName').optional().custom(value => {
      if (value && !validator.isLength(value, { min: 2, max: 50 })) {
        throw new Error('First name must be between 2 and 50 characters');
      }
      if (value && !validator.matches(value, /^[a-zA-Z\s-']+$/)) {
        throw new Error('First name can only contain letters, spaces, hyphens and apostrophes');
      }
      return true;
    }),
    body('lastName').optional().custom(value => {
      if (value && !validator.isLength(value, { min: 2, max: 50 })) {
        throw new Error('Last name must be between 2 and 50 characters');
      }
      if (value && !validator.matches(value, /^[a-zA-Z\s-']+$/)) {
        throw new Error('Last name can only contain letters, spaces, hyphens and apostrophes');
      }
      return true;
    }),
    body('phoneNumber').optional()
      .matches(/^\+?[\d\s-()]+$/).withMessage('Invalid phone number format')
      .isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10 and 15 digits')
  ],

  resetPassword: [
    emailValidation()
  ],

  changePassword: [
    body('currentPassword')
      .trim()
      .notEmpty().withMessage('Current password is required'),
    passwordValidation(),
    body('confirmPassword')
      .trim()
      .notEmpty().withMessage('Password confirmation is required')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      })
  ]
};

// Validation middleware
export const validateSchemas = (schemas) => {
  return async (req, res, next) => {
    await Promise.all(schemas.map(schema => schema.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }

    next();
  };
};

// Security validation middleware
export const validateSecurityHeaders = (req, res, next) => {
  const contentType = req.headers['content-type'];
  const contentLength = req.headers['content-length'];

  if (req.method !== 'GET' && (!contentType || !contentType.includes('application/json'))) {
    return res.status(415).json({
      success: false,
      error: 'Unsupported Media Type. Content-Type must be application/json'
    });
  }

  if (contentLength && parseInt(contentLength) > 10485760) { // 10MB
    return res.status(413).json({
      success: false,
      error: 'Payload Too Large. Maximum size is 10MB'
    });
  }

  next();
};

// Export validation middleware
export const validationMiddleware = {
  register: validate(validationSchemas.register),
  login: validate(validationSchemas.login),
  updateProfile: validate(validationSchemas.updateProfile),
  resetPassword: validate(validationSchemas.resetPassword),
  changePassword: validate(validationSchemas.changePassword),
  validateSecurityHeaders
};

// Enhanced validation function that handles both schema and validation arrays
export const validateRequestMiddleware = (validations) => {
  return async (req, res, next) => {
    // Handle both array of validations and schema objects
    const validationArray = Array.isArray(validations) 
      ? validations 
      : (validations.map ? validations.map(schema => schema.run(req)) : []);

    try {
      await Promise.all(validationArray);

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      return res.status(400).json({
        status: 'error',
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Validation processing failed'
      });
    }
  };
};

// Common validation rules
export const commonValidations = {
  email: () => 
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email address'),

  password: () =>
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
      .withMessage('Password must be at least 8 characters long and contain letters, numbers, and special characters'),

  name: (fieldName = 'name') =>
    body(fieldName)
      .trim()
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-zA-Z\s-']+$/)
      .withMessage('Name must be between 2 and 50 characters and contain only letters, spaces, hyphens, and apostrophes'),

  phoneNumber: () =>
    body('phoneNumber')
      .optional()
      .matches(/^\+?[\d\s-()]+$/)
      .withMessage('Invalid phone number format'),

  sanitizeHtml: (fieldName) =>
    body(fieldName)
      .customSanitizer(value => sanitize(value))
      .trim()
      .escape(),

  mongoId: (paramName = 'id') =>
    param(paramName)
      .isMongoId()
      .withMessage('Invalid ID format'),

  pagination: () => [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],

  dateRange: () => [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date')
      .custom((endDate, { req }) => {
        if (req.query.startDate && new Date(endDate) <= new Date(req.query.startDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      })
  ]
};

// Specific validation chains for different routes
export const authValidation = {
  register: [
    commonValidations.email(),
    commonValidations.password(),
    commonValidations.name('firstName'),
    commonValidations.name('lastName'),
    commonValidations.phoneNumber()
  ],
  
  login: [
    commonValidations.email(),
    body('password').notEmpty().withMessage('Password is required')
  ]
};

export const creditValidation = {
  updateScore: [
    body('score')
      .isInt({ min: 300, max: 850 })
      .withMessage('Credit score must be between 300 and 850'),
    body('source')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Source must be between 2 and 50 characters'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format')
  ]
};

export const profileValidation = {
  update: [
    commonValidations.name('firstName'),
    commonValidations.name('lastName'),
    commonValidations.phoneNumber(),
    body('address')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Address must not exceed 200 characters')
  ]
};