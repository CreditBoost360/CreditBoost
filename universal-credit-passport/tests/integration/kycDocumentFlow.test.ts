/**
 * Integration tests for the complete KYC document flow
 * Tests document upload, verification, and access
 */

import {
  setupTestEnvironment,
  teardownTestEnvironment,
  TEST_ACCOUNTS,
  mockKycDocuments,
  readMockFile,
  contractInstances,
  web3Instances,
  ipfsClient,
} from './setup';

import { uploadKYCDocument } from '../../src/services/ipfs/storage';
import { KycDocumentType } from '../../src/services/ipfs/storage';

describe('KYC Document Flow Integration Tests', () => {
  // Global test variables
  let passportCid: string;
  let kycMetadata: any;
  let userAddress: string;
  
  // Setup before running tests
  beforeAll(async () => {
    await setupTestEnvironment();
    userAddress = TEST_ACCOUNTS.user.address;
  });
  
  // Cleanup after tests complete
  afterAll(async () => {
    await teardownTestEnvironment();
  });
  
  test('Should upload a KYC passport document to IPFS', async () => {
    // Read mock passport file
    const passportFile = readMockFile(mockKycDocuments.passport.path);
    
    // Upload to IPFS
    const result = await uploadKYCDocument(
      passportFile,
      'passport.pdf',
      KycDocumentType.PASSPORT,
      userAddress
    );
    
    // Store CID and metadata for subsequent tests
    passportCid = result.cid;
    kycMetadata = result.metadata;
    
    // Assertions
    expect(passportCid).toBeDefined();
    expect(passportCid).toMatch(/^[a-zA-Z0-9]+$/); // CID format validation
    expect(kycMetadata).toBeDefined();
    expect(kycMetadata.kycType).toBe(KycDocumentType.PASSPORT);
    expect(kycMetadata.isEncrypted).toBe(true);
    expect(kycMetadata.userId).toBe(userAddress);
  }, 30000); // Allow longer timeout for IPFS operations
  
  test('Should store KYC document hash on blockchain', async () => {
    // Get contract instance (using Polygon for this test)
    const contract = contractInstances.polygon;
    const web3 = web3Instances.polygon;
    
    // Prepare transaction
    const updateKYCTx = contract.methods.updateKYCDocuments(passportCid);
    
    // Send transaction from user account
    const gas = await updateKYCTx.estimateGas({ from: userAddress });
    const result = await updateKYCTx.send({
      from: userAddress,
      gas: Math.floor(gas * 1.2), // Add 20% gas buffer
    });
    
    // Assertions
    expect(result.status).toBe(true);
    
    // Verify the KYC document hash was stored correctly
    const userData = await contract.methods.getFullCreditData(userAddress).call({ from: userAddress });
    expect(userData).toBeDefined();
    expect(userData[2]).toBe(passportCid); // kycIpfsHash is the 3rd item in the returned array
  });
  
  test('Should allow credit bureau to verify KYC document', async () => {
    // Get contract instance
    const contract = contractInstances.polygon;
    const creditBureauAddress = TEST_ACCOUNTS.creditBureau.address;
    
    // First, grant credit bureau role - this would normally be done by admin
    const adminAddress = TEST_ACCOUNTS.owner.address;
    const CREDIT_BUREAU_ROLE = web3Instances.polygon.utils.soliditySha3('CREDIT_BUREAU_ROLE');
    
    // Grant role first
    await contract.methods.grantRole(CREDIT_BUREAU_ROLE, creditBureauAddress)
      .send({ from: adminAddress });
    
    // Now verify the KYC document
    const verifyKYCTx = contract.methods.verifyKYC(userAddress, true);
    const gas = await verifyKYCTx.estimateGas({ from: creditBureauAddress });
    const result = await verifyKYCTx.send({
      from: creditBureauAddress,
      gas: Math.floor(gas * 1.2),
    });
    
    // Assertions
    expect(result.status).toBe(true);
    
    // Verify the KYC verification status
    const userData = await contract.methods.getFullCreditData(userAddress).call({ from: creditBureauAddress });
    expect(userData).toBeDefined();
    expect(userData[3]).toBe(true); // kycVerified is the 4th item
  });
  
  test('Should grant temporary access to a financial institution', async () => {
    // Get contract instance
    const contract = contractInstances.polygon;
    const institutionAddress = TEST_ACCOUNTS.institution.address;
    
    // Grant institution role first - this would normally be done by admin
    const adminAddress = TEST_ACCOUNTS.owner.address;
    const FINANCIAL_INSTITUTION_ROLE = web3Instances.polygon.utils.soliditySha3('FINANCIAL_INSTITUTION_ROLE');
    
    await contract.methods.grantRole(FINANCIAL_INSTITUTION_ROLE, institutionAddress)
      .send({ from: adminAddress });
    

