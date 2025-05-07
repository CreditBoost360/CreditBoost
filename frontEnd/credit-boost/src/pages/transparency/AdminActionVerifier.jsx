import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Search, AlertTriangle, Scan, Shield } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * AdminActionVerifier Component
 * Allows users to verify the authenticity of admin actions
 * by entering a verification code or scanning a QR code
 */
const AdminActionVerifier = () => {
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [scanMode, setScanMode] = useState(false);
  
  // Handle verification submission
  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!verificationId.trim()) {
      setError('Please enter a verification ID');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would be an API call
      // For now, we'll simulate verification with mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock verification result based on input
      if (verificationId === 'VERIFY-123456' || verificationId === 'VERIFY-654321') {
        setVerificationResult({
          valid: true,
          action: {
            id: 'action-' + Math.random().toString(36).substring(2, 10),
            type: 'SYSTEM_CONFIG_CHANGE',
            description: 'Security policy update: Password complexity requirements increased',
            timestamp: new Date().toISOString(),
            performedBy: 'L6-A2',
            approvedBy: ['L6-A1', 'L6-A3'],
            verificationId: verificationId,
            cryptographicProof: 'e7c6f8a2d5b3c9e1a4f7d2b5e8c3a9f6b2d5e8a3c9f6b2d5e8c3a9f6',
            blockchainReference: '0x7f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0'
          }
        });
      } else {
        setVerificationResult({
          valid: false,
          error: 'Invalid verification ID. This action cannot be verified.'
        });
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify action. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle QR code scanning
  const handleScan = async () => {
    setScanMode(true);
    
    try {
      // In a real app, this would use the device camera to scan a QR code
      // For now, we'll simulate scanning with a timeout
      
      setLoading(true);
      
      // Simulate scanning delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful scan
      setVerificationId('VERIFY-654321');
      
      // Auto-verify after scan
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVerificationResult({
        valid: true,
        action: {
          id: 'action-' + Math.random().toString(36).substring(2, 10),
          type: 'DATABASE_BACKUP',
          description: 'Scheduled encrypted database backup',
          timestamp: new Date().toISOString(),
          performedBy: 'L6-A1',
          approvedBy: ['L6-A2', 'L6-A3'],
          verificationId: 'VERIFY-654321',
          cryptographicProof: 'a9f6b2d5e8c3a9f6b2d5e8c3a9f6b2d5e8c3a9f6b2d5e8c3a9f6b2d5',
          blockchainReference: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f'
        }
      });
    } catch (err) {
      console.error('Scan error:', err);
      setError('Failed to scan QR code. Please try manual entry.');
    } finally {
      setLoading(false);
      setScanMode(false);
    }
  };
  
  // Reset verification
  const resetVerification = () => {
    setVerificationId('');
    setVerificationResult(null);
    setError(null);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link to="/transparency" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft size={16} className="mr-1" />
            Back to Transparency Portal
          </Link>
          
          <h1 className="text-2xl font-bold mt-4">Admin Action Verifier</h1>
          <p className="text-gray-600 mt-1">
            Verify the authenticity of administrative actions
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="mr-3 mt-1">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-1">How Verification Works</h3>
              <p className="text-sm text-blue-700">
                Each administrative action is assigned a unique verification ID and cryptographic proof.
                You can verify the authenticity of an action by entering its verification ID or scanning
                its QR code. The system will check the cryptographic proof against our secure blockchain record.
              </p>
            </div>
          </div>
        </div>
        
        {!verificationResult ? (
          <Card>
            <CardHeader>
              <CardTitle>Verify Admin Action</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  <div className="flex items-center">
                    <AlertTriangle size={16} className="mr-2" />
                    {error}
                  </div>
                </div>
              )}
              
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification ID
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter verification ID (e.g., VERIFY-123456)"
                      value={verificationId}
                      onChange={(e) => setVerificationId(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the verification ID provided with the admin action
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading && !scanMode ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Verifying...
                      </>
                    ) : (
                      'Verify Action'
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex-1"
                    onClick={handleScan}
                    disabled={loading}
                  >
                    {loading && scanMode ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Scan size={16} className="mr-2" />
                        Scan QR Code
                      </>
                    )}
                  </Button>
                </div>
              </form>
              
              {scanMode && (
                <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-lg">
                  <div className="aspect-square max-w-xs mx-auto bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <Scan size={48} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">Camera preview would appear here</p>
                      <p className="text-xs text-gray-400 mt-1">Point camera at QR code</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-700 mb-2">Example Verification IDs</h3>
                <p className="text-sm text-gray-600">
                  For demonstration purposes, you can use these example IDs:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li className="font-mono">VERIFY-123456</li>
                  <li className="font-mono">VERIFY-654321</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className={verificationResult.valid ? 'border-green-200' : 'border-red-200'}>
            <CardHeader className={verificationResult.valid ? 'bg-green-50' : 'bg-red-50'}>
              <CardTitle className="flex items-center">
                {verificationResult.valid ? (
                  <>
                    <CheckCircle size={20} className="text-green-600 mr-2" />
                    <span className="text-green-800">Verification Successful</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={20} className="text-red-600 mr-2" />
                    <span className="text-red-800">Verification Failed</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {verificationResult.valid ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Action Details</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Action Type</p>
                          <p className="font-medium">{verificationResult.action.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Timestamp</p>
                          <p className="font-medium">{formatDate(verificationResult.action.timestamp)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Performed By</p>
                          <p className="font-medium">{verificationResult.action.performedBy}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Approved By</p>
                          <p className="font-medium">{verificationResult.action.approvedBy.join(', ')}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="font-medium">{verificationResult.action.description}</p>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">Verification ID</p>
                        <p className="font-mono text-sm">{verificationResult.action.verificationId}</p>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Blockchain Reference</p>
                        <p className="font-mono text-sm truncate">{verificationResult.action.blockchainReference}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-md border border-green-200">
                    <div className="flex items-start">
                      <CheckCircle size={16} className="text-green-600 mt-0.5 mr-2" />
                      <div>
                        <p className="text-green-800 font-medium">Cryptographic Verification Passed</p>
                        <p className="text-sm text-green-700 mt-1">
                          This action has been cryptographically verified against our secure blockchain record.
                          The action was properly authorized and executed by the identified administrators.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-md border border-red-200">
                    <div className="flex items-start">
                      <AlertTriangle size={16} className="text-red-600 mt-0.5 mr-2" />
                      <div>
                        <p className="text-red-800 font-medium">Verification Failed</p>
                        <p className="text-sm text-red-700 mt-1">
                          {verificationResult.error}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                    <div className="flex items-start">
                      <AlertTriangle size={16} className="text-amber-600 mt-0.5 mr-2" />
                      <div>
                        <p className="text-amber-800 font-medium">What This Means</p>
                        <p className="text-sm text-amber-700 mt-1">
                          The verification ID you provided is not recognized in our system.
                          This could mean the ID was entered incorrectly or the action was not
                          properly authorized through our secure system.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <Button onClick={resetVerification}>
                  Verify Another Action
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminActionVerifier;