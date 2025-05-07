import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { creditPassportService } from "@/services/creditPassport.service";
import DashboardNavbar from "@/components/DashboardNavbar";
import SideBar from "@/components/SideBar";
import PassportView from "@/components/CreditPassport/PassportView";
import ShareModal from "@/components/CreditPassport/ShareModal";

const CreditPassport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [creditPassport, setCreditPassport] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [shareLink, setShareLink] = useState("");
  const [expiryTime, setExpiryTime] = useState(24); // Default 24 hours
  const [userAddress, setUserAddress] = useState("");
  const [userData, setUserData] = useState(null);
  const [creditScore, setCreditScore] = useState(750); // Default score
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Fetch user's credit passport on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // In a real app, you would get the user's data from context or API
        const mockUserData = {
          id: "user123456789",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
          updatedAt: new Date().toISOString()
        };
        setUserData(mockUserData);
        
        // Mock wallet address for blockchain interactions
        const mockUserAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
        setUserAddress(mockUserAddress);
        
        // Try to fetch existing passport
        try {
          const passport = await creditPassportService.getCreditPassport(mockUserAddress);
          setCreditPassport(passport);
          setCreditScore(passport.creditScore || 750);
        } catch (err) {
          // If no passport exists, we'll create one later
          console.log("No existing passport found");
        }
        
        // Mock transaction history
        setTransactionHistory([
          {
            date: "2023-12-15T10:30:00Z",
            description: "Mortgage Payment",
            amount: 1200.00,
            status: "paid"
          },
          {
            date: "2023-12-10T14:22:00Z",
            description: "Credit Card Payment",
            amount: 450.75,
            status: "paid"
          },
          {
            date: "2023-12-05T09:15:00Z",
            description: "Auto Loan Payment",
            amount: 350.00,
            status: "paid"
          },
          {
            date: "2023-11-28T16:45:00Z",
            description: "Personal Loan",
            amount: 5000.00,
            status: "pending"
          }
        ]);
        
        // Mock verification stamps
        setVerifications([
          {
            id: "ver-123456",
            institution: "TransUnion Credit Bureau",
            purpose: "Credit Score Verification",
            timestamp: "2023-12-01T09:30:00Z",
            verifier: "Sarah Johnson, Credit Analyst"
          },
          {
            id: "ver-789012",
            institution: "First National Bank",
            purpose: "Mortgage Application",
            timestamp: "2023-11-15T14:20:00Z",
            verifier: "Michael Chen, Loan Officer"
          }
        ]);
        
        setLoading(false);
      } catch (err) {
        setError("Failed to load user data. Please try again.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleCreatePassport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const creditData = {
        userAddress,
        creditScore: 750, // Default starting score
        transactionHistory: ["Initial credit passport creation"]
      };
      
      await creditPassportService.createCreditPassport(creditData);
      setSuccess("Credit passport created successfully!");
      
      // Refresh passport data
      const passport = await creditPassportService.getCreditPassport(userAddress);
      setCreditPassport(passport);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to create credit passport");
      setLoading(false);
    }
  };

  const handleSharePassport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await creditPassportService.generateShareableLink(userAddress, expiryTime);
      setShareLink(result.shareLink || "https://credvault.co.ke/passport/share/abc123def456");
      setShowShareModal(true);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to generate shareable link");
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess("Link copied to clipboard!");
  };
  
  const handlePhotoChange = async (file) => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, you would upload the file to your server here
      // and get back a URL to the uploaded image
      
      // For now, we'll create a local object URL as a placeholder
      const photoUrl = file ? URL.createObjectURL(file) : null;
      
      // Update user data with new photo URL
      setUserData(prev => ({
        ...prev,
        photoUrl
      }));
      
      setSuccess("Profile photo updated successfully!");
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to update profile photo");
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Universal Credit Passport</h1>
            
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-700">Success</AlertTitle>
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !creditPassport ? (
              <Card className="p-6 text-center">
                <h2 className="text-xl font-semibold mb-4">Welcome to Universal Credit Passport</h2>
                <p className="text-gray-600 mb-6">
                  You don't have a credit passport yet. Create one to start building your credit history on the blockchain.
                </p>
                <Button onClick={handleCreatePassport} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Credit Passport"
                  )}
                </Button>
              </Card>
            ) : (
              <>
                <PassportView 
                  userData={userData}
                  creditScore={creditScore}
                  transactionHistory={transactionHistory}
                  verifications={verifications}
                  onShare={handleSharePassport}
                  onPhotoChange={handlePhotoChange}
                />
              </>
            )}
          </div>
        </main>
      </div>
      
      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          shareLink={shareLink}
          expiryTime={expiryTime}
          onChangeExpiry={setExpiryTime}
          onClose={() => setShowShareModal(false)}
          onCopy={copyToClipboard}
        />
      )}
    </div>
  );
};

export default CreditPassport;