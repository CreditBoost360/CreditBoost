#!/usr/bin/env ts-node
/**
 * Universal Credit Passport - Deployment Validation Script
 * 
 * This script performs a comprehensive validation of the system configuration
 * before production deployment. It checks environment variables, blockchain
 * connections, smart contracts, IPFS, database, and cross-chain functionality.
 * 
 * Usage: npm run validate-deploy
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Web3 from 'web3';
import { create as createIpfsClient } from 'ipfs-http-client';
import pg from 'pg';
import axios from 'axios';
import chalk from 'chalk';
import * as bcrypt from 'bcrypt';
import * as net from 'net';

// Define AbiItem type (normally imported from web3-utils)
interface AbiItem {
  anonymous?: boolean;
  constant?: boolean;
  inputs?: Array<{ name: string; type: string; indexed?: boolean; components?: Array<any>; internalType?: string }>;
  name?: string;
  outputs?: Array<{ name: string; type: string; components?: Array<any>; internalType?: string }>;
  payable?: boolean;
  stateMutability?: string;
  type: string;
}

// Load environment variables from .env.production
const envPath = path.join(__dirname, '../.env.production');

// Check if .env.production exists
if (!fs.existsSync(envPath)) {
  console.error(chalk.red('❌ Error: .env.production file not found!'));
  console.log(chalk.yellow('Please create .env.production with proper configuration variables.'));
  process.exit(1);
}

dotenv.config({ path: envPath });
console.log(chalk.green('✅ .env.production file loaded successfully.'));

// Required environment variable groups
const requiredEnvVars = {
  // Blockchain network config
  blockchain: [
    'DEFAULT_NETWORK',
    'PRIVATE_KEY',
    'ETHEREUM_NODE_URL', 
    'ETH_CONTRACT_ADDRESS',
    'POLYGON_NODE_URL',
    'POLYGON_CONTRACT_ADDRESS'
  ],
  // IPFS config
  ipfs: [
    'INFURA_PROJECT_ID',
    'INFURA_PROJECT_SECRET',
    'ENCRYPTION_KEY'
  ],
  // Security config
  security: [
    'JWT_SECRET',
    'BCRYPT_ROUNDS'
  ],
  // Database config
  database: [
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_DB',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD'
  ],
  // Cross-chain config
  crossChain: [
    'CCIP_ALLOWED_NETWORKS',
    'CCIP_MESSAGE_GAS_LIMIT'
  ]
};

// Validation results
interface ValidationResult {
  passed: boolean;
  details: string[];
  warnings: string[];
  errors: string[];
}

// Test connection results
interface ValidationResults {
  envVars: ValidationResult;
  blockchain: ValidationResult;
  contracts: ValidationResult;
  ipfs: ValidationResult;
  database: ValidationResult;
  crossChain: ValidationResult;
  services: ValidationResult;
  adminSetup: ValidationResult;
  overall: boolean;
}

// Initialize validation results
const validationResults: ValidationResults = {
  envVars: { passed: false, details: [], warnings: [], errors: [] },
  blockchain: { passed: false, details: [], warnings: [], errors: [] },
  contracts: { passed: false, details: [], warnings: [], errors: [] },
  ipfs: { passed: false, details: [], warnings: [], errors: [] },
  database: { passed: false, details: [], warnings: [], errors: [] },
  crossChain: { passed: false, details: [], warnings: [], errors: [] },
  services: { passed: false, details: [], warnings: [], errors: [] },
  adminSetup: { passed: false, details: [], warnings: [], errors: [] },
  overall: false
};

/**
 * Main validation function
 */
async function validateDeployment(): Promise<boolean> {
  console.log(chalk.blue('================================'));
  console.log(chalk.blue(' Universal Credit Passport'));
  console.log(chalk.blue(' Deployment Validation'));
  console.log(chalk.blue('================================\n'));
  
  try {
    // Step 1: Validate environment variables
    await validateEnvironmentVariables();
    
    // Step 2: Test blockchain network connections
    await validateBlockchainNetworks();
    
    // Step 3: Verify smart contract deployments
    await validateSmartContracts();
    
    // Step 4: Check IPFS configuration
    await validateIpfsConfig();
    
    // Step 5: Validate database connections
    await validateDatabaseConnection();
    
    // Step 6: Check cross-chain functionality
    await validateCrossChainFunctionality();
    
    // Step 7: Check required services
    await checkRequiredServices();
    
    // Step 8: Set up admin accounts if needed
    await setupAdminAccounts();
    
    // Calculate overall validation result
    validationResults.overall = 
      validationResults.envVars.passed &&
      validationResults.blockchain.passed &&
      validationResults.contracts.passed &&
      validationResults.ipfs.passed &&
      validationResults.database.passed &&
      validationResults.crossChain.passed &&
      validationResults.services.passed &&
      validationResults.adminSetup.passed;
    
    // Print summary
    printValidationSummary();
    
    return validationResults.overall;
  } catch (error) {
    console.error(chalk.red('\n❌ Validation process failed with an unexpected error:'));
    console.error(error);
    return false;
  }
}

/**
 * Validate environment variables
 */
async function validateEnvironmentVariables(): Promise<void> {
  console.log(chalk.yellow('\n📋 Validating Environment Variables...'));
  
  const result = validationResults.envVars;
  let allVarsPresent = true;
  
  // Check each group of required environment variables
  for (const [group, vars] of Object.entries(requiredEnvVars)) {
    console.log(chalk.yellow(`Checking ${group} variables...`));
    
    for (const envVar of vars) {
      if (!process.env[envVar]) {
        result.errors.push(`Missing required environment variable: ${envVar}`);
        allVarsPresent = false;
      } else {
        result.details.push(`✓ ${envVar} is defined`);
        
        // Check for default or placeholder values that should be changed
        if (
          (envVar.includes('KEY') || envVar.includes('SECRET') || envVar.includes('PASSWORD')) && 
          (process.env[envVar]?.includes('your-') || process.env[envVar]?.includes('change-me'))
        ) {
          result.warnings.push(`${envVar} appears to have a default value. Please update it.`);
        }
      }
    }
  }
  
  // Special checks for specific variables
  
  // Check ENCRYPTION_KEY for AES-256
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length !== 32) {
    result.warnings.push('ENCRYPTION_KEY should be exactly 32 characters for AES-256 encryption.');
  }
  
  // Check JWT_SECRET length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    result.warnings.push('JWT_SECRET should be at least 32 characters for security.');
  }
  
  // Check for development URLs in production
  if (process.env.ETHEREUM_NODE_URL?.includes('localhost') || 
      process.env.POLYGON_NODE_URL?.includes('localhost')) {
    result.warnings.push('Using localhost URLs for blockchain nodes in production is not recommended.');
  }
  
  result.passed = allVarsPresent && result.errors.length === 0;
  
  if (result.passed) {
    console.log(chalk.green('✅ Environment variables validation successful!'));
  } else {
    console.log(chalk.red('❌ Environment variable validation failed!'));
  }
}

/**
 * Validate blockchain network connections
 */
async function validateBlockchainNetworks(): Promise<void> {
  console.log(chalk.yellow('\n🔗 Validating Blockchain Network Connections...'));
  
  const result = validationResults.blockchain;
  const defaultNetwork = process.env.DEFAULT_NETWORK || 'polygon';
  
  // Get networks to test from CCIP_ALLOWED_NETWORKS
  const networks = (process.env.CCIP_ALLOWED_NETWORKS || 'ethereum,polygon').split(',');
  
  for (const network of networks) {
    let nodeUrl: string | undefined;
    
    // Get URL based on network
    switch (network) {
      case 'ethereum':
        nodeUrl = process.env.ETHEREUM_NODE_URL;
        break;
      case 'polygon':
        nodeUrl = process.env.POLYGON_NODE_URL;
        break;
      case 'optimism':
        nodeUrl = process.env.OPTIMISM_NODE_URL;
        break;
      case 'arbitrum':
        nodeUrl = process.env.ARBITRUM_NODE_URL;
        break;
      default:
        result.warnings.push(`Unknown network in CCIP_ALLOWED_NETWORKS: ${network}`);
        continue;
    }
    
    if (!nodeUrl) {
      result.errors.push(`Missing node URL for network: ${network}`);
      continue;
    }
    
    try {
      // Initialize Web3 and check connection
      const web3 = new Web3(nodeUrl);
      const blockNumber = await web3.eth.getBlockNumber();
      result.details.push(`✓ Connected to ${network} (Block #${blockNumber})`);
      
      // Check if this is the default network
      if (network === defaultNetwork) {
        result.details.push(`✓ Default network ${defaultNetwork} is accessible`);
      }
    } catch (error: any) {
      result.errors.push(`Failed to connect to ${network}: ${error.message}`);
    }
  }
  
  result.passed = result.errors.length === 0;
  
  if (result.passed) {
    console.log(chalk.green('✅ Blockchain network connections successful!'));
  } else {
    console.log(chalk.red('❌ Blockchain network connection tests failed!'));
  }
}

/**
 * Validate smart contract deployments
 */
async function validateSmartContracts(): Promise<void> {
  console.log(chalk.yellow('\n📜 Validating Smart Contract Deployments...'));
  
  const result = validationResults.contracts;
  const networks = (process.env.CCIP_ALLOWED_NETWORKS || 'ethereum,polygon').split(',');
  
  // Load contract ABI
  const contractPath = path.join(__dirname, '../src/blockchain/contracts/CreditPassport.json');
  if (!fs.existsSync(contractPath)) {
    result.errors.push(`Contract ABI file not found at: ${contractPath}`);
    result.passed = false;
    console.log(chalk.red('❌ Smart contract validation failed!'));
    return;
  }
  
  let contractAbi: AbiItem[];
  try {
    const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    contractAbi = contractJson.abi as AbiItem[];
  } catch (error) {
    result.errors.push(`Failed to parse contract ABI: ${error.message}`);
    result.passed = false;
    console.log(chalk.red('❌ Smart contract validation failed!'));
    return;
  }
  
  for (const network of networks) {
    let nodeUrl: string | undefined;
    let contractAddress: string | undefined;
    
    // Get URL and contract address based on network
    switch (network) {
      case 'ethereum':
        nodeUrl = process.env.ETHEREUM_NODE_URL;
        contractAddress = process.env.ETH_CONTRACT_ADDRESS;
        break;
      case 'polygon':
        nodeUrl = process.env.POLYGON_NODE_URL;
        contractAddress = process.env.POLYGON_CONTRACT_ADDRESS;
        break;
      case 'optimism':
        nodeUrl = process.env.OPTIMISM_NODE_URL;
        contractAddress = process.env.OPTIMISM_CONTRACT_ADDRESS;
        break;
      case 'arbitrum':
        nodeUrl = process.env.ARBITRUM_NODE_URL;
        contractAddress = process.env.ARBITRUM_CONTRACT_ADDRESS;
        break;
      default:
        continue;
    }
    
    if (!nodeUrl || !contractAddress) {
      continue;
    }
    
    try {
      // Initialize Web3 and contract instance
      const web3 = new Web3(nodeUrl);
      const contract = new web3.eth.Contract(contractAbi, contractAddress);
      
      // Check if contract exists at the address
      const code = await web3.eth.getCode(contractAddress);
      if (code === '0x' || code === '0x0') {
        result.errors.push(`No contract found at address ${contractAddress} on ${network}`);
        continue;
      }
      
      // Try to call a function to verify it's our contract
      try {
        // Check for a specific function or property in the contract
        await contract.methods.DEFAULT_ADMIN_ROLE().call();
        result.details.push(`✓ CreditPassport contract verified on ${network} at ${contractAddress}`);
      } catch (funcError) {
        result.errors.push(`Contract at ${contractAddress} on ${network} is not a CreditPassport contract: ${funcError.message}`);
      }
    } catch (error) {
      result.errors.push(`Failed to verify contract on ${network}: ${error.message}`);
    }
  }
  
  result.passed = result.errors.length === 0;
  
  if (result.passed) {
    console.log(chalk.green('✅ Smart contracts verified successfully!'));
  } else {
    console.log(chalk.red('❌ Smart contract verification failed!'));
  }
}

/**
 * Validate IPFS configuration
 */
async function validateIpfsConfig(): Promise<void> {
  console.log(chalk.yellow('\n📁 Validating IPFS Configuration...'));
  
  const result = validationResults.ipfs;
  
  // Check for required IPFS credentials
  if (!process.env.INFURA_PROJECT_ID || !process.env.INFURA_PROJECT_SECRET) {
    result.errors.push('Missing IPFS Infura credentials.');
    result.passed = false;
    console.log(chalk.red('❌ IPFS configuration validation failed!'));
    return;
  }
  
  // Test IPFS connection
  try {
    const auth = 'Basic ' + Buffer.from(
      process.env.INFURA_PROJECT_ID + ':' + process.env.INFURA_PROJECT_SECRET
    ).toString('base64');
    
    const ipfs = createIpfsClient({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: auth
      }
    });
    
    // Try to upload a small test file
    const testData = Buffer.from('Universal Credit Passport IPFS Test ' + new Date().toISOString());
    const uploadResult = await ipfs.add(testData);
    
    if (uploadResult.path) {
      result.details.push(`✓ Successfully connected to IPFS and uploaded test file with CID: ${uploadResult.path}`);
      
      // Try to retrieve the file to verify
      let retrieved = Buffer.from('');
      for await (const chunk of ipfs.cat(uploadResult.path)) {
        retrieved = Buffer.concat([retrieved, chunk]);
      }
      
      if (retrieved.toString() === testData.toString()) {
        result.details.push('✓ Successfully retrieved test file from IPFS');
      } else {
        result.warnings.push('Retrieved test file content doesn\'t match uploaded content');
      }
    } else {
      result.errors.push('Failed to get IPFS CID for uploaded file');
    }
  } catch (error: any) {
    result.errors.push(`IPFS connection failed: ${error.message}`);
  }
  
  // Verify encryption key
  if (!process.env.ENCRYPTION_KEY) {
    result.errors.push('Missing ENCRYPTION_KEY for document security');
  } else if (process.env.ENCRYPTION_KEY.length !== 32) {
    result.warnings.push('ENCRYPTION_KEY should be exactly 32 characters for AES-256 encryption');
  } else {
    result.details.push('✓ ENCRYPTION_KEY is properly configured');
  }
  
  // Check backup gateway
  if (!process.env.IPFS_GATEWAY) {
    result.warnings.push('No backup IPFS gateway configured (IPFS_GATEWAY)');
  } else {
    result.details.push(`✓ Backup IPFS gateway configured: ${process.env.IPFS_GATEWAY}`);
  }
  
  result.passed = result.errors.length === 0;
  
  if (result.passed) {
    console.log(chalk.green('✅ IPFS configuration check successful!'));
  } else {
    console.log(chalk.red('❌ IPFS configuration check failed!'));
  }
}

/**
 * Validate cross-chain functionality
 */
async function validateCrossChainFunctionality(): Promise<void> {
  console.log(chalk.yellow('\n⛓️  Validating Cross-Chain Functionality...'));
  
  const result = validationResults.crossChain;
  
  // Check if we have blockchain network access first
  if (!validationResults.blockchain.passed) {
    result.errors.push('Cannot validate cross-chain functionality without blockchain network access.');
    result.passed = false;
    console.log(chalk.red('❌ Cross-chain validation skipped due to blockchain network errors.'));
    return;
  }
  
  // Check if we have CCIP configuration
  if (!process.env.CCIP_ALLOWED_NETWORKS || !process.env.CCIP_MESSAGE_GAS_LIMIT) {
    result.errors.push('Missing CCIP configuration variables.');
    result.passed = false;
    console.log(chalk.red('❌ Cross-chain validation failed!'));
    return;
  }
  
  // Check router configuration
  const networks = process.env.CCIP_ALLOWED_NETWORKS.split(',');
  for (const network of networks) {
    let routerAddress: string | undefined;
    
    switch (network) {
      case 'ethereum':
        routerAddress = process.env.ETH_CCIP_ROUTER;
        break;
      case 'polygon':
        routerAddress = process.env.POLYGON_CCIP_ROUTER;
        break;
      case 'optimism':
        routerAddress = process.env.OPTIMISM_CCIP_ROUTER;
        break;
      case 'arbitrum':
        routerAddress = process.env.ARBITRUM_CCIP_ROUTER;
        break;
    }
    
    if (!routerAddress) {
      result.warnings.push(`Missing CCIP router address for ${network}`);
    } else {
      result.details.push(`✓ CCIP router configured for ${network}: ${routerAddress}`);
    }
  }
  
  // Basic validation only for now - full cross-chain testing would require actual message sending
  result.details.push('✓ Cross-chain configuration exists');
  result.details.push(`✓ Gas limit for CCIP messages: ${process.env.CCIP_MESSAGE_GAS_LIMIT}`);
  
  // Check if there are at least 2 networks for cross-chain functionality
  if (networks.length < 2) {
    result.warnings.push('Need at least 2 networks for cross-chain functionality');
  } else {
    result.details.push(`✓ ${networks.length} networks configured for cross-chain messaging`);
  }
  
  result.passed = result.errors.length === 0;
  
  if (result.passed) {
    console.log(chalk.green('✅ Cross-chain configuration validation successful!'));
  } else {
    console.log(chalk.red('❌ Cross-chain configuration validation failed!'));
  }
}

/**
 * Validate database connection
 */
async function validateDatabaseConnection(): Promise<void> {
  console.log(chalk.yellow('\n🛢️  Validating Database Connection...'));
  
  const result = validationResults.database;
  
  // Check for required database configuration
  if (!process.env.POSTGRES_HOST || !process.env.POSTGRES_PORT || 
      !process.env.POSTGRES_DB || !process.env.POSTGRES_USER || 
      !process.env.POSTGRES_PASSWORD) {
    result.errors.push('Missing required PostgreSQL configuration.');
    result.passed = false;
    console.log(chalk.red('❌ Database connection validation failed.'));
    return;
  }
  
  // Create a client to test connection
  const client = new pg.Client({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl: process.env.POSTGRES_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false
  });
  
  try {
    // Connect to database
    await client.connect();
    result.details.push(`✓ Successfully connected to PostgreSQL database at ${process.env.POSTGRES_HOST}`);
    
    // Test query to verify connection and permissions
    const queryResult = await client.query('SELECT current_database(), current_user, version()');
    const row = queryResult.rows[0];
    
    result.details.push(`✓ Connected to database: ${row.current_database}`);
    result.details.push(`✓ Connected as user: ${row.current_user}`);
    result.details.push(`✓ PostgreSQL version: ${row.version.split(' ')[1]}`);
    
    // Check if required tables exist
    try {
      // This query checks if tables exist in the public schema
      const tablesQuery = await client.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      );
      
      const tables = tablesQuery.rows.map(row => row.table_name);
      result.details.push(`✓ Found ${tables.length} tables in database`);
      
      // Check for essential tables
      const requiredTables = ['users', 'credit_records', 'kyc_documents', 'transactions'];
      const missingTables = requiredTables.filter(table => !tables.includes(table));
      
      if (missingTables.length > 0) {
        result.warnings.push(`Missing expected tables: ${missingTables.join(', ')}`);
      } else {
        result.details.push('✓ All required tables are present');
      }
    } catch (tableError) {
      result.warnings.push(`Unable to check tables: ${tableError.message}`);
    }
    
    // Test database write permission with a temporary record
    try {
      // Create a temporary table for testing if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS deployment_test (
          id SERIAL PRIMARY KEY,
          test_value TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      // Insert a test record
      const insertResult = await client.query(
        'INSERT INTO deployment_test (test_value) VALUES ($1) RETURNING id',
        [`Test from deployment script at ${new Date().toISOString()}`]
      );
      
      if (insertResult.rows.length > 0) {
        result.details.push('✓ Successfully created test record (write permissions confirmed)');
        
        // Clean up the test record
        await client.query('DELETE FROM deployment_test WHERE id = $1', [insertResult.rows[0].id]);
        result.details.push('✓ Successfully deleted test record');
      }
    } catch (writeError) {
      result.warnings.push(`Database write test failed: ${writeError.message}`);
    }
    
    result.passed = true;
  } catch (error) {
    result.errors.push(`Database connection failed: ${error.message}`);
    result.passed = false;
  } finally {
    // Close the connection
    try {
      await client.end();
    } catch (e) {
      // Ignore errors on disconnect
    }
  }
  
  if (result.passed) {
    console.log(chalk.green('✅ Database connection validation successful.'));
  } else {
    console.log(chalk.red('❌ Database connection validation failed.'));
  }
}

/**
 * Check if required services are running
 */
async function checkRequiredServices(): Promise<void> {
  console.log(chalk.yellow('\n🔄 Checking Required Services...'));
  
  const result = validationResults.services;
  
  // List of services to check with their endpoints and expected response patterns
  const services = [
    {
      name: 'API Server',
      url: process.env.API_URL || 'http://localhost:3000/health',
      expectedStatus: 200,
      expectedResponse: { status: 'ok' },
    },
    {
      name: 'AI Fraud Detection Service',
      url: process.env.AI_FRAUD_DETECTION_ENDPOINT,
      expectedStatus: 200,
      headers: {
        'X-API-Key': process.env.AI_FRAUD_DETECTION_API_KEY || '',
      },
    },
    {
      name: 'TransUnion Integration',
      url: process.env.TRANSUNION_ENDPOINT,
      expectedStatus: 200,
      headers: {
        'Authorization': `Bearer ${process.env.TRANSUNION_API_KEY || ''}`,
      },
    }
  ];
  
  let allServicesRunning = true;
  
  // Check each service
  for (const service of services) {
    if (!service.url) {
      result.warnings.push(`No URL configured for ${service.name}`);
      continue;
    }
    
    try {
      const response = await axios.get(service.url, {
        headers: service.headers || {},
        validateStatus: () => true, // Don't throw on any status code
        timeout: 5000, // 5 second timeout
      });
      
      if (response.status === service.expectedStatus) {
        result.details.push(`✓ ${service.name} is running (Status: ${response.status})`);
        
        // Check expected response pattern if defined
        if (service.expectedResponse && 
            JSON.stringify(response.data).includes(JSON.stringify(service.expectedResponse))) {
          result.details.push(`✓ ${service.name} returned expected response pattern`);
        }
      } else {
        result.errors.push(`${service.name} returned unexpected status: ${response.status}`);
        allServicesRunning = false;
      }
    } catch (error) {
      result.errors.push(`Failed to connect to ${service.name}: ${error.message}`);
      allServicesRunning = false;
    }
  }
  
  // Check Redis if configured
  if (process.env.REDIS_URL) {
    try {
      // Simple telnet-like check to Redis
      const redis = process.env.REDIS_URL.split(':');
      const host = redis[1].replace(/\/\//g, '');
      const port = parseInt(redis[2], 10);
      
      const net = require('net');
      const socket = new net.Socket();
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          socket.destroy();
          reject(new Error('Connection timeout'));
        }, 3000);
        
        socket.connect(port, host, () => {
          clearTimeout(timeout);
          result.details.push(`✓ Redis cache is accessible at ${host}:${port}`);
          socket.destroy();
          resolve();
        });
        
        socket.on('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });
    } catch (error) {
      result.errors.push(`Failed to connect to Redis: ${error.message}`);
      allServicesRunning = false;
    }
  } else {
    result.warnings.push('No Redis URL configured for caching');
  }
  
  result.passed = allServicesRunning && result.errors.length === 0;
  
  if (result.passed) {
    console.log(chalk.green('✅ All required services are running.'));
  } else {
    console.log(chalk.red('❌ Some required services are not running or not responding as expected.'));
  }
}

/**
 * Set up initial admin accounts
 */
async function setupAdminAccounts(): Promise<void> {
  console.log(chalk.yellow('\n👤 Setting Up Admin Accounts...'));
  
  const result = validationResults.adminSetup;
  
  // Skip if database connection failed
  if (!validationResults.database.passed) {
    result.errors.push('Skipping admin setup due to database connection failure');
    result.passed = false;
    console.log(chalk.red('❌ Admin account setup skipped.'));
    return;
  }
  
  // Connect to database
  const client = new pg.Client({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl: process.env.POSTGRES_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false
  });
  
    try {
      await client.connect();
      
      // Check if users table exists
      const tableCheck = await client.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"
      );
      
      if (!tableCheck.rows[0].exists) {
        result.errors.push('Users table does not exist, cannot set up admin account');
        result.passed = false;
        return;
      }
      
      // Check if admin user already exists
      const adminCheck = await client.query(
        "SELECT * FROM users WHERE role = 'ADMIN' LIMIT 1"
      );
      
      if (adminCheck.rows.length > 0) {
        result.details.push(`✓ Admin account already exists (username: ${adminCheck.rows[0].username})`);
        result.passed = true;
      } else {
        // Configuration for admin setup
        const defaultAdminConfig = {
          username: 'admin',
          email: 'admin@creditboost.com',
          password: 'ChangeMe!2025',
          role: 'ADMIN'
        };
        
        // Create admin user
        // Hash the password
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
        const hashedPassword = await bcrypt.hash(defaultAdminConfig.password, saltRounds);
        
        // Insert admin user
        await client.query(
          `INSERT INTO users (username, email, password, role, created_at) 
           VALUES ($1, $2, $3, $4, NOW())`,
          [
            defaultAdminConfig.username,
            defaultAdminConfig.email,
            hashedPassword,
            defaultAdminConfig.role
          ]
        );
        
        result.details.push(`✓ Created admin account (username: ${defaultAdminConfig.username})`);
        result.details.push('⚠️ IMPORTANT: Change the default admin password immediately after first login!');
        result.passed = true;
      }
      
    } catch (error: any) {
      result.errors.push(`Failed to set up admin account: ${error.message}`);
    result.passed = false;
  } finally {
    await client.end();
  }
  
  if (result.passed) {
    console.log(chalk.green('✅ Admin account setup successful.'));
  } else {
    console.log(chalk.red('❌ Admin account setup failed.'));
  }
}

/**
 * Print validation summary
 */
function printValidationSummary(): boolean {
  console.log(chalk.yellow('\n📊 Validation Summary'));
  console.log(chalk.yellow('==================='));
  
  let allPassed = true;
  const components = [
    { name: 'Environment Variables', result: validationResults.envVars },
    { name: 'Blockchain Networks', result: validationResults.blockchain },
    { name: 'Smart Contracts', result: validationResults.contracts },
    { name: 'IPFS Configuration', result: validationResults.ipfs },
    { name: 'Database Connection', result: validationResults.database },
    { name: 'Required Services', result: validationResults.services },
    { name: 'Admin Account Setup', result: validationResults.adminSetup },
  ];
  
  // Print summary table
  components.forEach(component => {
    const status = component.result.passed ? 
      chalk.green('✅ PASSED') : 
      chalk.red('❌ FAILED');
    
    console.log(`${component.name.padEnd(25)} ${status}`);
    
    if (!component.result.passed) {
      allPassed = false;
    }
  });
  
  console.log('\n');
  
  // Print warnings
  const allWarnings = components.flatMap(c => 
    c.result.warnings.map(w => `[${c.name}] ${w}`)
  );
  
  if (allWarnings.length > 0) {
    console.log(chalk.yellow('⚠️  Warnings:'));
    allWarnings.forEach(warning => {
      console.log(chalk.yellow(`  • ${warning}`));
    });
    console.log('\n');
  }
  
  // Print errors
  const allErrors = components.flatMap(c => 
    c.result.errors.map(e => `[${c.name}] ${e}`)
  );
  
  if (allErrors.length > 0) {
    console.log(chalk.red('❌ Errors:'));
    allErrors.forEach(error => {
      console.log(chalk.red(`  • ${error}`));
    });
    console.log('\n');
  }
  
  // Print overall status
  if (allPassed) {
    console.log(chalk.green.bold('✅ ALL VALIDATIONS PASSED'));
    console.log(chalk.green('The Universal Credit Passport system is correctly configured for production.'));
  } else {
    console.log(chalk.red.bold('❌ VALIDATION FAILED'));
    console.log(chalk.red('The Universal Credit Passport system has configuration issues that must be resolved.'));
    
    // Generate recommendations
    console.log(chalk.yellow('\n📋 Recommendations:'));
    
    if (validationResults.envVars.passed === false) {
      console.log(chalk.yellow('  • Environment Variables: Set all required environment variables in .env.production file'));
    }
    
    if (validationResults.blockchain.passed === false) {
      console.log(chalk.yellow('  • Blockchain Networks: Verify RPC endpoints and network access for all configured networks'));
      console.log(chalk.yellow('    Make sure the node endpoints are accessible from the deployment environment'));
    }
    
    if (validationResults.contracts.passed === false) {
      console.log(chalk.yellow('  • Smart Contracts: Ensure contracts are deployed to all configured networks'));
      console.log(chalk.yellow('    Verify contract addresses are correct in the .env.production file'));
    }
    
    if (validationResults.ipfs.passed === false) {
      console.log(chalk.yellow('  • IPFS: Verify Infura project ID and secret are correct'));
      console.log(chalk.yellow('    Ensure the ENCRYPTION_KEY is exactly 32 characters long'));
    }
    
    if (validationResults.database.passed === false) {
      console.log(chalk.yellow('  • Database: Check PostgreSQL connection parameters'));
      console.log(chalk.yellow('    Verify the database user has sufficient permissions'));
    }
    
    if (validationResults.services.passed === false) {
      console.log(chalk.yellow('  • Services: Ensure all required services are running and accessible'));
      console.log(chalk.yellow('    Check service endpoints and credentials in the .env.production file'));
    }
    
    if (validationResults.adminSetup.passed === false) {
      console.log(chalk.yellow('  • Admin Setup: Verify database tables are created correctly'));
      console.log(chalk.yellow('    Ensure database user has write permissions for creating admin users'));
    }
  }
  
  // Return overall status for exit code
  return allPassed;
}

// Run validation script
validateDeployment()
  .then(result => {
    // Print final message and timestamp
    const timestamp
  console.log(chalk.yellow('\n📋 Validating Environment Variables...'));
  
  const result = validationResults.envVars;
  let allVarsPresent = true;
  
  // Check each group of environment variables
  for (const [group, vars] of Object.entries(requiredEnvVars)) {
    console.log(chalk.yellow(`Checking ${group} variables...`));
    
    for (const envVar of vars) {
      if (!process.env[envVar]) {
        result.errors.push(`Missing required environment variable: ${envVar}`);
        allVarsPresent = false;
      } else {
        result.details.push(`✓ ${envVar} is defined`);
        
        // Check for default or placeholder values that should be changed
        if (
          (envVar.includes('KEY') || envVar.includes('SECRET') || envVar.includes('PASSWORD')) && 
          (process.env[envVar]?.includes('your-') || process.env[envVar]?.includes('change-me'))
        ) {
          result.warnings.push(`${envVar} appears to have a default value. Please update it.`);
        }
      }
    }
  }
  
  // Validate encryption key length for AES-256
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length !== 32) {
    result.warnings.push('ENCRYPTION_KEY should be exactly 32 characters for AES-256 encryption.');
  }
  
  // Validate JWT secret length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    result.warnings.push('JWT_SECRET should be at least 32 characters for security.');
  }
  
  // Check for development URLs in production
  if (process.env.ETHEREUM_NODE_URL?.includes('localhost') || 
      process.env.POLYGON_NODE_URL?.includes('localhost')) {
    result.warnings.push('Using localhost URLs for blockchain nodes in production is not recommended.');
  }
  
  result.passed = allVarsPresent && result.errors.length === 0;
  
  if (result.passed) {
    console.log(chalk.green('✅ Environment variables validated successfully.'));
  } else {
    console.log(chalk.red('❌ Environment variable validation failed.'));
  }
}

/**
 * Test connections to all configured blockchain networks
 */
async function testBlockchainConnections() {
  console.log(chalk.yellow('\n🔗 Testing Blockchain Network Connections...'));
  
  const result = validationResults.blockchain;
  const defaultNetwork = process.env.DEFAULT_NETWORK || 'polygon';
  
  // Get list of networks to test from CCIP_ALLOWED_NETWORKS
  const networks = (process.env.CCIP_ALLOWED_NETWORKS || 'ethereum,polygon').split(',');
  
  for (const network of networks) {
    let nodeUrl: string | undefined;
    let contractAddress: string | undefined;
    
    // Get URL and contract address based on network
    switch (network) {
      case 'ethereum':
        nodeUrl = process.env.ETHEREUM_NODE_URL;
        contractAddress = process.env.ETH_CONTRACT_ADDRESS;
        break;
      case 'polygon':
        nodeUrl = process.env.POLYGON_NODE_URL;
        contractAddress = process.env.POLYGON_CONTRACT_ADDRESS;
        break;
      case 'optimism':
        nodeUrl = process.env.OPTIMISM_NODE_URL;
        contractAddress = process.env.OPTIMISM_CONTRACT_ADDRESS;
        break;
      case 'arbitrum':
        nodeUrl = process.env.ARBITRUM_NODE_URL;
        contractAddress = process.env.ARBITRUM_CONTRACT_ADDRESS;
        break;
      default:
        result.warnings.push(`Unknown network in CCIP_ALLOWED_NETWORKS: ${network}`);
        continue;
    }
    
    if (!nodeUrl) {
      result.errors.push(`Missing node URL for network: ${network}`);
      continue;
    }
    
    try {
      // Initialize Web3 and check connection
      const web3 = new Web3(nodeUrl);
      const blockNumber = await web3.eth.getBlockNumber();
      result.details.push(`✓ Connected to ${network} (Block #${blockNumber})`);
      
      // Check if contract address is defined
      if (!contractAddress) {
        result.warnings.push(`Missing contract address for network: ${network}`);
      }
      
      // Check if this is the default network
      if (network === defaultNetwork) {
        result.details.push(`✓ Default network ${defaultNetwork} is accessible`);
      }
    } catch (error) {
      result.errors.push(`Failed to connect to ${network}: ${error.message}`);
    }
  }
  
  result.passed = result.errors.length === 0;
  
  if (result.passed) {
    console.log(chalk.green('✅ Blockchain network connections successful.'));
  } else {
    console.log(chalk.red('❌ Blockchain network connection tests failed.'));
  }
}

/**
 * Verify smart contract deployments
 */
async function verifySmartContracts() {
  console.log(chalk.yellow('\n📜 Verifying Smart Contract Deployments...'));
  
  const result = validationResults.contracts;
  const networks = (process.env.CCIP_ALLOWED_NETWORKS || 'ethereum,polygon').split(',');
  
  // Load contract ABI
  const contractPath = path.join(__dirname, '../src/blockchain/contracts/CreditPassport.json');
  if (!fs.existsSync(contractPath)) {
    result.errors.push(`Contract ABI file not found at: ${contractPath}`);
    result.passed = false;
    console.log(chalk.red('❌ Smart contract verification failed.'));
    return;
  }
  
  const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  const contractAbi = contractJson.abi as AbiItem[];
  
  for (const network of networks) {
    let nodeUrl: string | undefined;
    let contractAddress: string | undefined;
    
    // Get URL and contract address based on network
    switch (network) {
      case 'ethereum':
        nodeUrl = process.env.ETHEREUM_NODE_URL;
        contractAddress = process.env.ETH_CONTRACT_ADDRESS;
        break;
      case 'polygon':
        nodeUrl = process.env.POLYGON_NODE_URL;
        contractAddress = process.env.POLYGON_CONTRACT_ADDRESS;
        break;
      case 'optimism':
        nodeUrl = process.env.OPTIMISM_NODE_URL;
        contractAddress = process.env.OPTIMISM_CONTRACT_ADDRESS;
        break;
      case 'arbitrum':
        nodeUrl = process.env.ARBITRUM_NODE_URL;
        contractAddress = process.env.ARBITRUM_CONTRACT_ADDRESS;
        break;
      default:
        continue;
    }
    
    if (!nodeUrl || !contractAddress) {
      continue; // Skip if URL or address is not defined (already reported in network test)
    }
    
    try {
      // Initialize Web3 and contract instance
      const web3 = new Web3(nodeUrl);
      const contract = new web3.eth.Contract(contractAbi, contractAddress);
      
      // Try to call a function to verify contract is deployed and accessible
      // We'll check if the contract responds to a view function
      const code = await web3.eth.getCode(contractAddress);
      if (code === '0x' || code === '0x0') {
        result.errors.push(`No contract found at address ${contractAddress} on ${network}`);
        continue;
      }
      
      // Verify it's actually our contract by checking a specific function
      try {
        // Check that contract has expected functions
        await contract.methods.DEFAULT_ADMIN_ROLE().call();
        result.details.push(`✓ CreditPassport contract verified on ${network} at ${contractAddress}`);
      } catch (funcError: any) {
        result.errors.push(`Contract at ${contractAddress} on ${network} is not a CreditPassport contract: ${funcError.message}`);
      }
    } catch (error: any) {
      result.errors.push(`Failed to verify contract on ${network}: ${error.message}`);
    }
  }
  
  result.passed = result.errors.length === 0;
  
  if (result.passed) {
    console.log(chalk.green('✅ Smart contracts verified successfully.'));
  } else {
    console.log(chalk.red('❌ Smart contract verification failed.'));
  }
}

/**
 * Check IPFS configuration
 */
async function checkIpfsConfiguration() {
  console.log(chalk.yellow('\n📁 Checking IPFS Configuration...'));
  
  const result = validationResults.ipfs;
  
  // Check for required IPFS credentials
  if (!process.env.INFURA_PROJECT_ID || !process.env.INFURA_PROJECT_SECRET) {
    result.errors.push('Missing IPFS Infura credentials.');
    result.passed = false;
    console.log(chalk.red('❌ IPFS configuration check failed.'));
    return;
  }
  
  // Test IPFS connection
  try {
    const auth = 'Basic ' + Buffer.from(
      process.env.INFURA_PROJECT_ID + ':' + process.env.INFURA_PROJECT_SECRET
    ).toString('base64');
    
    const ipfs = createIpfsClient({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: auth
      }
    });
    
    // Try to upload a small test file
    const testData = Buffer.from('Universal Credit Passport IPFS Test ' + new Date().toISOString());
    const result = await ipfs.add(testData);
    
    if (result.path) {
      validationResults.ipfs.details.push(`✓ Successfully connected to IPFS and uploaded test file with CID: ${result.path}`);
      
      // Try to retrieve the file to verify
      let retrieved = Buffer.from('');
      for await (const chunk of ipfs.cat(result.path)) {
        retrieved = Buffer.concat([retrieved, chunk]);
      }
      
      if (retrieved.toString() === testData.toString()) {
        validationResults.ipfs.details.push('✓ Successfully retrieved test file from IPFS');
      } else {
        validationResults.ipfs.warnings.push('Retrieved test file content doesn\'t match uploaded content');
      }
    } else {
      validationResults.ipfs.errors.push('Failed to get IPFS CID for uploaded file');
    }
  } catch (error) {
    validationResults.ipfs.errors.push(`IPFS connection failed: ${error.message}`);
  }
  
  // Verify encryption key
  if (!process.env.ENCRYPTION_KEY) {
    validationResults.ipfs.errors.push('Missing ENCRYPTION_KEY for document security');
  } else if (process.env.ENCRYPTION_KEY.length !== 32) {
    validationResults.ipfs.warnings.push('ENCRYPTION_KEY should be exactly 32 characters for AES-256 encryption');
  } else {
    validationResults.ipfs.details.push('✓ ENCRYPTION_KEY is properly configured');
  }
  
  // Check backup gateway
  if (!process.env.IPFS_GATEWAY) {
    validationResults.ipfs.warnings.push('No backup IPFS gateway configured (IPFS_GATEWAY)');
  } else {
    validationResults.ipfs.details.push(`✓ Backup IPFS gateway configured: ${process.env.IPFS_GATEWAY}`);
  }
  
  validationResults.ipfs.passed = validationResults.ipfs.errors.length === 0;
  
  if (validationResults.ipfs.passed) {
    console.log(chalk.green('✅ IPFS configuration check successful.'));
  } else {
    console.log(chalk.red('❌ IPFS configuration check failed.'));
  }
}

// Add main execution at the end of the file
// Run the validation and exit with appropriate code
validateDeployment()
  .then(result => {
    // Print final message and timestamp
    const timestamp = new Date().toISOString();
    console.log(chalk.blue(`\nValidation completed at: ${timestamp}`));
    
    // Exit with appropriate code - 0 for success, 1 for failure
    if (typeof result === 'boolean') {
      process.exit(result ? 0 : 1);
    } else {
      const allPassed = 
        validationResults.envVars.passed &&
        validationResults.blockchain.passed &&
        validationResults.contracts.passed &&
        validationResults.ipfs.passed &&
        validationResults.database.passed &&
        validationResults.services.passed &&
        validationResults.adminSetup.passed;
      
      process.exit(allPassed ? 0 : 1);
    }
  })
  .catch(error => {
    console.error(chalk.red(`\nFatal error during validation: ${error.message}`));
    console.error(error);
    process.exit(1);
  });

