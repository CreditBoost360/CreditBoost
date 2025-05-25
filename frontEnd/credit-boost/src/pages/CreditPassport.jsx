import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import AuthenticatedLayout from './Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Download, Share2, QrCode, Clock, CheckCircle2, AlertTriangle, Stamp } from 'lucide-react';
import EnhancedPassportDocument from '@/components/CreditPassport/EnhancedPassportDocument';
import PassportPreview from '@/components/CreditPassport/PassportPreview';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import StampModal from '@/components/CreditPassport/StampModal';
import { useToast } from '@/components/ui/use-toast';

const CreditPassport = () => {
  const { user } = useContext(AppContext);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('passport');
  const [isLoading, setIsLoading] = useState(true);
  const [passportData, setPassportData] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [stampModalOpen, setStampModalOpen] = useState(false);
  const [stamps, setStamps] = useState([]);
  
  // Simulate loading passport data
  useEffect(() => {
    const loadPassportData = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample passport data
      setPassportData({
        status: 'active',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString(),
        verificationLevel: 'verified',
        creditScore: 710,
        dataSources: [
          { name: 'TransUnion', status: 'connected', lastSync: new Date().toISOString() },
          { name: 'Experian', status: 'connected', lastSync: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
          { name: 'M-Pesa', status: 'connected', lastSync: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
        ],
        shareHistory: [
          { id: 1, sharedWith: 'KCB Bank', sharedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
          { id: 2, sharedWith: 'Equity Bank', sharedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), expiresAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), status: 'expired' }
        ]
      });
      
      setIsLoading(false);
    };
    
    loadPassportData();
  }, []);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  // Calculate days remaining until expiry
  const getDaysRemaining = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Handle share button click
  const handleShare = () => {
    setShareModalOpen(true);
  };
  
  // Handle stamps functionality
  
  // Handle add stamp
  const handleAddStamp = (stampData) => {
    setStamps(prev => [...prev, stampData]);
    
    toast({
      title: "Stamp Added",
      description: `${stampData.institution} has added their stamp to your Credit Passport.`,
    });
  };
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Shield className="mr-2 h-6 w-6" />
              Universal Credit Passport
            </h1>
            <p className="text-gray-500">
              Your secure, portable financial identity
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <LanguageSwitcher />
            <Button variant="outline" size="sm" onClick={() => setActiveTab('help')}>
              Help
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <Card className="mb-6">
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-500">Loading your Credit Passport...</p>
              </div>
            </CardContent>
          </Card>
        ) : passportData ? (
          <>
            {/* Passport Status Card */}
            <Card className="mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Credit Passport Status: {passportData.status === 'active' ? 'Active' : 'Inactive'}</h2>
                    <p className="mt-2 opacity-90">
                      Your Credit Passport is valid and ready to use. It contains your verified financial identity and credit information.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center bg-white/20 rounded-lg px-4 py-2">
                    <div className="mr-3">
                      <div className="text-xs opacity-75">Expires in</div>
                      <div className="text-2xl font-bold">{getDaysRemaining(passportData.expiresAt)} days</div>
                    </div>
                    <Clock className="h-8 w-8 opacity-75" />
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Verification Level</div>
                      <div className="font-medium">{passportData.verificationLevel === 'verified' ? 'Fully Verified' : 'Pending Verification'}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Last Updated</div>
                      <div className="font-medium">{formatDate(passportData.lastUpdated)}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <QrCode className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Credit Score</div>
                      <div className="font-medium">{passportData.creditScore} / 850</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="passport">Passport Document</TabsTrigger>
                <TabsTrigger value="data">Connected Data</TabsTrigger>
                <TabsTrigger value="sharing">Sharing History</TabsTrigger>
              </TabsList>
              
              {/* Passport Document Tab */}
              <TabsContent value="passport">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Credit Passport Document</CardTitle>
                    <CardDescription>
                      Download or share your official Credit Passport document
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <PassportPreview 
                          userData={user || {
                            firstName: 'John',
                            lastName: 'Doe',
                            email: 'john.doe@example.com',
                            id: '12345'
                          }}
                          countryInfo={{
                            country: 'Kenya',
                            countryCode: 'KE',
                            flag: '🇰🇪',
                            region: 'Africa'
                          }}
                        />
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                          <div className="flex items-start">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                            <p className="text-sm text-yellow-700">
                              This is a preview. Download the document to see the full Credit Passport with all your verified information.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <EnhancedPassportDocument 
                          userData={user || {
                            firstName: 'John',
                            lastName: 'Doe',
                            email: 'john.doe@example.com',
                            id: '12345'
                          }}
                          onShare={handleShare}
                          stamps={stamps}
                        />
                        
                        <div className="mt-6">
                          <h3 className="font-medium mb-2">What's included in your Credit Passport?</h3>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                              <span className="text-sm">Personal identification details</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                              <span className="text-sm">Current credit score with rating</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                              <span className="text-sm">Credit factors breakdown</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                              <span className="text-sm">Verified data sources</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                              <span className="text-sm">Blockchain verification details</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                              <span className="text-sm">QR code for instant verification</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Connected Data Tab */}
              <TabsContent value="data">
                <Card>
                  <CardHeader>
                    <CardTitle>Connected Data Sources</CardTitle>
                    <CardDescription>
                      Data sources that contribute to your Credit Passport
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {passportData.dataSources.map((source, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-2 rounded-full mr-3">
                                <Shield className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-medium">{source.name}</h3>
                                <p className="text-sm text-gray-500">Last synced: {formatDate(source.lastSync)}</p>
                              </div>
                            </div>
                            <div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                source.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {source.status === 'connected' ? 'Connected' : 'Pending'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-end">
                            <Button variant="outline" size="sm">
                              Refresh Data
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border border-dashed rounded-lg p-4 text-center">
                        <Button variant="outline">
                          Connect New Data Source
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Sharing History Tab */}
              <TabsContent value="sharing">
                <Card>
                  <CardHeader>
                    <CardTitle>Sharing History</CardTitle>
                    <CardDescription>
                      Track who you've shared your Credit Passport with
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {passportData.shareHistory.map((share, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{share.sharedWith}</h3>
                              <p className="text-sm text-gray-500">Shared on {formatDate(share.sharedAt)}</p>
                            </div>
                            <div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                share.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {share.status === 'active' ? 'Active' : 'Expired'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                              {share.status === 'active' 
                                ? `Expires on ${formatDate(share.expiresAt)}` 
                                : `Expired on ${formatDate(share.expiresAt)}`}
                            </p>
                            
                            {share.status === 'active' && (
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                Revoke Access
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="border border-dashed rounded-lg p-4 text-center flex-1">
                          <Button onClick={handleShare} className="w-full">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share Credit Passport
                          </Button>
                        </div>
                        <div className="border border-dashed rounded-lg p-4 text-center flex-1">
                          <Button 
                            variant="outline" 
                            onClick={() => setStampModalOpen(true)}
                            className="w-full"
                          >
                            <Stamp className="mr-2 h-4 w-4" />
                            Add Institution Stamp
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card className="mb-6">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-16 w-16 text-gray-300 mb-4" />
              <h2 className="text-xl font-bold mb-2">No Credit Passport Found</h2>
              <p className="text-gray-500 text-center mb-6">
                You don't have a Credit Passport yet. Create one to establish your financial identity.
              </p>
              <Button>Create Credit Passport</Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Stamp Modal */}
      <StampModal 
        isOpen={stampModalOpen}
        onClose={() => setStampModalOpen(false)}
        onAddStamp={handleAddStamp}
      />
    </AuthenticatedLayout>
  );
};

export default CreditPassport;