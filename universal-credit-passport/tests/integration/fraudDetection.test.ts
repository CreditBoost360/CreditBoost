/**
 * Integration tests for the AI-based fraud detection system
 * Tests pattern analysis, risk scoring, and system response to suspicious activities
 */

import {
  setupTestEnvironment,
  teardownTestEnvironment,
  TEST_ACCOUNTS,
  mockCreditData,
  web3Instances,
  contractInstances,
} from './setup';

// Import fraud detection service
import { 
  detectFraudulentActivity,
  FraudDetectionResult
} from '../../src/services/ai/fraudDetection';

// Import data models
import { CreditData, TransactionRecord } from '../../src/types';

describe('Fraud Detection System Tests', () => {
  // Global test variables
  let userAddress: string;
  let fraudUserAddress: string;
  
  // Setup before running tests
  beforeAll(async () => {
    await setupTestEnvironment();
    userAddress = TEST_ACCOUNTS.user.address;
    fraudUserAddress = TEST_ACCOUNTS.institution.address; // Using institution address as fraud user for testing
    
    // Setup test data on blockchain
    await setupTestData();
  });
  
  // Cleanup after tests complete
  afterAll(async () => {
    await teardownTestEnvironment();
  });
  
  /**
   * Helper to set up test data
   */
  async function setupTestData() {
    // Create valid user credit passport
    const validUserData = mockCreditData.validUser;
    const contract = contractInstances.polygon;
    
    await contract.methods
      .createCreditPassport(
        validUserData.creditScore,
        validUserData.transactionHistory
      )
      .send({ from: userAddress, gas: 3000000 });
    
    // Create suspicious user credit passport
    const fraudUserData = mockCreditData.fraudUser;
    
    await contract.methods
      .createCreditPassport(
        fraudUserData.creditScore,
        fraudUserData.transactionHistory
      )
      .send({ from: fraudUserAddress, gas: 3000000 });
  }
  
  test('Should correctly identify normal user activity as non-fraudulent', async () => {
    // Get credit data from blockchain
    const contract = contractInstances.polygon;
    const data = await contract.methods
      .getCreditData(userAddress)
      .call();
    
    // Convert to CreditData format for fraud detection
    const creditData: CreditData = {
      creditScore: Number(data[0]),
      transactionHistory: parseTransactions(data[1]),
      owner: userAddress,
      lastUpdateTimestamp: Date.now()
    };
    
    // Run fraud detection
    const result: FraudDetectionResult = await detectFraudulentActivity(creditData);
    
    // Assertions for non-fraudulent activity
    expect(result.isFraudulent).toBe(false);
    expect(result.riskScore).toBeLessThan(50); // Low risk score
    expect(result.detectionDetails.patternAnalysis.suspiciousPatterns).toBe(false);
    expect(result.detectionDetails.patternAnalysis.detectedPatterns.length).toBe(0);
  });
  
  test('Should detect suspicious geographic transaction patterns', async () => {
    // Get credit data for suspicious user
    const contract = contractInstances.polygon;
    const data = await contract.methods
      .getCreditData(fraudUserAddress)
      .call();
    
    // Convert to CreditData format
    const creditData: CreditData = {
      creditScore: Number(data[0]),
      transactionHistory: parseTransactions(data[1]),
      owner: fraudUserAddress,
      lastUpdateTimestamp: Date.now()
    };
    
    // Run fraud detection
    const result: FraudDetectionResult = await detectFraudulentActivity(creditData);
    
    // Assertions for suspicious activity
    expect(result.isFraudulent).toBe(true);
    expect(result.riskScore).toBeGreaterThan(70); // High risk score
    expect(result.detectionDetails.patternAnalysis.suspiciousPatterns).toBe(true);
    
    // Should detect geographic anomalies
    expect(result.detectionDetails.patternAnalysis.detectedPatterns).toContain('geographic_anomalies');
    
    // Should provide recommendations
    expect(result.detectionDetails.recommendations.length).toBeGreaterThan(0);
  });
  
  test('Should detect suspicious rapid succession transactions', async () => {
    // Create credit data with rapid succession transactions
    const rapidTransactions = [
      JSON.stringify({
        timestamp: new Date().toISOString(),
        amount: 500,
        type: 'purchase',
        description: 'Online purchase',
        location: 'Online',
      }),
      JSON.stringify({
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
        amount: 500,
        type: 'purchase',
        description: 'Online purchase',
        location: 'Online',
      }),
      JSON.stringify({
        timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 minutes ago
        amount: 500,
        type: 'purchase',
        description: 'Online purchase',
        location: 'Online',
      }),
    ];
    
    // Add these transactions to the blockchain
    const contract = contractInstances.polygon;
    
    // Clear existing transactions by creating a new passport
    await contract.methods
      .createCreditPassport(700, [])
      .send({ from: userAddress, gas: 3000000 });
    
    // Add each transaction
    for (const tx of rapidTransactions) {
      await contract.methods
        .addTransaction(tx)
        .send({ from: userAddress, gas: 1000000 });
    }
    
    // Get the updated credit data
    const data = await contract.methods
      .getCreditData(userAddress)
      .call();
    
    // Convert to CreditData format
    const creditData: CreditData = {
      creditScore: Number(data[0]),
      transactionHistory: parseTransactions(data[1]),
      owner: userAddress,
      lastUpdateTimestamp: Date.now()
    };
    
    // Run fraud detection
    const result: FraudDetectionResult = await detectFraudulentActivity(creditData);
    
    // Assertions for rapid succession transaction detection
    expect(result.detectionDetails.patternAnalysis.detectedPatterns).toContain('rapid_succession_transactions');
    expect(result.isFraudulent).toBe(true);
  });
  
  test('Should calculate accurate risk scores based on multiple factors', async () => {
    // Create credit data with multiple suspicious patterns
    const suspiciousTransactions = [
      JSON.stringify({
        timestamp: new Date().toISOString(),
        amount: 9900, // Just below 10K reporting threshold
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
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 

