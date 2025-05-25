/**
 * Common setup for integration tests
 * Sets up test environment, mock data, and utilities used across all tests
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { create as createIpfsClient } from 'ipfs-http-client';
import { Connection, createConnection } from 'typeorm';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock data directory
export const MOCK_DATA_DIR = path.join(__dirname, '../mock-data');

// Test wallet accounts
export const TEST_ACCOUNTS = {
  owner: {
    privateKey: process.env.TEST_OWNER_PRIVATE_KEY || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    address: process.env.TEST_OWNER_ADDRESS || '0x1234567890123456789012345678901234567890',
  },
  user: {
    privateKey: process.env.TEST_USER_PRIVATE_KEY || '0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef',
    address: process.env.TEST_USER_ADDRESS || '0x2345678901234567890123456789012345678901',
  },
  institution: {
    privateKey: process.env.TEST_INSTITUTION_PRIVATE_KEY || '0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef',
    address: process.env.TEST_INSTITUTION_ADDRESS || '0x3456789012345678901234567890123456789012',
  },
  creditBureau: {
    privateKey: process.env.TEST_CREDIT_BUREAU_PRIVATE_KEY || '0x4567890123abcdef4567890123abcdef4567890123abcdef4567890123abcdef',
    address: process.env.TEST_CREDIT_BUREAU_ADDRESS || '0x4567890123456789012345678901234567890123',
  },
};

// Network configurations for tests
export const TEST_NETWORKS = {
  // Use local development networks for testing
  ethereum: {
    rpcUrl: process.env.TEST_ETHEREUM_RPC || 'http://localhost:8545',
    chainId: 1337,
    contractAddress: process.env.TEST_ETHEREUM_CONTRACT_ADDRESS,
    ccipRouter: process.env.TEST_ETHEREUM_CCIP_ROUTER,
  },
  polygon: {
    rpcUrl: process.env.TEST_POLYGON_RPC || 'http://localhost:8546',
    chainId: 1338,
    contractAddress: process.env.TEST_POLYGON_CONTRACT_ADDRESS,
    ccipRouter: process.env.TEST_POLYGON_CCIP_ROUTER,
  },
};

// Initialize Web3 instances
export const web3Instances: Record<string, Web3> = {};
Object.keys(TEST_NETWORKS).forEach(network => {
  web3Instances[network] = new Web3(TEST_NETWORKS[network].rpcUrl);
});

// Load contract ABIs
export const getContractAbi = (contractName: string): AbiItem[] => {
  const contractPath = path.join(__dirname, '../../src/blockchain/contracts', `${contractName}.json`);
  const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  return contractJson.abi as AbiItem[];
};

// Contract instances
export const contractInstances: Record<string, any> = {};

// Database connection
let dbConnection: Connection;

// IPFS client for testing
export const ipfsClient = createIpfsClient({
  host: process.env.TEST_IPFS_HOST || 'localhost',
  port: parseInt(process.env.TEST_IPFS_PORT || '5001', 10),
  protocol: process.env.TEST_IPFS_PROTOCOL || 'http',
});

// Mock KYC document data
export const mockKycDocuments = {
  passport: {
    path: path.join(MOCK_DATA_DIR, 'passport.pdf'),
    type: 'passport',
    mimeType: 'application/pdf',
  },
  driverLicense: {
    path: path.join(MOCK_DATA_DIR, 'drivers_license.jpg'),
    type: 'drivers_license',
    mimeType: 'image/jpeg',
  },
  utilityBill: {
    path: path.join(MOCK_DATA_DIR, 'utility_bill.pdf'),
    type: 'utility_bill',
    mimeType: 'application/pdf',
  },
};

// Mock credit data
export const mockCreditData = {
  validUser: {
    creditScore: 750,
    transactionHistory: [
      JSON.stringify({
        timestamp: new Date().toISOString(),
        amount: 1500,
        type: 'payment',
        description: 'Monthly mortgage payment',
        location: 'Online',
      }),
      JSON.stringify({
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 1500,
        type: 'payment',
        description: 'Monthly mortgage payment',
        location: 'Online',
      }),
    ],
  },
  fraudUser: {
    creditScore: 720,
    transactionHistory: [
      JSON.stringify({
        timestamp: new Date().toISOString(),
        amount: 9900,
        type: 'withdrawal',
        description: 'ATM withdrawal',
        location: 'New York',
      }),
      JSON.stringify({
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        amount: 9900,
        type: 'withdrawal',
        description: 'ATM withdrawal',
        location: 'Los Angeles',
      }),
      JSON.stringify({
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        amount: 9900,
        type: 'withdrawal',
        description: 'ATM withdrawal',
        location: 'Miami',
      }),
    ],
  },
};

/**
 * Global setup before running tests
 */
export const setupTestEnvironment = async (): Promise<void> => {
  // Create database connection
  dbConnection = await createConnection({
    type: 'sqlite',
    database: ':memory:',
    entities: [path.join(__dirname, '../../src/entity/*.ts')],
    synchronize: true,
    logging: false,
  });

  // Initialize contract instances
  const creditPassportAbi = getContractAbi('CreditPassport');
  
  Object.keys(TEST_NETWORKS).forEach(network => {
    const web3 = web3Instances[network];
    const contractAddress = TEST_NETWORKS[network].contractAddress;
    
    if (contractAddress) {
      contractInstances[network] = new web3.eth.Contract(
        creditPassportAbi,
        contractAddress
      );
      
      // Add test accounts to Web3 wallet
      Object.values(TEST_ACCOUNTS).forEach(account => {
        web3.eth.accounts.wallet.add(account.privateKey);
      });
    }
  });

  // Create mock data directory if it doesn't exist
  if (!fs.existsSync(MOCK_DATA_DIR)) {
    fs.mkdirSync(MOCK_DATA_DIR, { recursive: true });
  }

  // Generate sample mock files if they don't exist
  if (!fs.existsSync(mockKycDocuments.passport.path)) {
    fs.writeFileSync(mockKycDocuments.passport.path, 'Mock passport data for testing');
  }
  if (!fs.existsSync(mockKycDocuments.driverLicense.path)) {
    fs.writeFileSync(mockKycDocuments.driverLicense.path, 'Mock driver license data for testing');
  }
  if (!fs.existsSync(mockKycDocuments.utilityBill.path)) {
    fs.writeFileSync(mockKycDocuments.utilityBill.path, 'Mock utility bill data for testing');
  }
};

/**
 * Global teardown after tests complete
 */
export const teardownTestEnvironment = async (): Promise<void> => {
  // Close database connection
  if (dbConnection && dbConnection.isConnected) {
    await dbConnection.close();
  }
  
  // Clear Web3 wallet accounts
  Object.values(web3Instances).forEach(web3 => {
    web3.eth.accounts.wallet.clear();
  });
};

/**
 * Helper function to read a mock file as buffer
 */
export const readMockFile = (filePath: string): Buffer => {
  return fs.readFileSync(filePath);
};

/**
 * Helper to generate random credit data
 */
export const generateRandomCreditData = (baseScore: number = 700) => {
  const randomFactor = Math.floor(Math.random() * 100) - 50; // -50 to +50
  return {
    creditScore: baseScore + randomFactor,
    transactionHistory: [
      JSON.stringify({
        timestamp: new Date().toISOString(),
        amount: 1000 + Math.floor(Math.random() * 5000),
        type: 'payment',
        description: 'Test transaction',
        location: 'Test location',
      })
    ],
  };
};

