// Import Web3 dynamically to avoid process reference errors
let Web3;

// Polyfill for process
if (typeof window !== 'undefined') {
  window.process = window.process || { env: {} };
}

// Function to load Web3 dynamically
const loadWeb3 = async () => {
  if (!Web3) {
    try {
      const module = await import('web3');
      Web3 = module.default || module.Web3;
    } catch (error) {
      console.error('Failed to load Web3:', error);
      throw error;
    }
  }
  return Web3;
};

class Web3Service {
  constructor() {
    this.web3 = null;
    this.accounts = [];
    this.networkId = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return true;

    try {
      // Load Web3 dynamically
      await loadWeb3();
      
      // Modern dapp browsers
      if (window.ethereum) {
        this.web3 = new Web3(window.ethereum);
        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
          console.error("User denied account access");
          return false;
        }
      }
      // Legacy dapp browsers
      else if (window.web3) {
        this.web3 = new Web3(window.web3.currentProvider);
      }
      // Fallback to local provider (for development)
      else {
        console.log('No web3 instance detected, falling back to local provider');
        const provider = new Web3.providers.HttpProvider('http://localhost:8545');
        this.web3 = new Web3(provider);
      }

      // Get accounts
      this.accounts = await this.web3.eth.getAccounts();
      
      // Get network ID
      this.networkId = await this.web3.eth.net.getId();
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing web3:', error);
      return false;
    }
  }

  // Get the current account
  async getCurrentAccount() {
    if (!this.initialized) await this.initialize();
    
    if (this.accounts.length === 0) {
      this.accounts = await this.web3.eth.getAccounts();
    }
    
    return this.accounts[0];
  }

  // Check if Web3 is initialized
  isInitialized() {
    return this.initialized;
  }

  // Get Web3 instance
  getWeb3() {
    return this.web3;
  }

  // Get network ID
  getNetworkId() {
    return this.networkId;
  }

  // Sign a message with the current account
  async signMessage(message) {
    if (!this.initialized) await this.initialize();
    
    const account = await this.getCurrentAccount();
    if (!account) throw new Error('No account available for signing');
    
    const signature = await this.web3.eth.personal.sign(
      this.web3.utils.utf8ToHex(message),
      account,
      '' // Password (empty for MetaMask)
    );
    
    return {
      message,
      signature,
      account
    };
  }

  // Verify a signature
  async verifySignature(message, signature, address) {
    if (!this.initialized) await this.initialize();
    
    try {
      const signingAddress = await this.web3.eth.personal.ecRecover(
        this.web3.utils.utf8ToHex(message),
        signature
      );
      
      return signingAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }
}

// Create a singleton instance
const web3Service = new Web3Service();
export default web3Service;