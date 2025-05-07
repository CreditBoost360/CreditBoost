import { Request, Response } from 'express';
import { createCreditPassport, updateCreditScore, getCreditData } from '../../blockchain/services/web3Service';
import { uploadToIPFS } from '../../services/ipfs/storage';
import { detectFraudulentActivity } from '../../services/ai/fraudDetection';
import { CreditData } from '../../types';

class CreditPassportController {
    /**
     * Create a new credit passport for a user
     */
    async createPassport(req: Request, res: Response) {
        try {
            const { userAddress, creditScore, transactionHistory } = req.body;
            
            if (!userAddress || !creditScore || !transactionHistory) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Missing required fields' 
                });
            }

            // Create credit passport on blockchain
            const txHash = await createCreditPassport(
                userAddress,
                creditScore,
                transactionHistory
            );

            return res.status(201).json({
                success: true,
                message: 'Credit passport created successfully',
                data: {
                    transactionHash: txHash,
                    userAddress,
                    creditScore
                }
            });
        } catch (error: any) {
            console.error('Error creating credit passport:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create credit passport',
                error: error.message
            });
        }
    }

    /**
     * Update a user's credit score
     */
    async updateScore(req: Request, res: Response) {
        try {
            const { userAddress, newCreditScore } = req.body;
            
            if (!userAddress || !newCreditScore) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Missing required fields' 
                });
            }

            // Update credit score on blockchain
            const txHash = await updateCreditScore(userAddress, newCreditScore);

            return res.status(200).json({
                success: true,
                message: 'Credit score updated successfully',
                data: {
                    transactionHash: txHash,
                    userAddress,
                    newCreditScore
                }
            });
        } catch (error: any) {
            console.error('Error updating credit score:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update credit score',
                error: error.message
            });
        }
    }

    /**
     * Get a user's credit data
     */
    async getCreditPassport(req: Request, res: Response) {
        try {
            const { userAddress } = req.params;
            
            if (!userAddress) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User address is required' 
                });
            }

            // Get credit data from blockchain
            const creditData = await getCreditData(userAddress);

            return res.status(200).json({
                success: true,
                data: {
                    userAddress,
                    creditScore: creditData.creditScore,
                    transactionHistory: creditData.transactionHistory
                }
            });
        } catch (error: any) {
            console.error('Error retrieving credit data:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve credit data',
                error: error.message
            });
        }
    }

    /**
     * Upload KYC documents to IPFS
     */
    async uploadKYCDocuments(req: Request, res: Response) {
        try {
            const { userAddress } = req.params;
            const files = req.files as Express.Multer.File[];
            
            if (!userAddress || !files || files.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'User address and files are required' 
                });
            }

            // Upload each file to IPFS
            const documentHashes = await Promise.all(
                files.map(async (file) => {
                    const hash = await uploadToIPFS(file.buffer);
                    return hash;
                })
            );

            return res.status(200).json({
                success: true,
                message: 'KYC documents uploaded successfully',
                data: {
                    userAddress,
                    documentHashes
                }
            });
        } catch (error: any) {
            console.error('Error uploading KYC documents:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to upload KYC documents',
                error: error.message
            });
        }
    }

    /**
     * Check for fraudulent activity in credit data
     */
    async checkFraud(req: Request, res: Response) {
        try {
            const { creditData } = req.body as { creditData: CreditData };
            
            if (!creditData) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Credit data is required' 
                });
            }

            // Detect fraudulent activity
            const isFraudulent = detectFraudulentActivity(creditData);

            return res.status(200).json({
                success: true,
                data: {
                    isFraudulent,
                    riskLevel: isFraudulent ? 'High' : 'Low'
                }
            });
        } catch (error: any) {
            console.error('Error checking for fraud:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to check for fraudulent activity',
                error: error.message
            });
        }
    }
}

export default CreditPassportController;