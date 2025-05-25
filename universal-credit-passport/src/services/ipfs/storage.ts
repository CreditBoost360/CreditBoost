import { create } from 'ipfs-http-client';
import dotenv from 'dotenv';
import crypto from 'crypto';
import mime from 'mime-types';
import fs from 'fs';
import { promisify } from 'util';
import { pipeline } from 'stream';
import axios from 'axios';

dotenv.config();

// Constants for document handling
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB chunks
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Allowed file types for KYC documents
const ALLOWED_KYC_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
];

// KYC document categories
export enum KycDocumentType {
  PASSPORT = 'passport',
  DRIVERS_LICENSE = 'drivers_license',
  NATIONAL_ID = 'national_id',
  UTILITY_BILL = 'utility_bill',
  BANK_STATEMENT = 'bank_statement',
  TAX_DOCUMENT = 'tax_document',
  OTHER = 'other'
}

// Document metadata interface
export interface DocumentMetadata {
  documentType: string;
  mimeType: string;
  fileName: string;
  fileSize: number;
  encryptionAlgorithm?: string;
  isEncrypted: boolean;
  chunks?: string[];
  createdAt: string;
  userId?: string;
  kycType?: KycDocumentType;
  kycVerified?: boolean;
  checksumHash?: string;
}

// Stream pipeline promisified
const pipelineAsync = promisify(pipeline);

// Updated IPFS client configuration with proper authentication
const projectId = process.env.INFURA_PROJECT_ID || '';
const projectSecret = process.env.INFURA_PROJECT_SECRET || '';
const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-please-change-in-production';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

// Fallback gateway for retrievals if primary fails
const ipfsGateway = process.env.IPFS_GATEWAY || 'https://cloudflare-ipfs.com/ipfs/';

// Create IPFS client with authentication
const ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth
    }
});

/**
 * Encrypts data using AES-256-GCM algorithm
 * @param data The data to encrypt
 * @param key Optional custom encryption key
 * @returns Encrypted data and initialization vector
 */
function encryptData(data: Buffer, key: string = encryptionKey): { encrypted: Buffer, iv: Buffer } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key), iv);
    
    const encrypted = Buffer.concat([
        cipher.update(data),
        cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    // Return encrypted data with IV and auth tag
    return {
        encrypted: Buffer.concat([encrypted, authTag]),
        iv
    };
}

/**
 * Decrypts data using AES-256-GCM algorithm
 * @param encryptedData The encrypted data
 * @param iv Initialization vector used for encryption
 * @param key Optional custom encryption key
 * @returns Decrypted data
 */
function decryptData(encryptedData: Buffer, iv: Buffer, key: string = encryptionKey): Buffer {
    const authTagLength = 16;
    const encryptedContent = encryptedData.slice(0, -authTagLength);
    const authTag = encryptedData.slice(-authTagLength);
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key), iv);
    decipher.setAuthTag(authTag);
    
    return Buffer.concat([
        decipher.update(encryptedContent),
        decipher.final()
    ]);
}

/**
 * Validates file type and size
 * @param file File buffer to validate
 * @param fileName Original file name
 * @param allowedTypes Allowed MIME types
 * @returns Validation result with MIME type
 */
function validateFile(
    file: Buffer, 
    fileName: string, 
    allowedTypes: string[] = ALLOWED_KYC_MIME_TYPES
): { valid: boolean, mimeType: string, reason?: string } {
    // Check file size
    if (file.length > MAX_FILE_SIZE) {
        return {
            valid: false,
            mimeType: '',
            reason: `File exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        };
    }
    
    // Check file type
    const mimeType = mime.lookup(fileName) || '';
    if (!mimeType || !allowedTypes.includes(mimeType)) {
        return {
            valid: false,
            mimeType,
            reason: `File type ${mimeType || 'unknown'} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
        };
    }
    
    return { valid: true, mimeType };
}

/**
 * Creates checksum hash for data integrity verification
 * @param data File data
 * @returns SHA256 hash
 */
function createChecksum(data: Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Uploads a file to IPFS with retry mechanism
 * @param file File buffer
 * @param retries Number of retries remaining
 * @returns IPFS content identifier (CID)
 */
async function uploadFileWithRetry(file: Buffer, retries = MAX_RETRIES): Promise<string> {
    try {
        const result = await ipfs.add(file);
        return result.path;
    } catch (error) {
        console.error(`Error uploading to IPFS (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}):`, error);
        
        if (retries <= 0) {
            throw new Error('Failed to upload to IPFS after maximum retries');
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return uploadFileWithRetry(file, retries - 1);
    }
}

/**
 * Splits a large file into chunks for efficient IPFS storage
 * @param fileBuffer The file data to chunk
 * @returns Array of chunk buffers
 */
function createFileChunks(fileBuffer: Buffer): Buffer[] {
    const chunks: Buffer[] = [];
    const totalChunks = Math.ceil(fileBuffer.length / CHUNK_SIZE);
    
    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, fileBuffer.length);
        chunks.push(fileBuffer.slice(start, end));
    }
    
    return chunks;
}

/**
 * Uploads a document to IPFS with encryption and metadata
 * @param file File buffer
 * @param fileName Original file name
 * @param documentType Type of document
 * @param userId Optional user identifier
 * @param kycType Optional KYC document type
 * @param encrypt Whether to encrypt the document (default: true)
 * @returns Object containing IPFS CID and metadata
 */
export const uploadToIPFS = async (
    file: Buffer, 
    fileName: string,
    documentType: string,
    userId?: string,
    kycType?: KycDocumentType,
    encrypt: boolean = true
): Promise<{ cid: string, metadata: DocumentMetadata }> => {
    try {
        // Validate document
        const validation = validateFile(file, fileName);
        if (!validation.valid) {
            throw new Error(validation.reason);
        }
        
        // Create checksum for original file
        const checksumHash = createChecksum(file);
        
        // Handle large files by chunking
        let finalCid: string;
        let chunks: string[] | undefined = undefined;
        
        if (file.length > CHUNK_SIZE) {
            const fileChunks = createFileChunks(file);
            chunks = [];
            
            // Upload each chunk
            for (const chunk of fileChunks) {
                let chunkData = chunk;
                
                // Encrypt chunk if needed
                if (encrypt) {
                    const { encrypted } = encryptData(chunk);
                    chunkData = encrypted;
                }
                
                const chunkCid = await uploadFileWithRetry(chunkData);
                chunks.push(chunkCid);
            }
            
            // Create metadata file that references all chunks
            const chunkMetadata = {
                chunks,
                checksumHash,
                totalSize: file.length
            };
            
            // Upload chunk metadata
            finalCid = await uploadFileWithRetry(Buffer.from(JSON.stringify(chunkMetadata)));
        } else {
            // For smaller files, encrypt if needed and upload directly
            let dataToUpload = file;
            
            if (encrypt) {
                const { encrypted } = encryptData(file);
                dataToUpload = encrypted;
            }
            
            finalCid = await uploadFileWithRetry(dataToUpload);
        }
        
        // Create document metadata
        const metadata: DocumentMetadata = {
            documentType,
            mimeType: validation.mimeType,
            fileName,
            fileSize: file.length,
            encryptionAlgorithm: encrypt ? 'aes-256-gcm' : undefined,
            isEncrypted: encrypt,
            chunks,
            createdAt: new Date().toISOString(),
            userId,
            kycType,
            checksumHash
        };
        
        return {
            cid: finalCid,
            metadata
        };
    } catch (error) {
        console.error('Error processing and uploading to IPFS:', error);
        throw error instanceof Error ? error : new Error('Unknown error during IPFS upload');
    }
};

/**
 * Uploads a KYC document with special handling and validation
 * @param file File buffer
 * @param fileName Original file name
 * @param kycType KYC document type
 * @param userId User identifier
 * @returns Object containing IPFS CID and metadata
 */
export const uploadKYCDocument = async (
    file: Buffer,
    fileName: string,
    kycType: KycDocumentType,
    userId: string
): Promise<{ cid: string, metadata: DocumentMetadata }> => {
    // Perform additional KYC-specific validations here
    if (file.length < 10 * 1024) { // At least 10KB for KYC docs (prevents empty/invalid docs)
        throw new Error('KYC document is too small to be valid');
    }
    
    // Always encrypt KYC documents for security
    return uploadToIPFS(
        file,
        fileName,
        'kyc_document',
        userId,
        kycType,
        true // Always encrypt KYC documents
    );
};

/**
 * Retrieves a file from IPFS with retry mechanism
 * @param cid IPFS content identifier
 * @param retries Number of retries remaining
 * @returns Retrieved data as Buffer
 */
async function retrieveFileWithRetry(cid: string, retries = MAX_RETRIES): Promise<Buffer> {
    try {
        const stream = ipfs.cat(cid);
        const chunks: Buffer[] = [];
        
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        
        return Buffer.concat(chunks);
    } catch (error) {
        console.error(`Error retrieving from IPFS (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}):`, error);
        
        if (retries <= 0) {
            // Try the public gateway as a fallback
            try {
                console.log('Attempting fallback via public gateway...');
                const response = await axios.get(`${ipfsGateway}${cid}`, {
                    responseType: 'arraybuffer'
                });
                return Buffer.from(response.data);
            } catch (gatewayError) {
                console.error('Gateway fallback also failed:', gatewayError);
                throw new Error('Failed to retrieve from IPFS after maximum retries');
            }
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return retrieveFileWithRetry(cid, retries - 1);
    }
}

/**
 * Retrieves a document from IPFS, handles chunking an
