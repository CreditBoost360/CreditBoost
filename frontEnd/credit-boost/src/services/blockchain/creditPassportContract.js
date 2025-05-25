import web3Service from './web3Service';
import Contract from '@truffle/contract';

// ABI for the CreditPassport smart contract
const CreditPassportABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "score",
        "type": "uint256"
      }
    ],
    "name": "CreditScoreUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "verifier",
        "type": "address"
      }
    ],
    "name": "PassportVerified",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "createPassport",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getCreditScore",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getPassportData",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "score",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastUpdated",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "verificationCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "hasPassport",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "score",
        "type": "uint256"
      }
    ],
    "name": "updateCreditScore",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "verifyPassport",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Mock contract address - in a real app, this would be the deployed contract address
const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';

class CreditPassportContract {
  constructor() {
    this.contract = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return true;

    try {
      // Initialize web3 service
      await web3Service.initialize();
      const web3 = web3Service.getWeb3();
      
      if (!web3) {
        console.error('Web3 not initialized');
        return false;
      }

      // Create contract instance
      const CreditPassport = Contract({ abi: CreditPassportABI });
      CreditPassport.setProvider(web3.currentProvider);

      // For development/demo purposes, we'll use a mock approach
      // In production, you would use CreditPassport.at(CONTRACT_ADDRESS)
      this.contract = {
        // Mock implementation of contract methods
        createPassport: async (userAddress) => {
          console.log(`Creating passport for ${userAddress}`);
          // Simulate blockchain delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          return { tx: `0x${Math.random().toString(16).substring(2, 66)}` };
        },
        
        hasPassport: async (userAddress) => {
          console.log(`Checking if ${userAddress} has passport`);
          // For demo, return true if address starts with 0x7
          return userAddress.startsWith('0x7');
        },
        
        getCreditScore: async (userAddress) => {
          console.log(`Getting credit score for ${userAddress}`);
          // Generate a deterministic but random-looking score based on address
          const hash = web3.utils.sha3(userAddress);
          const score = parseInt(hash.substring(2, 5), 16) % 300 + 550; // Score between 550-850
          return score;
        },
        
        getPassportData: async (userAddress) => {
          console.log(`Getting passport data for ${userAddress}`);
          const hash = web3.utils.sha3(userAddress);
          const score = parseInt(hash.substring(2, 5), 16) % 300 + 550;
          return {
            score: score,
            lastUpdated: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 2592000), // Random time in last 30 days
            verificationCount: parseInt(hash.substring(5, 7), 16) % 10 // 0-9 verifications
          };
        },
        
        updateCreditScore: async (userAddress, score) => {
          console.log(`Updating credit score for ${userAddress} to ${score}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return { tx: `0x${Math.random().toString(16).substring(2, 66)}` };
        },
        
        verifyPassport: async (userAddress) => {
          console.log(`Verifying passport for ${userAddress}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return { tx: `0x${Math.random().toString(16).substring(2, 66)}` };
        }
      };

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing credit passport contract:', error);
      return false;
    }
  }

  // Create a new credit passport
  async createPassport() {
    if (!this.initialized) await this.initialize();
    
    const account = await web3Service.getCurrentAccount();
    return this.contract.createPassport(account);
  }

  // Check if user has a passport
  async hasPassport() {
    if (!this.initialized) await this.initialize();
    
    const account = await web3Service.getCurrentAccount();
    return this.contract.hasPassport(account);
  }

  // Get user's credit score
  async getCreditScore() {
    if (!this.initialized) await this.initialize();
    
    const account = await web3Service.getCurrentAccount();
    return this.contract.getCreditScore(account);
  }

  // Get full passport data
  async getPassportData() {
    if (!this.initialized) await this.initialize();
    
    const account = await web3Service.getCurrentAccount();
    return this.contract.getPassportData(account);
  }

  // Update credit score
  async updateCreditScore(score) {
    if (!this.initialized) await this.initialize();
    
    const account = await web3Service.getCurrentAccount();
    return this.contract.updateCreditScore(account, score);
  }

  // Verify passport (as an institution)
  async verifyPassport(userAddress) {
    if (!this.initialized) await this.initialize();
    
    return this.contract.verifyPassport(userAddress);
  }
}

// Create a singleton instance
const creditPassportContract = new CreditPassportContract();
export default creditPassportContract;