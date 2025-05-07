import Web3 from 'web3';
import dotenv from 'dotenv';
import { AbiItem } from 'web3-utils';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Initialize Web3 with the Ethereum node URL from environment variables
const web3 = new Web3(process.env.ETHEREUM_NODE_URL || 'http://localhost:8545');

// Load contract ABI
const contractPath = path.join(__dirname, '../contracts/CreditPassport.json');
const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const contractAbi = contractJson.abi as AbiItem[];

// Contract instance
const contractAddress = process.env.CONTRACT_ADDRESS;
const creditPassportContract = new web3.eth.Contract(contractAbi, contractAddress);

// Account setup for transactions
const account = process.env.PRIVATE_KEY 
    ? web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY)
    : null;

if (account) {
    web3.eth.accounts.wallet.add(account);
}

export const createCreditPassport = async (
    userAddress: string, 
    creditScore: number, 
    transactionHistory: string[]
): Promise<string> => {
    try {
        if (!account) {
            throw new Error('Private key not configured');
        }

        const tx = await creditPassportContract.methods
            .createCreditPassport(creditScore, transactionHistory)
            .send({ from: account.address, gas: 3000000 });
        
        return tx.transactionHash;
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