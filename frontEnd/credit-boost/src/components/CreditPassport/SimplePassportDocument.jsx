import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';

/**
 * Simple Passport Document Component
 * 
 * A simplified version of the passport document that doesn't require the PDF renderer
 */
const SimplePassportDocument = ({ userData, onShare }) => {
  // Generate a random passport ID
  const passportId = `CP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  
  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Handle download
  const handleDownload = () => {
    // Create a simple text representation of the passport
    const passportText = `
UNIVERSAL CREDIT PASSPORT
------------------------
Official Financial Identity Document

Passport ID: ${passportId}
Issue Date: ${formatDate(new Date())}
Valid Until: ${formatDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))}

PERSONAL INFORMATION
-------------------
Full Name: ${userData.firstName} ${userData.lastName}
Email: ${userData.email}
Phone: ${userData.phone || 'Not provided'}

CREDIT SCORE
-----------
Score: 710
Rating: Good
Last Updated: ${formatDate(new Date())}

CREDIT FACTORS
-------------
Payment History: Excellent (95%)
Credit Utilization: Good (75%)
Credit Age: Fair (60%)
Account Mix: Good (80%)
Recent Inquiries: Excellent (90%)

VERIFIED DATA SOURCES
-------------------
TransUnion: Verified (${formatDate(new Date())})
Experian: Verified (${formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))})
M-Pesa: Verified (${formatDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000))})

VERIFICATION INFORMATION
----------------------
Verification Method: Multi-factor Authentication
Blockchain Verified: Yes
Verification Authority: CreditBoost Verification Authority
Verification ID: VER-${Math.random().toString(36).substring(2, 10).toUpperCase()}
Document ID: DOC-${Math.random().toString(36).substring(2, 10).toUpperCase()}

This document is officially issued by CreditBoost Ltd.
To verify this document, visit creditboost.co.ke/verify
    `;
    
    // Create a blob and download it
    const blob = new Blob([passportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CreditPassport_${userData.firstName}_${userData.lastName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-4">
        <Button className="w-full" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download Credit Passport
        </Button>
        
        <Button variant="outline" onClick={onShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md">
        <p className="text-sm text-blue-700">
          Your Credit Passport is an official document that verifies your financial identity. 
          It can be shared with financial institutions, landlords, or employers as proof of your creditworthiness.
        </p>
      </div>
    </div>
  );
};

export default SimplePassportDocument;