/**
 * Example: Process a payment with Sunny Payment Gateway
 */

import SunnyPaymentGateway from '../SunnyPaymentGateway.js';
import { PAYMENT_METHODS } from '../constants.js';
import { fileURLToPath } from 'url';

// Load environment variables (in a real app, use dotenv)
process.env.SUNNY_MERCHANT_ID = 'test-merchant-id';
process.env.SUNNY_API_KEY = 'test-api-key';
process.env.SUNNY_API_SECRET = 'test-api-secret';
process.env.SUNNY_ENVIRONMENT = 'sandbox';
process.env.SUNNY_ENCRYPTION_KEY = 'test-encryption-key';

// Initialize payment gateway
const paymentGateway = new SunnyPaymentGateway();

// Example function to process a card payment
async function processCardPayment() {
  try {
    const paymentData = {
      amount: 99.99,
      currency: 'USD',
      paymentMethod: PAYMENT_METHODS.CARD,
      card: {
        number: '4111111111111111', // Test card number
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123',
        holderName: 'John Doe'
      },
      customer: {
        email: 'john.doe@example.com',
        phone: '+1234567890',
        address: {
          country: 'US',
          state: 'CA',
          city: 'San Francisco',
          line1: '123 Main St',
          postalCode: '94105'
        }
      },
      metadata: {
        orderId: 'ORD-12345',
        productName: 'Premium Subscription'
      }
    };

    console.log('Processing card payment...');
    const result = await paymentGateway.processPayment(paymentData);
    
    console.log('Payment result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
}

// Example function to process a bank transfer
async function processBankTransfer() {
  try {
    const paymentData = {
      amount: 500.00,
      currency: 'USD',
      paymentMethod: PAYMENT_METHODS.BANK_TRANSFER,
      bankAccount: {
        accountNumber: '1234567890',
        routingNumber: '123456789',
        accountHolderName: 'John Doe',
        bankName: 'Example Bank'
      },
      customer: {
        email: 'john.doe@example.com',
        phone: '+1234567890'
      },
      metadata: {
        orderId: 'ORD-67890',
        productName: 'Business Plan'
      }
    };

    console.log('Processing bank transfer...');
    const result = await paymentGateway.processPayment(paymentData);
    
    console.log('Payment result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
}

// Example function to process a mobile money payment
async function processMobileMoneyPayment() {
  try {
    const paymentData = {
      amount: 50.00,
      currency: 'KES',
      paymentMethod: PAYMENT_METHODS.MOBILE_MONEY,
      mobileMoney: {
        phoneNumber: '+254712345678',
        provider: 'MPESA',
        accountHolderName: 'John Doe'
      },
      customer: {
        email: 'john.doe@example.com',
        phone: '+254712345678'
      },
      metadata: {
        orderId: 'ORD-54321',
        productName: 'Basic Plan'
      }
    };

    console.log('Processing mobile money payment...');
    const result = await paymentGateway.processPayment(paymentData);
    
    console.log('Payment result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
}

// Example function to process a cryptocurrency payment
async function processCryptoPayment() {
  try {
    const paymentData = {
      amount: 0.005,
      currency: 'BTC',
      paymentMethod: PAYMENT_METHODS.CRYPTO,
      crypto: {
        currency: 'BTC',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
      },
      customer: {
        email: 'john.doe@example.com'
      },
      metadata: {
        orderId: 'ORD-78901',
        productName: 'Lifetime Membership'
      }
    };

    console.log('Processing cryptocurrency payment...');
    const result = await paymentGateway.processPayment(paymentData);
    
    console.log('Payment result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
}

// Run examples
async function runExamples() {
  try {
    console.log('=== CARD PAYMENT EXAMPLE ===');
    await processCardPayment();
    
    console.log('\n=== BANK TRANSFER EXAMPLE ===');
    await processBankTransfer();
    
    console.log('\n=== MOBILE MONEY EXAMPLE ===');
    await processMobileMoneyPayment();
    
    console.log('\n=== CRYPTOCURRENCY EXAMPLE ===');
    await processCryptoPayment();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run the examples if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runExamples();
}

export {
  processCardPayment,
  processBankTransfer,
  processMobileMoneyPayment,
  processCryptoPayment
};