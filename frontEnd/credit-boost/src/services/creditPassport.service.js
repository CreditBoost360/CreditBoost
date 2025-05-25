import apiConfig from "@/config/api.config";
import { loadBlockchainIntegration } from './blockchain/safeImport';

let blockchainIntegration = null;

// Load blockchain integration safely
loadBlockchainIntegration().then(integration => {
  blockchainIntegration = integration;
});

export const creditPassportService = {
  // Get user's credit passport
  getCreditPassport: async (userAddress) => {
    try {
      // Ensure blockchain integration is loaded
      if (!blockchainIntegration) {
        blockchainIntegration = await loadBlockchainIntegration();
      }
      
      // Try to get passport from blockchain first
      const blockchainPassport = await blockchainIntegration.getCreditPassport();
      
      if (blockchainPassport.exists) {
        return {
          userAddress: blockchainPassport.walletAddress,
          creditScore: blockchainPassport.creditScore,
          transactionHistory: [
            "Loan payment - $500",
            "Credit card payment - $200",
            "Mortgage payment - $1200"
          ],
          createdAt: new Date().toISOString(),
          updatedAt: blockchainPassport.lastUpdated,
          blockchainVerified: true
        };
      }
      
      // Fallback to mock data if blockchain passport doesn't exist
      return {
        userAddress,
        creditScore: 780,
        transactionHistory: [
          "Loan payment - $500",
          "Credit card payment - $200",
          "Mortgage payment - $1200"
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        blockchainVerified: false
      };
    } catch (error) {
      console.error("Error fetching credit passport:", error);
      throw new Error("Failed to fetch credit passport");
    }
  },

  // Create a new credit passport
  createCreditPassport: async (creditData) => {
    try {
      // Ensure blockchain integration is loaded
      if (!blockchainIntegration) {
        blockchainIntegration = await loadBlockchainIntegration();
      }
      
      // Try to create passport on blockchain first
      const blockchainResult = await blockchainIntegration.createCreditPassport(creditData);
      
      if (blockchainResult.blockchainVerified) {
        return {
          success: true,
          blockchainVerified: true,
          transactionHash: blockchainResult.transactionHash,
          userAddress: creditData.userAddress,
          creditScore: blockchainResult.passportData?.score || creditData.creditScore
        };
      }
      
      // Fallback to mock success response
      return {
        success: true,
        blockchainVerified: false,
        transactionHash: "0x" + Math.random().toString(16).substring(2, 34),
        userAddress: creditData.userAddress,
        creditScore: creditData.creditScore
      };
    } catch (error) {
      console.error("Error creating credit passport:", error);
      throw new Error("Failed to create credit passport");
    }
  },

  // Update credit score
  updateCreditScore: async (userAddress, newCreditScore) => {
    try {
      // Ensure blockchain integration is loaded
      if (!blockchainIntegration) {
        blockchainIntegration = await loadBlockchainIntegration();
      }
      
      // Try to update score on blockchain first
      const blockchainResult = await blockchainIntegration.updateCreditScore(newCreditScore);
      
      if (blockchainResult.success) {
        return {
          success: true,
          blockchainVerified: true,
          transactionHash: blockchainResult.transactionHash,
          userAddress,
          newCreditScore
        };
      }
      
      // Fallback to mock success response
      return {
        success: true,
        blockchainVerified: false,
        transactionHash: "0x" + Math.random().toString(16).substring(2, 34),
        userAddress,
        newCreditScore
      };
    } catch (error) {
      console.error("Error updating credit score:", error);
      throw new Error("Failed to update credit score");
    }
  },

  // Upload KYC documents
  uploadKYCDocuments: async (userAddress, files) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return mock success response with fake IPFS hashes
      return {
        success: true,
        documentHashes: Array.from({ length: files.length }, () => 
          "Qm" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        ),
        userAddress
      };
    } catch (error) {
      console.error("Error uploading KYC documents:", error);
      throw new Error("Failed to upload KYC documents");
    }
  },

  // Upload passport photo
  uploadPassportPhoto: async (userAddress, photoFile) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // In a real app, you would upload the file to your server/IPFS here
      // and get back a URL to the uploaded image
      
      // Return mock success response with fake URL
      return {
        success: true,
        photoUrl: URL.createObjectURL(photoFile),
        userAddress
      };
    } catch (error) {
      console.error("Error uploading passport photo:", error);
      throw new Error("Failed to upload passport photo");
    }
  },

  // Check for fraudulent activity
  checkFraud: async (creditData) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Return mock fraud check result (always non-fraudulent for demo)
      return {
        isFraudulent: false,
        riskLevel: "Low",
        confidenceScore: 0.92
      };
    } catch (error) {
      console.error("Error checking for fraud:", error);
      throw new Error("Failed to check for fraud");
    }
  },

  // Generate a shareable link for the credit passport
  generateShareableLink: async (userAddress, expiryTime) => {
    try {
      // Ensure blockchain integration is loaded
      if (!blockchainIntegration) {
        blockchainIntegration = await loadBlockchainIntegration();
      }
      
      // Try to generate link with blockchain verification first
      const blockchainResult = await blockchainIntegration.generateShareableLink(expiryTime);
      
      if (blockchainResult.success) {
        return {
          success: true,
          blockchainVerified: blockchainResult.blockchainVerified,
          shareLink: blockchainResult.shareLink,
          expiryTime: blockchainResult.expiryTime,
          userAddress
        };
      }
      
      // Fallback to traditional approach
      const shareToken = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
      
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + (expiryTime * 60)); // Convert hours to minutes
      
      return {
        success: true,
        blockchainVerified: false,
        shareLink: `https://credvault.co.ke/passport/share/${shareToken}`,
        expiryTime: expiryDate.toISOString(),
        userAddress
      };
    } catch (error) {
      console.error("Error generating shareable link:", error);
      throw new Error("Failed to generate shareable link");
    }
  },

  // Verify a credit passport using a shared link
  verifySharedPassport: async (shareToken) => {
    try {
      // Ensure blockchain integration is loaded
      if (!blockchainIntegration) {
        blockchainIntegration = await loadBlockchainIntegration();
      }
      
      // Try to verify with blockchain first
      const blockchainResult = await blockchainIntegration.verifySharedPassport(shareToken);
      
      if (blockchainResult.valid) {
        return {
          userAddress: blockchainResult.walletAddress,
          creditScore: blockchainResult.creditScore,
          verificationDate: new Date().toISOString(),
          isValid: true,
          blockchainVerified: true
        };
      }
      
      // Fallback to mock passport data
      return {
        userAddress: "0x" + Math.random().toString(16).substring(2, 42),
        creditScore: 750 + Math.floor(Math.random() * 100),
        verificationDate: new Date().toISOString(),
        isValid: true,
        blockchainVerified: false
      };
    } catch (error) {
      console.error("Error verifying shared passport:", error);
      throw new Error("Failed to verify credit passport");
    }
  },
};