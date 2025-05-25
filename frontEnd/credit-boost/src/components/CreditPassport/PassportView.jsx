import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, Clock, Eye, EyeOff, Share2, Download, Printer, Camera } from 'lucide-react';
import passportImage from '../../assets/designs/passport.png';
import PhotoUpload from './PhotoUpload';
import BlockchainVerification from './BlockchainVerification';
import { Button } from "@/components/ui/button";
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

const PassportView = ({ 
  userData, 
  creditScore, 
  transactionHistory = [], 
  verifications = [],
  onShare,
  onPhotoChange
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPassportDesign, setShowPassportDesign] = useState(true);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle passport download
  const handleDownloadPassport = () => {
    const passportElement = document.getElementById('credit-passport');
    if (passportElement) {
      toPng(passportElement)
        .then(dataUrl => {
          saveAs(dataUrl, 'universal-credit-passport.png');
        })
        .catch(error => {
          console.error('Error downloading passport:', error);
        });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Passport Design Reference */}
      {showPassportDesign && (
        <div className="mb-6 relative">
          <button 
            onClick={() => setShowPassportDesign(false)}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md z-10"
          >
            <EyeOff size={16} />
          </button>
          <div className="text-center mb-2">
            <h3 className="text-lg font-semibold">Passport Design Reference</h3>
            <p className="text-sm text-gray-500">This is how your passport will look when printed</p>
          </div>
          <img 
            src={passportImage} 
            alt="Credit Passport Design" 
            className="w-full rounded-lg shadow-lg" 
          />
        </div>
      )}

      {/* Passport Content */}
      <div id="credit-passport">
        {/* Passport Header */}
        <motion.div 
          className="relative rounded-t-xl bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Universal Credit Passport</h1>
              <p className="text-blue-100">Blockchain-Secured Financial Identity</p>
            </div>
            <Shield className="h-12 w-12" />
          </div>
        </motion.div>

        {/* Passport Body */}
        <motion.div 
          className="bg-white rounded-b-xl shadow-lg overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* User Identity Section */}
          <div className="border-b border-gray-200">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                  <div className="relative group">
                    {userData?.photoUrl ? (
                      <img 
                        src={userData.photoUrl} 
                        alt={`${userData.firstName} ${userData.lastName}`}
                        className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-md">
                        <span className="text-3xl font-bold text-blue-600">
                          {userData?.firstName?.[0]}{userData?.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    
                    <Button 
                      variant="secondary"
                      size="icon"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
                      onClick={() => document.getElementById('photo-upload-modal').showModal()}
                    >
                      <Camera size={14} />
                    </Button>
                    
                    {/* Photo Upload Modal */}
                    <dialog id="photo-upload-modal" className="modal modal-bottom sm:modal-middle rounded-lg shadow-lg">
                      <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <h3 className="font-bold text-lg mb-4">Update Passport Photo</h3>
                        <PhotoUpload 
                          currentPhoto={userData?.photoUrl} 
                          onPhotoChange={onPhotoChange}
                        />
                        <div className="modal-action mt-6">
                          <form method="dialog">
                            <Button type="submit">Close</Button>
                          </form>
                        </div>
                      </div>
                    </dialog>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold">{userData?.firstName} {userData?.lastName}</h2>
                    <p className="text-gray-600">{userData?.email}</p>
                  </div>
                </div>
                <div className="text-right mt-4 md:mt-0">
                  <div className="text-sm text-gray-500">Passport ID</div>
                  <div className="font-mono text-sm">{userData?.id?.substring(0, 8)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Blockchain Verification Status */}
          <div className="p-6 border-b border-gray-200">
            <BlockchainVerification passportData={userData} />
          </div>

          {/* Credit Score Section */}
          <motion.div 
            className="p-6 border-b border-gray-200"
            variants={itemVariants}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Credit Score</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  {showDetails ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                        {creditScore < 580 ? 'Poor' : 
                         creditScore < 670 ? 'Fair' :
                         creditScore < 740 ? 'Good' :
                         creditScore < 800 ? 'Very Good' : 'Excellent'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {creditScore}/850
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div 
                      style={{ width: `${(creditScore/850)*100}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                    ></div>
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-3xl font-bold text-blue-600">{creditScore}</div>
              </div>
            </div>
          </motion.div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                className={`px-4 py-3 font-medium text-sm ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('history')}
              >
                Transaction History
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm ${activeTab === 'verifications' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('verifications')}
              >
                Verification Stamps
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Blockchain Address</h4>
                    <p className="font-mono text-sm break-all">{userData?.walletAddress || '0x1234...5678'}</p>
                    <p className="text-xs text-gray-500 mt-1">Your unique identifier on the blockchain</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Last Updated</h4>
                    <p>{formatDate(userData?.updatedAt || new Date())}</p>
                    <p className="text-xs text-gray-500 mt-1">Your credit data is updated regularly</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Credit Factors</h4>
                    <ul className="text-sm space-y-1">
                      <li className="flex justify-between">
                        <span>Payment History</span>
                        <span className="font-medium">Good</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Credit Utilization</span>
                        <span className="font-medium">30%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Account Age</span>
                        <span className="font-medium">5 years</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Security</h4>
                    <div className="flex items-center text-green-600">
                      <CheckCircle size={16} className="mr-2" />
                      <span>Blockchain Verified</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Your data is secured with advanced encryption</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactionHistory.length > 0 ? (
                        transactionHistory.map((transaction, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(transaction.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${transaction.amount}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                transaction.status === 'paid' ? 'bg-green-100 text-green-800' : 
                                transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {transaction.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No transaction history available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'verifications' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  {verifications.length > 0 ? (
                    verifications.map((verification, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <CheckCircle size={16} className="text-green-600 mr-2" />
                              <h4 className="font-medium">{verification.institution}</h4>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{verification.purpose}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 flex items-center">
                              <Clock size={12} className="mr-1" />
                              {formatDate(verification.timestamp)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">ID: {verification.id}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Verified by: {verification.verifier}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Clock className="h-6 w-6 text-gray-400" />
                      </div>
                      <p>No verification stamps yet</p>
                      <p className="text-sm mt-1">Verification stamps will appear when institutions verify your credit data</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl mt-4">
        <div className="flex flex-wrap gap-3 justify-end">
          <button 
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <button 
            onClick={handleDownloadPassport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
          <button 
            onClick={onShare}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Passport
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassportView;