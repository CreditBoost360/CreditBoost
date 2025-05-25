import Web3 from 'web3';
import dotenv from 'dotenv';
import { AbiItem } from 'web3-utils';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { BigNumber } from 'bignumber.js';

// For gas estimation and optimization
import { TransactionConfig } from 'web3-core';

// Typings for Chainlink CCIP
interface CCIPMessage {
  sourceChain: string;
  destinationChain: string;
  receiver: string;
  data: string;
  tokenAmounts: any[];
  feeToken: string;
  extraArgs: string;
}

// Network configuration types
interface NetworkConfig {
  rpcUrl: string;
  chainId: number;
  name: string;
  contractAddress: string;
  ccipRouter?: string;
  isTestnet: boolean;
  blockExplorer: string;
  gasMultiplier: number;
}

// Transaction status tracking
interface TransactionStatus {
  status: 'pending' | 'confirmed' | 'failed';
  hash: string;
  confirmations: number;
  blockNumber?: number;
  error?: string;
}

dotenv.config();

// Maximum retries for failed transactions
const MAX_TRANSACTION_RETRIES = 3;
const RETRY_DELAY_MS = 5000; // 5 seconds

// Gas price optimization strategy
const GAS_PRICE_STRATEGIES = {
  FASTEST: 1.5,    // 50% above average
  FAST: 1.2,       // 20% above average
  AVERAGE: 1.0,    // Average gas price
  ECONOMIC: 0.8    // 20% below average (may take longer)
};

// Network configurations
const NETWORKS: Record<string, NetworkConfig> = {
  ethereum: {
    rpcUrl: process.env.ETHEREUM_NODE_URL || 'https://mainnet.infura.io/v3/your-infura-key',
    chainId: 1,
    name: 'Ethereum Mainnet',
    contractAddress: process.env.ETH_CONTRACT_ADDRESS || '',
    ccipRouter: process.env.ETH_CCIP_ROUTER,
    isTestnet: false,
    blockExplorer: 'https://etherscan.io',
    gasMultiplier: GAS_PRICE_STRATEGIES.FAST
  },
  polygon: {
    rpcUrl: process.env.POLYGON_NODE_URL || 'https://polygon-rpc.com',
    chainId: 137,
    name: 'Polygon Mainnet',
    contractAddress: process.env.POLYGON_CONTRACT_ADDRESS || '',
    ccipRouter: process.env.POLYGON_CCIP_ROUTER,
    isTestnet: false,
    blockExplorer: 'https://polygonscan.com',
    gasMultiplier: GAS_PRICE_STRATEGIES.AVERAGE
  },
  optimism: {
    rpcUrl: process.env.OPTIMISM_NODE_URL || 'https://mainnet.optimism.io',
    chainId: 10,
    name: 'Optimism',
    contractAddress: process.env.OPTIMISM_CONTRACT_ADDRESS || '',
    ccipRouter: process.env.OPTIMISM_CCIP_ROUTER,
    isTestnet: false,
    blockExplorer: 'https://optimistic.etherscan.io',
    gasMultiplier: GAS_PRICE_STRATEGIES.FAST
  },
  arbitrum: {
    rpcUrl: process.env.ARBITRUM_NODE_URL || 'https://arb1.arbitrum.io/rpc',
    chainId: 42161,
    name: 'Arbitrum One',
    contractAddress: process.env.ARBITRUM_CONTRACT_ADDRESS || '',
    ccipRouter: process.env.ARBITRUM_CCIP_ROUTER,
    isTestnet: false,
    blockExplorer: 'https://arbiscan.io',
    gasMultiplier: GAS_PRICE_STRATEGIES.FAST
  },
  // Test networks
  sepolia: {
    rpcUrl: process.env.SEPOLIA_NODE_URL || 'https://sepolia.infura.io/v3/your-infura-key',
    chainId: 11155111,
    name: 'Sepolia Testnet',
    contractAddress: process.env.SEPOLIA_CONTRACT_ADDRESS || '',
    ccipRouter: process.env.SEPOLIA_CCIP_ROUTER,
    isTestnet: true,
    blockExplorer: 'https://sepolia.etherscan.io',
    gasMultiplier: GAS_PRICE_STRATEGIES.FASTEST
  },
  mumbai: {
    rpcUrl: process.env.MUMBAI_NODE_URL || 'https://rpc-mumbai.maticvigil.com',
    chainId: 80001,
    name: 'Mumbai Testnet',
    contractAddress: process.env.MUMBAI_CONTRACT_ADDRESS || '',
    ccipRouter: process.env.MUMBAI_CCIP_ROUTER,
    isTestnet: true,
    blockExplorer: 'https://mumbai.polygonscan.com',
    gasMultiplier: GAS_PRICE_STRATEGIES.FASTEST
  }
};

// Default network from environment or fallback to Polygon (production default)
const DEFAULT_NETWORK = process.env.DEFAULT_NETWORK || 'polygon';

// Initialize web3 instances for different networks
const web3Instances: Record<string, Web3> = {};
const contractInstances: Record<string, any> = {};

// Load contract ABIs
const contractPath = path.join(__dirname, '../contracts/CreditPassport.json');
const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const contractAbi = contractJson.abi as AbiItem[];

// Load Chainlink CCIP Router ABI
const ccipRouterPath = path.join(__dirname, '../contracts/CCIPRouter.json');
let ccipRouterAbi: AbiItem[] = [];
try {
  const ccipRouterJson = JSON.parse(fs.readFileSync(ccipRouterPath, 'utf8'));
  ccipRouterAbi = ccipRouterJson.abi as AbiItem[];
} catch (error) {
  console.warn('CCIP Router ABI not found, cross-chain functionality may be limited');
  ccipRouterAbi = [] as AbiItem[];
}

// Initialize Web3 and contract instances for each configured network
Object.keys(NETWORKS).forEach(networkKey => {
  const network = NETWORKS[networkKey];
  if (network.rpcUrl && network.contractAddress) {
    try {
      // Create Web3 instance for this network
      web3Instances[networkKey] = new Web3(network.rpcUrl);
      
      // Create contract instance
      contractInstances[networkKey] = new web3Instances[networkKey].eth.Contract(
        contractAbi,
        network.contractAddress
      );
      
      console.log(`Initialized ${network.name} connection`);
    } catch (error) {
      console.error(`Failed to initialize ${network.name}:`, error);
    }
  }
});

// Account setup for transactions
let accounts: Record<string, any> = {};

// Set up accounts for each network if private keys are provided
if (process.env.PRIVATE_KEY) {
  Object.keys(web3Instances).forEach(networkKey => {
    try {
      const account = web3Instances[networkKey].eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY!);
      web3Instances[networkKey].eth.accounts.wallet.add(account);
      accounts[networkKey] = account;
      console.log(`Account set up for ${NETWORKS[networkKey].name}`);
    } catch (error) {
      console.error(`Failed to set up account for ${NETWORKS[networkKey].name}:`, error);
    }
  });
}

// Helper to get Web3 instance for a specific network
const getWeb3 = (network: string = DEFAULT_NETWORK): Web3 => {
  if (!web3Instances[network]) {
    throw new Error(`Network ${network} not initialized`);
  }
  return web3Instances[network];
};

// Helper to get contract instance for a specific network
const getContract = (network: string = DEFAULT_NETWORK) => {
  if (!contractInstances[network]) {
    throw new Error(`Contract for network ${network} not initialized`);
  }
  return contractInstances[network];
};

/**
 * Gets optimal gas price for a network with fallbacks and retry logic
 * @param network Network to get gas price for
 * @returns Gas price in wei
 */
const getOptimalGasPrice = async (network: string = DEFAULT_NETWORK): Promise<string> => {
  try {
    const web3 = getWeb3(network);
    const networkConfig = NETWORKS[network];
    
    // Get current gas price
    const gasPrice = await web3.eth.getGasPrice();
    
    // Apply network-specific multiplier for optimization
    const optimizedGasPrice = new BigNumber(gasPrice)
      .multipliedBy(networkConfig.gasMultiplier)
      .integerValue()
      .toString();
    
    return optimizedGasPrice;
  } catch (error) {
    console.error(`Error getting gas price for ${network}:`, error);
    // Fallback to reasonable default if we can't get current gas price
    return web3Instances[network].utils.toWei('50', 'gwei');
  }
};

/**
 * Monitors a transaction until it's confirmed or fails
 * @param txHash Transaction hash to monitor
 * @param network Network where transaction was submitted
 * @param confirmations Number of confirmations to wait for (default: 1)
 * @returns Transaction status object
 */
const monitorTransaction = async (
  txHash: string,
  network: string = DEFAULT_NETWORK,
  confirmations: number = 1
): Promise<TransactionStatus> => {
  const web3 = getWeb3(network);
  
  return new Promise((resolve, reject) => {
    const checkTransaction = async () => {
      try {
        const receipt = await web3.eth.getTransactionReceipt(txHash);
        
        if (!receipt) {
          // Transaction still pending
          setTimeout(checkTransaction, 5000); // Check again in 5 seconds
          return;
        }
        
        const currentBlock = await web3.eth.getBlockNumber();
        const confirmationBlocks = currentBlock - receipt.blockNumber;
        
        if (receipt.status) {
          // Transaction successful
          if (confirmationBlocks >= confirmations) {
            resolve({
              status: 'confirmed',
              hash: txHash,
              confirmations: confirmationBlocks,
              blockNumber: receipt.blockNumber
            });
          } else {
            // Waiting for more confirmations
            setTimeout(checkTransaction, 5000);
          }
        } else {
          // Transaction failed
          resolve({
            status: 'failed',
            hash: txHash,
            confirmations: confirmationBlocks,
            blockNumber: receipt.blockNumber,
            error: 'Transaction reverted on blockchain'
          });
        }
      } catch (error) {
        console.error(`Error monitoring transaction ${txHash}:`, error);
        setTimeout(checkTransaction, 10000); // Longer retry on error
      }
    };
    
    checkTransaction();
  });
};

/**
 * Sends a transaction with retry mechanism
 * @param txObject Transaction object to send
 * @param network Network to send transaction on
 * @param retries Number of retries remaining
 * @returns Transaction hash
 */
const sendTransactionWithRetry = async (
  txObject: any,
  network: string = DEFAULT_NETWORK,
  retries: number = MAX_TRANSACTION_RETRIES
): Promise<string> => {
  const web3 = getWeb3(network);
  const account = accounts[network];
  
  if (!account) {
    throw new Error(`No account configured for network ${network}`);
  }
  
  try {
    // Estimate gas with a buffer for safety
    const estimatedGas = await txObject.estimateGas({ from: account.address });
    const gasLimit = Math.floor(estimatedGas * 1.2); // Add 20% buffer
    
    // Get optimal gas price
    const gasPrice = await getOptimalGasPrice(network);
    
    // Send transaction
    const tx = await txObject.send({
      from: account.address,
      gas: gasLimit,
      gasPrice
    });
    
    return tx.transactionHash;
  } catch (error) {
    console.error(`Transaction failed on ${network} (${MAX_TRANSACTION_RETRIES - retries + 1}/${MAX_TRANSACTION_RETRIES}):`, error);
    
    if (retries <= 0) {
      throw new Error(`Failed to send transaction after maximum retries: ${error.message}`);
    }
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    
    // Retry with a different gas price strategy
    return sendTransactionWithRetry(txObject, network, retries - 1);
  }
};

    } catch (error) {
        console.error('Error creating credit passport:', error);
        throw error;
    }
};

export const updateCreditScore = async (
    userAddress: string,
    newCreditScore: number
): Promise<string> => {
    try {
        if (!account) {
            throw new Error('Private key not configured');
        }

        const tx = await creditPassportContract.methods
            .updateCreditScore(newCreditScore)
            .send({ from: account.address, gas: 1000000 });
        
        return tx.transactionHash;
    } catch (error) {
        console.error('Error updating credit score:', error);
        throw error;
    }
};

export const getCreditData = async (userAddress: string): Promise<{creditScore: number, transactionHistory: string[]}> => {
    try {
        const result = await creditPassportContract.methods
            .getCreditData(userAddress)
            .call();
        
        return {
            creditScore: Number(result[0]),
            transactionHistory: result[1]
        };
    } catch (error) {
        console.error('Error getting credit data:', error);
        throw error;
    }
};