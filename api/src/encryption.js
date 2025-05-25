import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { config } from './config.js';

// Configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  saltLength: 64,
  tagLength: 16,
  iterations: 100000,
  digest: 'sha512',
  encoding: 'base64'
};

class Encryption {
  constructor() {
    if (!config.encryption.key) {
      console.error('CRITICAL SECURITY ERROR: ENCRYPTION_KEY environment variable is not set!');
      throw new Error('ENCRYPTION_KEY must be set in environment variables');
    }
    
    // Validate encryption key length
    const keyBuffer = Buffer.from(config.encryption.key, 'hex');
    if (keyBuffer.length < 32) {
      console.error('CRITICAL SECURITY ERROR: ENCRYPTION_KEY is too short!');
      throw new Error('ENCRYPTION_KEY must be at least 64 hex characters (32 bytes)');
    }
    
    this.masterKey = config.encryption.key;
    
    // Initialize key rotation
    this.lastKeyRotation = Date.now();
    this.previousKeys = new Set();
    
    // Schedule key validation - DISABLED FOR NOW TO PREVENT ERRORS
    // setInterval(() => this.validateKeyIntegrity(), 3600000); // Check every hour
  }

  // Generate a secure key from password
  async deriveKey(password, salt) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        salt,
        ENCRYPTION_CONFIG.iterations,
        ENCRYPTION_CONFIG.keyLength,
        ENCRYPTION_CONFIG.digest,
        (err, key) => {
          if (err) reject(err);
          else resolve(key);
        }
      );
    });
  }

  // Encrypt sensitive data
  async encrypt(data) {
    try {
      // Generate initialization vector and salt
      const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength);
      const salt = crypto.randomBytes(ENCRYPTION_CONFIG.saltLength);

      // Derive encryption key
      const key = await this.deriveKey(this.masterKey, salt);

      // Create cipher
      const cipher = crypto.createCipheriv(
        ENCRYPTION_CONFIG.algorithm,
        key,
        iv,
        { authTagLength: ENCRYPTION_CONFIG.tagLength }
      );

      // Encrypt data
      let encryptedData = cipher.update(JSON.stringify(data), 'utf8', ENCRYPTION_CONFIG.encoding);
      encryptedData += cipher.final(ENCRYPTION_CONFIG.encoding);

      // Get authentication tag
      const authTag = cipher.getAuthTag();

      // Combine all components
      return {
        encryptedData,
        iv: iv.toString(ENCRYPTION_CONFIG.encoding),
        salt: salt.toString(ENCRYPTION_CONFIG.encoding),
        authTag: authTag.toString(ENCRYPTION_CONFIG.encoding)
      };
    } catch (error) {
      throw new Error('Encryption failed: ' + error.message);
    }
  }

  // Decrypt sensitive data
  async decrypt(encryptedPackage) {
    try {
      // Check if encryptedPackage is defined
      if (!encryptedPackage) {
        throw new Error('Encrypted package is undefined');
      }
      
      const { encryptedData, iv, salt, authTag } = encryptedPackage;

      // Convert components back to buffers
      const ivBuffer = Buffer.from(iv, ENCRYPTION_CONFIG.encoding);
      const saltBuffer = Buffer.from(salt, ENCRYPTION_CONFIG.encoding);
      const authTagBuffer = Buffer.from(authTag, ENCRYPTION_CONFIG.encoding);

      // Derive key
      const key = await this.deriveKey(this.masterKey, saltBuffer);

      // Create decipher
      const decipher = crypto.createDecipheriv(
        ENCRYPTION_CONFIG.algorithm,
        key,
        ivBuffer,
        { authTagLength: ENCRYPTION_CONFIG.tagLength }
      );

      // Set auth tag
      decipher.setAuthTag(authTagBuffer);

      // Decrypt data
      let decryptedData = decipher.update(encryptedData, ENCRYPTION_CONFIG.encoding, 'utf8');
      decryptedData += decipher.final('utf8');

      return JSON.parse(decryptedData);
    } catch (error) {
      throw new Error('Decryption failed: ' + error.message);
    }
  }

  // Hash password
  async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(12);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new Error('Password hashing failed: ' + error.message);
    }
  }

  // Verify password
  async verifyPassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error('Password verification failed: ' + error.message);
    }
  }

  // Generate secure random token
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Hash sensitive data (one-way)
  hashData(data) {
    return crypto
      .createHash(ENCRYPTION_CONFIG.digest)
      .update(data)
      .digest(ENCRYPTION_CONFIG.encoding);
  }

  // Generate HMAC for data integrity
  generateHMAC(data) {
    return crypto
      .createHmac(ENCRYPTION_CONFIG.digest, this.masterKey)
      .update(data)
      .digest(ENCRYPTION_CONFIG.encoding);
  }

  // Verify HMAC
  verifyHMAC(data, hmac) {
    const calculatedHMAC = this.generateHMAC(data);
    try {
      return crypto.timingSafeEqual(
        Buffer.from(calculatedHMAC),
        Buffer.from(hmac)
      );
    } catch (error) {
      console.error('HMAC verification error:', error.message);
      return false;
    }
  }
  
  // Validate key integrity - FIXED to handle errors properly
  validateKeyIntegrity() {
    try {
      // Create a test value
      const testValue = 'key-validation-' + Date.now();
      
      // Encrypt and immediately decrypt
      const encrypted = this.encrypt(testValue);
      
      // Make sure encrypted is defined before trying to decrypt
      if (!encrypted) {
        console.error('CRITICAL: Encryption failed during key validation');
        return false;
      }
      
      const decrypted = this.decrypt(encrypted);
      
      // Verify the result
      if (decrypted !== testValue) {
        console.error('CRITICAL: Encryption key integrity check failed!');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('CRITICAL: Encryption key validation error:', error.message);
      return false;
    }
  }
  
  // Rotate encryption key (to be called by key management service)
  rotateKey(newKey) {
    if (!newKey || Buffer.from(newKey, 'hex').length < 32) {
      throw new Error('New encryption key must be at least 64 hex characters (32 bytes)');
    }
    
    // Store the current key before replacing it
    this.previousKeys.add(this.masterKey);
    
    // Set the new key
    this.masterKey = newKey;
    this.lastKeyRotation = Date.now();
    
    // Validate the new key
    this.validateKeyIntegrity();
    
    return true;
  }

  // Secure random string with custom alphabet
  generateSecureString(length = 32, charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
    const randomValues = crypto.randomBytes(length);
    const result = new Array(length);
    const charsetLength = charset.length;

    for (let i = 0; i < length; i++) {
      result[i] = charset[randomValues[i] % charsetLength];
    }

    return result.join('');
  }

  // Encrypt credit card number (special handling)
  async encryptCreditCard(cardNumber) {
    // Keep last 4 digits in clear text
    const last4 = cardNumber.slice(-4);
    const numberToEncrypt = cardNumber.slice(0, -4);
    
    const encrypted = await this.encrypt(numberToEncrypt);
    return {
      ...encrypted,
      last4
    };
  }

  // Decrypt credit card number
  async decryptCreditCard(encryptedCard) {
    const { last4, ...encryptedPackage } = encryptedCard;
    const decryptedPrefix = await this.decrypt(encryptedPackage);
    return decryptedPrefix + last4;
  }
}

// Export singleton instance
export const encryption = new Encryption();

// Export type for TypeScript support
export default Encryption;

// Middleware to encrypt sensitive response data
export const encryptResponseData = (fields) => {
    return (req, res, next) => {
        const originalJson = res.json;
        res.json = async function(data) {
            if (data && typeof data === 'object') {
                for (const field of fields) {
                    if (data[field]) {
                        data[field] = await encryption.encrypt(data[field].toString());
                    }
                }
            }
            return originalJson.call(this, data);
        };
        next();
    };
};

// Middleware to decrypt sensitive request data
export const decryptRequestData = (fields) => {
    return async (req, res, next) => {
        try {
            for (const field of fields) {
                if (req.body && req.body[field]) {
                    req.body[field] = await encryption.decrypt(req.body[field]);
                }
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};