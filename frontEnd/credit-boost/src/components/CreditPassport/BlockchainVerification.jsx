import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { loadBlockchainIntegration } from '@/services/blockchain/safeImport';

const BlockchainVerification = ({ passportData }) => {
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [networkInfo, setNetworkInfo] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    const checkBlockchainVerification = async () => {
      try {
        // Load blockchain integration safely
        const blockchainIntegration = await loadBlockchainIntegration();
        const initialized = await blockchainIntegration.initialize();
        setWalletConnected(initialized);
        
        // Check if passport is blockchain verified
        if (passportData?.blockchainVerified) {
          setVerificationStatus('verified');
          setNetworkInfo('Ethereum Network');
        } else {
          setVerificationStatus('unverified');
        }
      } catch (error) {
        console.error('Blockchain verification error:', error);
        setVerificationStatus('error');
      }
    };
    
    checkBlockchainVerification();
  }, [passportData]);

  const renderVerificationStatus = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <div className="flex items-center bg-green-50 border border-green-200 rounded-lg p-3">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <p className="font-medium text-green-700">Blockchain Verified</p>
              <p className="text-xs text-green-600">This passport is secured on the blockchain</p>
              {networkInfo && <p className="text-xs text-green-600 mt-1">Network: {networkInfo}</p>}
            </div>
          </div>
        );
      
      case 'unverified':
        return (
          <div className="flex items-center bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <Shield className="h-5 w-5 text-yellow-500 mr-2" />
            <div>
              <p className="font-medium text-yellow-700">Traditional Verification</p>
              <p className="text-xs text-yellow-600">This passport is not yet on the blockchain</p>
              {walletConnected && <button className="text-xs text-blue-600 underline mt-1">Secure on Blockchain</button>}
            </div>
          </div>
        );
      
      case 'error':
        return (
          <div className="flex items-center bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <p className="font-medium text-red-700">Verification Error</p>
              <p className="text-xs text-red-600">Could not connect to blockchain</p>
              <button className="text-xs text-blue-600 underline mt-1">
                Connect Wallet
              </button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
            <div>
              <p className="font-medium text-gray-700">Verifying...</p>
              <p className="text-xs text-gray-600">Checking blockchain verification</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Verification Status</h3>
      {renderVerificationStatus()}
    </div>
  );
};

export default BlockchainVerification;