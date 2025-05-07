/**
 * Sunny Payment Gateway - Encryption Key Rotation
 * 
 * Implements encryption key rotation for enhanced security
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to key storage file (in production, use a secure key management service)
const KEY_STORAGE_PATH = path.join(__dirname, '../../db/encryption_keys.json');

/**
 * Initialize key storage file if it doesn't exist
 */
async function initializeKeyStorage() {
  try {
    // Check if directory exists
    const dbDir = path.join(__dirname, '../../db');
    try {
      await fs.access(dbDir);
    } catch (error) {
      // Create directory if it doesn't exist
      await fs.mkdir(dbDir, { recursive: true });
    }
    
    // Check if file exists
    try {
      await fs.access(KEY_STORAGE_PATH);
    } catch (error) {
      // Create file with initial key if it doesn't exist
      const initialKey = {
        keys: [
          {
            id: 'key-1',
            key: process.env.SUNNY_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'),
            createdAt: new Date().toISOString(),
            active: true
          }
        ],
        currentKeyId: 'key-1',
        lastRotation: new Date().toISOString()
      };
      
      await fs.writeFile(KEY_STORAGE_PATH, JSON.stringify(initialKey, null, 2));
    }
  } catch (error) {
    console.error('Failed to initialize key storage:', error);
    throw new Error('Failed to initialize key storage');
  }
}

/**
 * Read key storage
 * 
 * @returns {Promise<Object>} Key storage data
 */
async function readKeyStorage() {
  try {
    await initializeKeyStorage();
    const data = await fs.readFile(KEY_STORAGE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read key storage:', error);
    throw new Error('Failed to read key storage');
  }
}

/**
 * Write key storage
 * 
 * @param {Object} keyStorage - Key storage data
 * @returns {Promise<void>}
 */
async function writeKeyStorage(keyStorage) {
  try {
    await fs.writeFile(KEY_STORAGE_PATH, JSON.stringify(keyStorage, null, 2));
  } catch (error) {
    console.error('Failed to write key storage:', error);
    throw new Error('Failed to write key storage');
  }
}

/**
 * Get current encryption key
 * 
 * @returns {Promise<Object>} Current encryption key
 */
export async function getCurrentKey() {
  try {
    const keyStorage = await readKeyStorage();
    const currentKeyId = keyStorage.currentKeyId;
    const currentKey = keyStorage.keys.find(key => key.id === currentKeyId);
    
    if (!currentKey) {
      throw new Error('Current encryption key not found');
    }
    
    return currentKey;
  } catch (error) {
    console.error('Failed to get current key:', error);
    throw new Error('Failed to get current key');
  }
}

/**
 * Get encryption key by ID
 * 
 * @param {string} keyId - Key ID
 * @returns {Promise<Object>} Encryption key
 */
export async function getKeyById(keyId) {
  try {
    const keyStorage = await readKeyStorage();
    const key = keyStorage.keys.find(key => key.id === keyId);
    
    if (!key) {
      throw new Error(`Encryption key with ID ${keyId} not found`);
    }
    
    return key;
  } catch (error) {
    console.error('Failed to get key by ID:', error);
    throw new Error('Failed to get key by ID');
  }
}

/**
 * Rotate encryption key
 * 
 * @returns {Promise<Object>} New encryption key
 */
export async function rotateKey() {
  try {
    const keyStorage = await readKeyStorage();
    
    // Generate new key
    const newKeyId = `key-${keyStorage.keys.length + 1}`;
    const newKey = {
      id: newKeyId,
      key: crypto.randomBytes(32).toString('hex'),
      createdAt: new Date().toISOString(),
      active: true
    };
    
    // Deactivate current key
    const currentKeyIndex = keyStorage.keys.findIndex(key => key.id === keyStorage.currentKeyId);
    if (currentKeyIndex !== -1) {
      keyStorage.keys[currentKeyIndex].active = false;
    }
    
    // Add new key
    keyStorage.keys.push(newKey);
    
    // Update current key ID
    keyStorage.currentKeyId = newKeyId;
    keyStorage.lastRotation = new Date().toISOString();
    
    // Write updated key storage
    await writeKeyStorage(keyStorage);
    
    console.log(`Encryption key rotated: ${newKeyId}`);
    
    return newKey;
  } catch (error) {
    console.error('Failed to rotate key:', error);
    throw new Error('Failed to rotate key');
  }
}

/**
 * Check if key rotation is needed
 * 
 * @param {number} rotationInterval - Rotation interval in days
 * @returns {Promise<boolean>} Whether key rotation is needed
 */
export async function isKeyRotationNeeded(rotationInterval = 90) {
  try {
    const keyStorage = await readKeyStorage();
    const lastRotation = new Date(keyStorage.lastRotation);
    const now = new Date();
    
    // Calculate days since last rotation
    const daysSinceLastRotation = Math.floor((now - lastRotation) / (1000 * 60 * 60 * 24));
    
    return daysSinceLastRotation >= rotationInterval;
  } catch (error) {
    console.error('Failed to check if key rotation is needed:', error);
    return false;
  }
}

/**
 * Re-encrypt data with current key
 * 
 * @param {Object} data - Data to re-encrypt
 * @param {string} keyId - Key ID used for encryption
 * @returns {Promise<Object>} Re-encrypted data
 */
export async function reEncryptData(data, keyId) {
  try {
    // This is a placeholder function
    // In a real implementation, this would decrypt data with the old key
    // and re-encrypt it with the new key
    
    console.log(`Re-encrypting data from key ${keyId} to current key`);
    
    return {
      ...data,
      reEncrypted: true,
      keyId: (await getCurrentKey()).id
    };
  } catch (error) {
    console.error('Failed to re-encrypt data:', error);
    throw new Error('Failed to re-encrypt data');
  }
}

/**
 * Schedule key rotation
 * 
 * @param {number} rotationInterval - Rotation interval in days
 */
export function scheduleKeyRotation(rotationInterval = 90) {
  // Check if key rotation is needed every day
  setInterval(async () => {
    try {
      const rotationNeeded = await isKeyRotationNeeded(rotationInterval);
      
      if (rotationNeeded) {
        console.log('Key rotation needed, rotating key...');
        await rotateKey();
      }
    } catch (error) {
      console.error('Scheduled key rotation failed:', error);
    }
  }, 24 * 60 * 60 * 1000); // 24 hours
  
  console.log(`Key rotation scheduled with interval of ${rotationInterval} days`);
}