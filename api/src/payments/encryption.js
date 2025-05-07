/**
 * Sunny Payment Gateway - Encryption Module
 * 
 * Handles encryption and decryption of sensitive payment data
 */

import crypto from 'crypto';

// Encryption algorithm and key settings
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Derive encryption key from master key and salt
 * 
 * @param {string} masterKey - Master encryption key
 * @param {Buffer} salt - Salt for key derivation
 * @returns {Buffer} Derived key
 */
function deriveKey(masterKey, salt) {
  // Use PBKDF2 for key derivation
  return crypto.pbkdf2Sync(
    masterKey,
    salt,
    100000, // Iterations
    KEY_LENGTH,
    'sha256'
  );
}

/**
 * Encrypt sensitive data
 * 
 * @param {Object|string} data - Data to encrypt
 * @param {string} [masterKey] - Optional master key (defaults to env variable)
 * @returns {string} Encrypted data as base64 string
 */
export function encryptData(data, masterKey = process.env.SUNNY_ENCRYPTION_KEY) {
  if (!masterKey) {
    throw new Error('Encryption key is required');
  }

  try {
    // Convert data to string if it's an object
    const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
    
    // Generate random salt and IV
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Derive encryption key
    const key = deriveKey(masterKey, salt);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt data
    let encrypted = cipher.update(dataString, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    // Combine all components for storage
    // Format: salt:iv:authTag:encryptedData
    const result = Buffer.concat([
      salt,
      iv,
      authTag,
      Buffer.from(encrypted, 'base64')
    ]).toString('base64');
    
    return result;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt encrypted data
 * 
 * @param {string} encryptedData - Encrypted data as base64 string
 * @param {string} [masterKey] - Optional master key (defaults to env variable)
 * @param {boolean} [parseJson=true] - Whether to parse result as JSON
 * @returns {Object|string} Decrypted data
 */
export function decryptData(encryptedData, masterKey = process.env.SUNNY_ENCRYPTION_KEY, parseJson = true) {
  if (!masterKey) {
    throw new Error('Encryption key is required');
  }

  try {
    // Convert base64 string to buffer
    const buffer = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const salt = buffer.slice(0, 16);
    const iv = buffer.slice(16, 16 + IV_LENGTH);
    const authTag = buffer.slice(16 + IV_LENGTH, 16 + IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = buffer.slice(16 + IV_LENGTH + AUTH_TAG_LENGTH).toString('base64');
    
    // Derive key
    const key = deriveKey(masterKey, salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt data
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    // Parse JSON if requested
    return parseJson ? JSON.parse(decrypted) : decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash sensitive data (one-way)
 * 
 * @param {string} data - Data to hash
 * @param {string} [salt] - Optional salt (generates random if not provided)
 * @returns {Object} Hash result with hash and salt
 */
export function hashData(data, salt = null) {
  // Generate salt if not provided
  const useSalt = salt || crypto.randomBytes(16).toString('hex');
  
  // Create hash
  const hash = crypto.pbkdf2Sync(
    data,
    useSalt,
    100000,
    64,
    'sha512'
  ).toString('hex');
  
  return {
    hash,
    salt: useSalt
  };
}

/**
 * Verify hashed data
 * 
 * @param {string} data - Data to verify
 * @param {string} hash - Stored hash
 * @param {string} salt - Salt used for hashing
 * @returns {boolean} True if data matches hash
 */
export function verifyHash(data, hash, salt) {
  const { hash: newHash } = hashData(data, salt);
  return newHash === hash;
}

/**
 * Generate a secure random token
 * 
 * @param {number} [length=32] - Token length in bytes
 * @returns {string} Random token as hex string
 */
export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Mask sensitive data for logging
 * 
 * @param {string} data - Data to mask
 * @param {Object} options - Masking options
 * @returns {string} Masked data
 */
export function maskSensitiveData(data, options = {}) {
  const { showFirst = 4, showLast = 4, maskChar = '*' } = options;
  
  if (!data || data.length <= showFirst + showLast) {
    return data;
  }
  
  const firstPart = data.substring(0, showFirst);
  const lastPart = data.substring(data.length - showLast);
  const maskLength = data.length - showFirst - showLast;
  const mask = maskChar.repeat(maskLength);
  
  return `${firstPart}${mask}${lastPart}`;
}

/**
 * Encrypt a payment card number
 * 
 * @param {string} cardNumber - Card number to encrypt
 * @returns {Object} Encrypted card data with masked display version
 */
export function encryptCardNumber(cardNumber) {
  const encrypted = encryptData(cardNumber);
  const masked = maskSensitiveData(cardNumber, { showFirst: 4, showLast: 4 });
  
  return {
    encrypted,
    masked
  };
}

/**
 * Generate a secure HMAC signature
 * 
 * @param {Object|string} data - Data to sign
 * @param {string} secret - Secret key for signing
 * @returns {string} HMAC signature
 */
export function generateSignature(data, secret) {
  const payload = typeof data === 'object' ? JSON.stringify(data) : String(data);
  
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Verify a HMAC signature
 * 
 * @param {Object|string} data - Data that was signed
 * @param {string} signature - Signature to verify
 * @param {string} secret - Secret key used for signing
 * @returns {boolean} True if signature is valid
 */
export function verifySignature(data, signature, secret) {
  const expectedSignature = generateSignature(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}