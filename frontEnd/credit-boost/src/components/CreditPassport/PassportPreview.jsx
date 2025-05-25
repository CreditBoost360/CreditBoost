import React from 'react';
import { Shield } from 'lucide-react';

/**
 * Passport Preview Component
 * 
 * Displays a preview of the credit passport with logo and country information
 */
const PassportPreview = ({ userData, countryInfo }) => {
  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Generate a random passport ID
  const passportId = `CP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  
  return (
    <div className="aspect-[3/4] bg-gradient-to-b from-blue-50 to-white rounded-lg border-2 border-blue-200 overflow-hidden">
      {/* Header with logo */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex justify-between items-center">
        <div className="text-white">
          <h3 className="text-lg font-bold">Universal Credit Passport</h3>
          <p className="text-xs text-blue-100">Official Financial Identity Document</p>
        </div>
        <div className="bg-white p-1 rounded">
          <img 
            src="/logo.svg" 
            alt="CreditBoost Logo" 
            className="h-6"
          />
        </div>
      </div>
      
      {/* Country and ID information */}
      <div className="p-4 flex justify-between items-center border-b border-blue-100">
        <div>
          <p className="text-xs text-gray-500">Passport ID</p>
          <p className="text-sm font-medium">{passportId}</p>
        </div>
        <div className="flex items-center">
          <span className="text-2xl mr-2">{countryInfo?.flag || '🌍'}</span>
          <div>
            <p className="text-xs text-gray-500">Issued in</p>
            <p className="text-sm font-medium">{countryInfo?.country || 'International'}</p>
          </div>
        </div>
      </div>
      
      {/* Personal information */}
      <div className="p-4">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            {userData?.profileImage ? (
              <img 
                src={userData.profileImage} 
                alt={userData.firstName} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Shield className="h-10 w-10 text-blue-500" />
            )}
          </div>
        </div>
        
        <div className="text-center mb-4">
          <h3 className="font-bold">{userData?.firstName} {userData?.lastName}</h3>
          <p className="text-xs text-gray-500">{userData?.email}</p>
        </div>
        
        <div className="bg-white rounded-lg p-3 shadow-sm mb-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">Credit Score</p>
            <p className="text-xs text-gray-500">Good</p>
          </div>
          <p className="text-xl font-bold text-blue-600 text-center my-1">710</p>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '70%' }}></div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 flex justify-between">
          <span>Issue Date: {formatDate(new Date())}</span>
          <span>Valid for 1 year</span>
        </div>
      </div>
      
      {/* Official stamp placeholder */}
      <div className="absolute bottom-4 right-4 w-16 h-16 border-2 border-red-500 rounded-full flex items-center justify-center rotate-12 opacity-70">
        <div className="text-center text-red-500">
          <div className="text-xs font-bold">OFFICIAL</div>
          <div className="text-[8px]">VERIFIED</div>
        </div>
      </div>
    </div>
  );
};

export default PassportPreview;