/**
 * Sunny Payment Gateway - Backup Service
 * 
 * Implements automated backup and recovery for transaction data
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { encryptData, decryptData } from '../encryption.js';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to database files
const DB_DIR = path.join(__dirname, '../../db');
const BACKUP_DIR = path.join(__dirname, '../../db/backups');

/**
 * Initialize backup directory if it doesn't exist
 */
async function initializeBackupDir() {
  try {
    // Check if directory exists
    try {
      await fs.access(BACKUP_DIR);
    } catch (error) {
      // Create directory if it doesn't exist
      await fs.mkdir(BACKUP_DIR, { recursive: true });
    }
  } catch (error) {
    console.error('Failed to initialize backup directory:', error);
    throw new Error('Failed to initialize backup directory');
  }
}

/**
 * Create a backup of all database files
 * 
 * @param {boolean} encrypt - Whether to encrypt the backup
 * @returns {Promise<Object>} Backup result
 */
export async function createBackup(encrypt = true) {
  try {
    await initializeBackupDir();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `backup-${timestamp}`;
    const backupPath = path.join(BACKUP_DIR, backupId);
    
    // Create backup directory
    await fs.mkdir(backupPath, { recursive: true });
    
    // Get list of database files
    const files = await fs.readdir(DB_DIR);
    const dbFiles = files.filter(file => 
      file.endsWith('.json') && 
      !file.startsWith('backup-') &&
      file !== 'backups'
    );
    
    // Copy each file to backup directory
    const backupFiles = [];
    for (const file of dbFiles) {
      const sourcePath = path.join(DB_DIR, file);
      const destPath = path.join(backupPath, file);
      
      // Read file content
      const content = await fs.readFile(sourcePath, 'utf8');
      
      // Encrypt content if requested
      let finalContent = content;
      if (encrypt) {
        const encryptionKey = process.env.SUNNY_BACKUP_KEY || process.env.SUNNY_ENCRYPTION_KEY;
        if (!encryptionKey) {
          throw new Error('Encryption key is required for encrypted backups');
        }
        
        finalContent = encryptData(content, encryptionKey);
      }
      
      // Write to backup file
      await fs.writeFile(destPath, finalContent);
      
      // Calculate checksum
      const checksum = crypto
        .createHash('sha256')
        .update(content)
        .digest('hex');
      
      backupFiles.push({
        name: file,
        path: destPath,
        size: Buffer.byteLength(content),
        checksum,
        encrypted: encrypt
      });
    }
    
    // Create backup manifest
    const manifest = {
      id: backupId,
      timestamp: new Date().toISOString(),
      encrypted: encrypt,
      files: backupFiles
    };
    
    // Write manifest
    await fs.writeFile(
      path.join(backupPath, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    console.log(`Backup created: ${backupId}`);
    
    return {
      success: true,
      backupId,
      timestamp: manifest.timestamp,
      fileCount: backupFiles.length,
      encrypted: encrypt
    };
  } catch (error) {
    console.error('Backup creation failed:', error);
    throw new Error(`Backup creation failed: ${error.message}`);
  }
}

/**
 * Restore from a backup
 * 
 * @param {string} backupId - ID of backup to restore
 * @returns {Promise<Object>} Restore result
 */
export async function restoreFromBackup(backupId) {
  try {
    const backupPath = path.join(BACKUP_DIR, backupId);
    
    // Check if backup exists
    try {
      await fs.access(backupPath);
    } catch (error) {
      throw new Error(`Backup ${backupId} not found`);
    }
    
    // Read manifest
    const manifestPath = path.join(backupPath, 'manifest.json');
    const manifestContent = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    // Restore each file
    const restoredFiles = [];
    for (const file of manifest.files) {
      const sourcePath = path.join(backupPath, file.name);
      const destPath = path.join(DB_DIR, file.name);
      
      // Read backup file
      const content = await fs.readFile(sourcePath, 'utf8');
      
      // Decrypt if encrypted
      let finalContent = content;
      if (manifest.encrypted) {
        const encryptionKey = process.env.SUNNY_BACKUP_KEY || process.env.SUNNY_ENCRYPTION_KEY;
        if (!encryptionKey) {
          throw new Error('Encryption key is required for encrypted backups');
        }
        
        finalContent = decryptData(content, encryptionKey, false);
      }
      
      // Write to destination
      await fs.writeFile(destPath, finalContent);
      
      // Calculate checksum to verify integrity
      const checksum = crypto
        .createHash('sha256')
        .update(finalContent)
        .digest('hex');
      
      if (checksum !== file.checksum) {
        throw new Error(`Checksum mismatch for file ${file.name}`);
      }
      
      restoredFiles.push({
        name: file.name,
        path: destPath,
        size: Buffer.byteLength(finalContent),
        checksumVerified: checksum === file.checksum
      });
    }
    
    console.log(`Restore completed from backup: ${backupId}`);
    
    return {
      success: true,
      backupId,
      timestamp: manifest.timestamp,
      fileCount: restoredFiles.length
    };
  } catch (error) {
    console.error('Restore failed:', error);
    throw new Error(`Restore failed: ${error.message}`);
  }
}

/**
 * List available backups
 * 
 * @returns {Promise<Array>} List of backups
 */
export async function listBackups() {
  try {
    await initializeBackupDir();
    
    // Get list of backup directories
    const files = await fs.readdir(BACKUP_DIR);
    const backupDirs = files.filter(file => file.startsWith('backup-'));
    
    // Get details for each backup
    const backups = [];
    for (const dir of backupDirs) {
      const manifestPath = path.join(BACKUP_DIR, dir, 'manifest.json');
      
      try {
        const manifestContent = await fs.readFile(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);
        
        backups.push({
          id: manifest.id,
          timestamp: manifest.timestamp,
          fileCount: manifest.files.length,
          encrypted: manifest.encrypted
        });
      } catch (error) {
        console.warn(`Failed to read manifest for backup ${dir}:`, error);
      }
    }
    
    // Sort by timestamp (newest first)
    backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return backups;
  } catch (error) {
    console.error('Failed to list backups:', error);
    throw new Error('Failed to list backups');
  }
}

/**
 * Delete a backup
 * 
 * @param {string} backupId - ID of backup to delete
 * @returns {Promise<Object>} Delete result
 */
export async function deleteBackup(backupId) {
  try {
    const backupPath = path.join(BACKUP_DIR, backupId);
    
    // Check if backup exists
    try {
      await fs.access(backupPath);
    } catch (error) {
      throw new Error(`Backup ${backupId} not found`);
    }
    
    // Delete backup directory recursively
    await fs.rm(backupPath, { recursive: true });
    
    console.log(`Backup deleted: ${backupId}`);
    
    return {
      success: true,
      backupId
    };
  } catch (error) {
    console.error('Failed to delete backup:', error);
    throw new Error(`Failed to delete backup: ${error.message}`);
  }
}

/**
 * Schedule automated backups
 * 
 * @param {Object} options - Backup options
 * @param {number} options.intervalHours - Backup interval in hours
 * @param {boolean} options.encrypt - Whether to encrypt backups
 * @param {number} options.retentionCount - Number of backups to retain
 */
export function scheduleAutomatedBackups(options = {}) {
  const {
    intervalHours = 24,
    encrypt = true,
    retentionCount = 7
  } = options;
  
  // Convert hours to milliseconds
  const interval = intervalHours * 60 * 60 * 1000;
  
  // Schedule backup job
  setInterval(async () => {
    try {
      console.log('Running scheduled backup...');
      
      // Create backup
      await createBackup(encrypt);
      
      // Clean up old backups if retention count is specified
      if (retentionCount > 0) {
        const backups = await listBackups();
        
        // Delete old backups beyond retention count
        if (backups.length > retentionCount) {
          const backupsToDelete = backups.slice(retentionCount);
          
          for (const backup of backupsToDelete) {
            await deleteBackup(backup.id);
          }
        }
      }
    } catch (error) {
      console.error('Scheduled backup failed:', error);
    }
  }, interval);
  
  console.log(`Automated backups scheduled every ${intervalHours} hours`);
}