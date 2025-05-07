/**
 * Credit Data interface
 */
export interface CreditData {
  userAddress: string;
  creditScore: number;
  transactionHistory: Transaction[];
  lastUpdated: Date;
}

/**
 * Transaction interface
 */
export interface Transaction {
  id: string;
  amount: number;
  date: Date;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
}

/**
 * Transaction type enum
 */
export enum TransactionType {
  PAYMENT = 'PAYMENT',
  LOAN = 'LOAN',
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  TRANSFER = 'TRANSFER'
}

/**
 * Transaction status enum
 */
export enum TransactionStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

/**
 * KYC Document interface
 */
export interface KYCDocument {
  id: string;
  type: DocumentType;
  ipfsHash: string;
  verified: boolean;
  uploadDate: Date;
}

/**
 * Document type enum
 */
export enum DocumentType {
  ID_CARD = 'ID_CARD',
  PASSPORT = 'PASSPORT',
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
  UTILITY_BILL = 'UTILITY_BILL',
  BANK_STATEMENT = 'BANK_STATEMENT'
}

/**
 * Credit Passport interface
 */
export interface CreditPassport {
  userAddress: string;
  creditScore: number;
  transactionHistory: Transaction[];
  kycDocuments: KYCDocument[];
  created: Date;
  lastUpdated: Date;
  verified: boolean;
}

/**
 * Fraud Check Result interface
 */
export interface FraudCheckResult {
  isFraudulent: boolean;
  riskLevel: 'Low' | 'Medium' | 'High';
  reasons?: string[];
  confidenceScore?: number;
}