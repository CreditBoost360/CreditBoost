/**
 * Key Management Service for CreditBoost
 * 
 * Handles secure key storage, rotation, and backup
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { encryption } from '../encryption.js';

// Configuration
const KEY_CONFIG = {
  rotationDays: 90, // Rotate keys every 90 days
  backupCount: 5,   // Keep 5 backup keys
  keyLength: 32,    // 32 bytes (256 bits)
  backupDir: process.env.KEY_BACKUP_DIR || './secure/keys',
  masterKeyId: process.env.MASTER_KEY_ID || 'master-encryption-key'
};

class KeyManagementService {
  constructor() {
    this.keys = new Map();
    this.keyMetadata = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the key management service
   */
  async initialize() {
    try {
      // Ensure backup directory exists
      await this.ensureBackupDirExists();
      
      // Load existing keys if available
      await this.loadKeys();
      
      // Schedule key rotation
      this.scheduleKeyRotation();
      
      this.initialized = true;
      console.log('Key Management Service initialized');
    } catch (error) {
      console.error('Failed to initialize Key Management Service:', error);
      throw error;
    }
  }

  /**
   * Ensure the backup directory exists
   */
  async ensureBackupDirExists() {
    try {
      await fs.mkdir(KEY_CONFIG.backupDir, { recursive: true, mode: 0o700 });
    } catch (error) {
      console.error('Failed to create key backup directory:', error);
      throw error;
    }
  }

  /**
   * Load existing keys from secure storage
   */
  async loadKeys() {
    try {
      // In a production environment, this would load keys from a secure service
      // like AWS KMS, HashiCorp Vault, or a Hardware Security Module (HSM)
      
      // For this implementation, we'll check if we have key metadata files
      const metadataPath = path.join(KEY_CONFIG.backupDir, 'key-metadata.json');
      
      try {
        const data = await fs.readFile(metadataPath, 'utf8');
        const metadata = JSON.parse(data);
        
        this.keyMetadata = new Map(Object.entries(metadata));
        
        // Check if current master key needs rotation
        const masterMeta = this.keyMetadata.get(KEY_CONFIG.masterKeyId);
        if (masterMeta) {
          const daysSinceRotation = (Date.now() - masterMeta.lastRotated) / (1000 * 60 * 60 * 24);
          if (daysSinceRotation > KEY_CONFIG.rotationDays) {
            console.log('Master key rotation needed - key age:', Math.floor(daysSinceRotation), 'days');
            // Schedule immediate rotation
            setTimeout(() => this.rotateKey(KEY_CONFIG.masterKeyId), 5000);
          }
        }
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.error('Error loading key metadata:', error);
        }
        // Initialize with empty metadata if file doesn't exist
        this.keyMetadata.set(KEY_CONFIG.masterKeyId, {
          created: Date.now(),
          lastRotated: Date.now(),
          version: 1
        });
      }
    } catch (error) {
      console.error('Failed to load keys:', error);
      throw error;
    }
  }

  /**
   * Generate a new secure key
   */
  generateKey() {
    return crypto.randomBytes(KEY_CONFIG.keyLength).toString('hex');
  }

  /**
   * Rotate a key
   * @param {string} keyId - ID of the key to rotate
   */
  async rotateKey(keyId) {
    try {
      // Generate new key
      const newKey = this.generateKey();
      
      // Backup current key before rotation
      await this.backupKey(keyId);
      
      // Update key metadata
      const metadata = this.keyMetadata.get(keyId) || {
        created: Date.now(),
        version: 0
      };
      
      metadata.lastRotated = Date.now();
      metadata.version += 1;
      this.keyMetadata.set(keyId, metadata);
      
      // Save updated metadata
      await this.saveKeyMetadata();
      
      // If this is the master encryption key, update the encryption service
      if (keyId === KEY_CONFIG.masterKeyId) {
        encryption.rotateKey(newKey);
        
        // Update environment variable (in a real system, this would be done differently)
        process.env.ENCRYPTION_KEY = newKey;
      }
      
      console.log(`Key ${keyId} rotated successfully (version ${metadata.version})`);
      return true;
    } catch (error) {
      console.error(`Failed to rotate key ${keyId}:`, error);
      throw error;
    }
  }

  /**
   * Backup a key before rotation
   * @param {string} keyId - ID of the key to backup
   */
  async backupKey(keyId) {
    try {
      // In a production environment, this would securely store the key
      // For this implementation, we'll just update the metadata
      const metadata = this.keyMetadata.get(keyId);
      if (metadata) {
        const backupId = `${keyId}-v${metadata.version}`;
        const backupMeta = {
          originalKeyId: keyId,
          version: metadata.version,
          rotated: metadata.lastRotated,
          backedUp: Date.now()
        };
        
        this.keyMetadata.set(backupId, backupMeta);
      }
    } catch (error) {
      console.error(`Failed to backup key ${keyId}:`, error);
      throw error;
    }
  }

  /**
   * Save key metadata to secure storage
   */
  async saveKeyMetadata() {
    try {
      const metadataObj = Object.fromEntries(this.keyMetadata);
      const metadataPath = path.join(KEY_CONFIG.backupDir, 'key-metadata.json');
      
      await fs.writeFile(metadataPath, JSON.stringify(metadataObj, null, 2), {
        encoding: 'utf8',
        mode: 0o600 // Restrictive permissions
      });
    } catch (error) {
      console.error('Failed to save key metadata:', error);
      throw error;
    }
  }

  /**
   * Schedule automatic key rotation
   */
  scheduleKeyRotation() {
    // Check daily if keys need rotation
    setInterval(async () => {
      try {
        const masterMeta = this.keyMetadata.get(KEY_CONFIG.masterKeyId);
        if (masterMeta) {
          const daysSinceRotation = (Date.now() - masterMeta.lastRotated) / (1000 * 60 * 60 * 24);
          if (daysSinceRotation > KEY_CONFIG.rotationDays) {
            console.log('Performing scheduled key rotation');
            await this.rotateKey(KEY_CONFIG.masterKeyId);
          }
        }
      } catch (error) {
        console.error('Scheduled key rotation failed:', error);
      }
    }, 24 * 60 * 60 * 1000); // Check once per day
  }
}

// Export singleton instance
export const keyManagementService = new KeyManagementService();

// Initialize on import
keyManagementService.initialize().catch(error => {
  console.error('Failed to initialize key management service:', error);
});

export default KeyManagementService;