/**
 * Integration tests for cross-chain synchronization
 * Tests that credit data can be synchronized across different blockchain networks
 */

import {
  setupTestEnvironment,
  teardownTestEnvironment,
  TEST_ACCOUNTS,
  contractInstances,
  web3Instances,
  mockCreditData,
  generateRandomCreditData,
} from './setup';

// Import web3 service functions
import { sendCrossChainCreditData } from '../../src/blockchain/services/web3Service';

describe('Cross-Chain Synchronization Tests', () => {
  // Global test variables
  let userAddress: string;
  let creditScoreEthereum: number;
  let creditScorePolygon: number;
  
  // Setup before running tests
  beforeAll(async () => {
    await setupTestEnvironment();
    userAddress = TEST_ACCOUNTS.user.address;
    
    // Create credit passports on both chains for testing
    await setupCreditPassports();
  });
  
  // Cleanup after tests complete
  afterAll(async () => {
    await teardownTestEnvironment();
  });
  
  /**
   * Helper function to set up credit passports on both test chains
   */
  async function setupCreditPassports() {
    // Initialize with different credit scores on each chain
    const ethereumData = generateRandomCreditData(700);
    const polygonData = generateRandomCreditData(720);
    
    creditScoreEthereum = ethereumData.creditScore;
    creditScorePolygon = polygonData.creditScore;
    
    // Create credit passport on Ethereum
    const ethContract = contractInstances.ethereum;
    await ethContract.methods
      .createCreditPassport(
        ethereumData.creditScore,
        ethereumData.transactionHistory
      )
      .send({ from: userAddress, gas: 3000000 });
    
    // Create credit passport on Polygon
    const polygonContract = contractInstances.polygon;
    await polygonContract.methods
      .createCreditPassport(
        polygonData.creditScore,
        polygonData.transactionHistory
      )
      .send({ from: userAddress, gas: 3000000 });
  }
  
  test('Should verify initial credit data on both chains', async () => {
    // Get credit data from Ethereum
    const ethContract = contractInstances.ethereum;
    const ethData = await ethContract.methods
      .getCreditData(userAddress)
      .call();
    
    // Get credit data from Polygon
    const polygonContract = contractInstances.polygon;
    const polygonData = await polygonContract.methods
      .getCreditData(userAddress)
      .call();
    
    // Verify the initial data is different (as expected before sync)
    expect(Number(ethData[0])).toBe(creditScoreEthereum);
    expect(Number(polygonData[0])).toBe(creditScorePolygon);
    expect(Number(ethData[0])).not.toBe(Number(polygonData[0]));
  });
  
  test('Should send credit data from Ethereum to Polygon via CCIP', async () => {
    // Update credit score on Ethereum to a new value
    const newCreditScore = 780;
    const ethContract = contractInstances.ethereum;
    
    // Update the score on Ethereum
    await ethContract.methods
      .updateCreditScore(newCreditScore)
      .send({ from: userAddress, gas: 1000000 });
    
    // Verify the update worked on Ethereum
    const ethData = await ethContract.methods
      .getCreditData(userAddress)
      .call();
    expect(Number(ethData[0])).toBe(newCreditScore);
    
    // Send the data cross-chain from Ethereum to Polygon
    const result = await sendCrossChainCreditData(
      'ethereum',
      'polygon',
      userAddress
    );
    
    // We should get a message ID back
    expect(result.messageId).toBeDefined();
    expect(result.status).toBe('sent');
    
    // Wait for the message to be processed (in a real test, we would wait for event confirmations)
    // For simplicity in this test, we'll simulate the delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if the message was processed on the destination chain
    const polygonContract = contractInstances.polygon;
    const messageProcessed = await polygonContract.methods
      .processedMessages(result.messageId)
      .call();
    
    expect(messageProcessed).toBe(true);
  });
  
  test('Should have consistent credit data after cross-chain sync', async () => {
    // Get credit data from both chains
    const ethContract = contractInstances.ethereum;
    const polygonContract = contractInstances.polygon;
    
    const ethData = await ethContract.methods
      .getCreditData(userAddress)
      .call();
    
    const polygonData = await polygonContract.methods
      .getCreditData(userAddress)
      .call();
    
    // Credit scores should now be the same
    expect(Number(ethData[0])).toBe(Number(polygonData[0]));
    
    // Verify that it matches the updated value from Ethereum
    expect(Number(ethData[0])).toBe(780);
  });
  
  test('Should properly handle cross-chain transaction failures', async () => {
    // Try to send data to an invalid chain
    try {
      await sendCrossChainCreditData(
        'ethereum',
        'invalid-chain',
        userAddress
      );
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      // Should throw an error
      expect(error).toBeDefined();
      expect(error.message).toContain('invalid-chain');
    }
    
    // Try to send with insufficient funds
    try {
      // Mock insufficient funds by using an account with no balance
      const emptyAccount = '0x5678901234567890123456789012345678901234';
      
      await sendCrossChainCreditData(
        'ethereum',
        'polygon',
        emptyAccount
      );
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      // Should throw an error related to insufficient funds
      expect(error).toBeDefined();
      expect(error.message).toMatch(/funds|gas|balance/i);
    }
  });
  
  test('Should correctly apply new transaction history across chains', async () => {
    // Add a new transaction on Polygon
    const polygonContract = contractInstances.polygon;
    const newTransaction = JSON.stringify({
      timestamp: new Date().toISOString(),
      amount: 2500,
      type: 'loan_payment',
      description: 'Monthly loan payment',
      location: 'Online',
    });
    
    await polygonContract.methods
      .addTransaction(newTransaction)
      .send({ from: userAddress, gas: 1000000 });
    
    // Sync from Polygon to Ethereum
    const result = await sendCrossChainCreditData(
      'polygon',
      'ethereum',
      userAddress
    );
    
    expect(result.messageId).toBeDefined();
    expect(result.status).toBe('sent');
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify transaction history on both chains
    const polygonData = await polygonContract.methods
      .getCreditData(userAddress)
      .call();
    
    const ethContract = contractInstances.ethereum;
    const ethData = await ethContract.methods
      .getCreditData(userAddress)
      .call();
    
    // Both should have the new transaction in history
    expect(polygonData[1]).toContain('loan_payment');
    expect(ethData[1]).toContain('loan_payment');
    
    // Transaction counts should match
    expect(polygonData[1].length).toBe(ethData[1].length);
  });
});

