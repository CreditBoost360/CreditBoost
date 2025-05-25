import creditPassportContract from './creditPassportContract';
import web3Service from './web3Service';

class BlockchainIntegration {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return true;
    
    try {
      // Initialize web3 and contract
      await web3Service.initialize();
      await creditPassportContract.initialize();
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing blockchain integration:', error);
      return false;
    }
  }

  // Create a blockchain-backed credit passport
  async createCreditPassport(userData) {
    if (!this.initialized) await this.initialize();
    
    try {
      // First check if user already has a passport
      const hasPassport = await creditPassportContract.hasPassport();
      let result;
      
      if (!hasPassport) {
        // Create passport on blockchain
        result = await creditPassportContract.createPassport();
        console.log('Passport created on blockchain:', result);
        
        // Update initial credit score (default or calculated)
        const initialScore = userData.creditScore || 750;
        await creditPassportContract.updateCreditScore(initialScore);
      }
      
      // Get passport data from blockchain
      const passportData = await creditPassportContract.getPassportData();
      
      return {
        success: true,
        blockchainVerified: true,
        transactionHash: result?.tx,
        passportData
      };
    } catch (error) {
      console.error('Error creating blockchain passport:', error);
      
      // Fallback to traditional approach if blockchain fails
      return {
        success: true,
        blockchainVerified: false,
        error: error.message
      };
    }
  }

  // Get credit passport data from blockchain
  async getCreditPassport() {
    if (!this.initialized) await this.initialize();
    
    try {
      // Check if user has a passport
      const hasPassport = await creditPassportContract.hasPassport();
      
      if (!hasPassport) {
        return {
          exists: false,
          message: 'No passport found on blockchain'
        };
      }
      
      // Get passport data
      const passportData = await creditPassportContract.getPassportData();
      const account = await web3Service.getCurrentAccount();
      
      return {
        exists: true,
        blockchainVerified: true,
        walletAddress: account,
        creditScore: passportData.score,
        lastUpdated: new Date(passportData.lastUpdated * 1000).toISOString(),
        verificationCount: passportData.verificationCount
      };
    } catch (error) {
      console.error('Error getting blockchain passport:', error);
      
      // Return error info
      return {
        exists: false,
        blockchainVerified: false,
        error: error.message
      };
    }
  }

  // Update credit score on blockchain
  async updateCreditScore(score) {
    if (!this.initialized) await this.initialize();
    
    try {
      const result = await creditPassportContract.updateCreditScore(score);
      
      return {
        success: true,
        blockchainVerified: true,
        transactionHash: result.tx
      };
    } catch (error) {
      console.error('Error updating credit score on blockchain:', error);
      
      return {
        success: false,
        blockchainVerified: false,
        error: error.message
      };
    }
  }

  // Generate a shareable link with blockchain verification
  async generateShareableLink(expiryTime) {
    if (!this.initialized) await this.initialize();
    
    try {
      const account = await web3Service.getCurrentAccount();
      
      // Create a message with expiry time
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + (expiryTime * 60)); // Convert hours to minutes
      
      const message = JSON.stringify({
        action: 'share_credit_passport',
        walletAddress: account,
        expiry: expiryDate.toISOString()
      });
      
      // Sign the message
      const { signature } = await web3Service.signMessage(message);
      
      // Create a shareable token
      const token = btoa(JSON.stringify({
        message,
        signature,
        account
      }));
      
      // Generate the shareable link
      const shareLink = `${window.location.origin}/verify-passport?token=${token}`;
      
      return {
        success: true,
        blockchainVerified: true,
        shareLink,
        expiryTime: expiryDate.toISOString()
      };
    } catch (error) {
      console.error('Error generating blockchain shareable link:', error);
      
      // Fallback to traditional approach
      const shareToken = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
      
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + (expiryTime * 60)); // Convert hours to minutes
      
      return {
        success: true,
        blockchainVerified: false,
        shareLink: `${window.location.origin}/verify-passport?token=${shareToken}`,
        expiryTime: expiryDate.toISOString()
      };
    }
  }

  // Verify a shared passport
  async verifySharedPassport(token) {
    if (!this.initialized) await this.initialize();
    
    try {
      // Decode the token
      const decodedData = JSON.parse(atob(token));
      const { message, signature, account } = decodedData;
      
      // Parse the message
      const messageData = JSON.parse(message);
      
      // Check if expired
      const expiryDate = new Date(messageData.expiry);
      if (expiryDate < new Date()) {
        return {
          valid: false,
          error: 'Link has expired'
        };
      }
      
      // Verify the signature
      const isValid = await web3Service.verifySignature(
        message,
        signature,
        account
      );
      
      if (!isValid) {
        return {
          valid: false,
          error: 'Invalid signature'
        };
      }
      
      // Get passport data for the account
      const passportData = await creditPassportContract.getPassportData(account);
      
      return {
        valid: true,
        blockchainVerified: true,
        walletAddress: account,
        creditScore: passportData.score,
        lastUpdated: new Date(passportData.lastUpdated * 1000).toISOString(),
        verificationCount: passportData.verificationCount
      };
    } catch (error) {
      console.error('Error verifying shared passport:', error);
      
      return {
        valid: false,
        blockchainVerified: false,
        error: error.message
      };
    }
  }
}

// Create a singleton instance
const blockchainIntegration = new BlockchainIntegration();
export default blockchainIntegration;