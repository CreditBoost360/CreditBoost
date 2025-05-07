#!/usr/bin/env node

/**
 * Security Key Generator for CreditBoost
 * 
 * Generates secure random keys for use in environment variables
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  outputFile: path.join(process.cwd(), '.env.keys'),
  keyLength: 32, // 32 bytes = 256 bits
  keys: [
    { name: 'COOKIE_SECRET', bytes: 32 },
    { name: 'SESSION_SECRET', bytes: 32 },
    { name: 'JWT_SECRET', bytes: 64 },
    { name: 'ENCRYPTION_KEY', bytes: 32, format: 'hex' }
  ]
};

/**
 * Generate a secure random string
 * 
 * @param {number} bytes - Number of random bytes
 * @param {string} format - Output format ('base64', 'hex', or 'utf8')
 * @returns {string} Random string
 */
function generateSecureString(bytes, format = 'base64') {
  const buffer = crypto.randomBytes(bytes);
  return buffer.toString(format);
}

/**
 * Generate all security keys
 * 
 * @returns {Object} Generated keys
 */
function generateKeys() {
  const keys = {};
  
  CONFIG.keys.forEach(key => {
    keys[key.name] = generateSecureString(key.bytes, key.format || 'base64');
  });
  
  return keys;
}

/**
 * Format keys as environment variables
 * 
 * @param {Object} keys - Generated keys
 * @returns {string} Formatted environment variables
 */
function formatEnvVariables(keys) {
  return Object.entries(keys)
    .map(([name, value]) => `${name}=${value}`)
    .join('\n');
}

/**
 * Save keys to file
 * 
 * @param {string} content - Content to save
 * @param {string} filePath - Output file path
 */
function saveToFile(content, filePath) {
  fs.writeFileSync(filePath, content, {
    encoding: 'utf8',
    mode: 0o600 // Restrictive permissions
  });
}

/**
 * Main function
 */
function main() {
  try {
    console.log('Generating security keys...');
    
    // Generate keys
    const keys = generateKeys();
    
    // Format as environment variables
    const envContent = formatEnvVariables(keys);
    
    // Save to file
    saveToFile(envContent, CONFIG.outputFile);
    
    console.log(`Security keys generated and saved to ${CONFIG.outputFile}`);
    console.log('IMPORTANT: Add these keys to your .env file and keep them secure!');
    
    // Display keys
    console.log('\nGenerated Keys:');
    Object.entries(keys).forEach(([name, value]) => {
      console.log(`${name}=${value}`);
    });
  } catch (error) {
    console.error('Failed to generate security keys:', error);
    process.exit(1);
  }
}

// Run the script
main();