import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, Globe, MapPin, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import EmbeddedLogo from './EmbeddedLogo';

/**
 * Enhanced Passport Document Component
 * 
 * A comprehensive passport document with country information, stamps, and QR code
 */
const EnhancedPassportDocument = ({ userData, onShare }) => {
  const { toast } = useToast();
  const [countryInfo, setCountryInfo] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [passportLink, setPassportLink] = useState('');
  const [stamps, setStamps] = useState([]);
  
  // Generate a random passport ID
  const passportId = `CP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  
  // Detect user's country based on IP address
  useEffect(() => {
    const detectCountry = async () => {
      try {
        // In a real app, you would use a geolocation API
        // For demo purposes, we'll use a mock response
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock country data
        const mockCountryData = {
          country: 'Kenya',
          countryCode: 'KE',
          flag: '🇰🇪',
          region: 'Africa'
        };
        
        setCountryInfo(mockCountryData);
      } catch (error) {
        console.error('Error detecting country:', error);
        // Fallback to default country
        setCountryInfo({
          country: 'Kenya',
          countryCode: 'KE',
          flag: '🇰🇪',
          region: 'Africa'
        });
      }
    };
    
    detectCountry();
  }, []);
  
  // Load stamps (in a real app, these would come from an API)
  useEffect(() => {
    // Mock stamps data
    const mockStamps = [
      {
        id: 'stamp1',
        institution: 'KCB Bank',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        logo: 'https://via.placeholder.com/100x100?text=KCB'
      }
    ];
    
    setStamps(mockStamps);
  }, []);
  
  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Generate QR code URL
  const generateQRCodeUrl = () => {
    // In a real app, this would generate a QR code with a verification link
    // For demo purposes, we'll use a placeholder
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://creditboost.co.ke/verify/${passportId}`;
  };
  
  // Generate passport link
  const generatePassportLink = () => {
    // In a real app, this would generate a unique, secure link
    // For demo purposes, we'll use a placeholder
    const link = `https://creditboost.co.ke/passport/${passportId}`;
    setPassportLink(link);
    return link;
  };
  
  // Handle download
  const handleDownload = async () => {
    setIsGenerating(true);
    
    try {
      // In a real app, this would generate a PDF using a library like jsPDF
      // For demo purposes, we'll simulate the PDF generation
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a simple HTML representation of the passport
      const passportHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Universal Credit Passport</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              border: 2px solid #1E40AF;
            }
            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #1E40AF;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #1E40AF;
            }
            .subtitle {
              font-size: 12px;
              color: #64748B;
              margin-top: 5px;
            }
            .section {
              margin-top: 15px;
              margin-bottom: 15px;
              padding: 10px;
              background-color: #F8FAFC;
              border-radius: 5px;
            }
            .section-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #1E40AF;
              border-bottom: 1px solid #CBD5E1;
              padding-bottom: 5px;
            }
            .row {
              display: flex;
              margin-bottom: 8px;
            }
            .label {
              width: 40%;
              font-size: 12px;
              color: #64748B;
            }
            .value {
              width: 60%;
              font-size: 12px;
              color: #0F172A;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              border-top: 1px solid #CBD5E1;
              padding-top: 10px;
              font-size: 10px;
              color: #64748B;
              display: flex;
              justify-content: space-between;
            }
            .country-flag {
              font-size: 24px;
              margin-right: 10px;
            }
            .stamp {
              border: 2px dashed #CBD5E1;
              padding: 10px;
              text-align: center;
              width: 100px;
              height: 100px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              font-size: 10px;
              color: #64748B;
              margin: 10px;
            }
            .stamp-verified {
              border-color: #10B981;
              color: #047857;
            }
            .qr-code {
              width: 100px;
              height: 100px;
            }
            .logo {
              height: 50px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">UNIVERSAL CREDIT PASSPORT</div>
              <div class="subtitle">Official Financial Identity Document</div>
            </div>
            <div>
              <img src="${EmbeddedLogo().dataUrl}" class="logo" alt="CreditBoost Logo">
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between;">
            <div>
              <div style="font-size: 14px; font-weight: bold;">Passport ID: ${passportId}</div>
              <div style="font-size: 12px; color: #64748B;">Issue Date: ${formatDate(new Date())}</div>
              <div style="font-size: 12px; color: #64748B;">Valid Until: ${formatDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))}</div>
            </div>
            <div style="display: flex; align-items: center;">
              <span class="country-flag">${countryInfo?.flag || '🌍'}</span>
              <div>
                <div style="font-size: 14px; font-weight: bold;">${countryInfo?.country || 'International'}</div>
                <div style="font-size: 12px; color: #64748B;">${countryInfo?.region || ''}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">PERSONAL INFORMATION</div>
            <div class="row">
              <div class="label">Full Name:</div>
              <div class="value">${userData.firstName} ${userData.lastName}</div>
            </div>
            <div class="row">
              <div class="label">Email:</div>
              <div class="value">${userData.email}</div>
            </div>
            <div class="row">
              <div class="label">Phone:</div>
              <div class="value">${userData.phone || 'Not provided'}</div>
            </div>
            <div class="row">
              <div class="label">National ID:</div>
              <div class="value">${userData.nationalId || 'Not verified'}</div>
            </div>
            <div class="row">
              <div class="label">Country:</div>
              <div class="value">${countryInfo?.flag || ''} ${countryInfo?.country || 'International'}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">CREDIT SCORE</div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 24px; font-weight: bold; color: #3B82F6;">710</div>
                <div style="font-size: 14px; font-weight: bold; color: #3B82F6;">Good</div>
              </div>
              <div>
                <div style="font-size: 12px; color: #64748B;">Last Updated: ${formatDate(new Date())}</div>
                <div style="font-size: 12px; color: #64748B;">Score Range: 300-850</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">CREDIT FACTORS</div>
            <div class="row">
              <div class="label">Payment History:</div>
              <div class="value">Excellent (95%)</div>
            </div>
            <div class="row">
              <div class="label">Credit Utilization:</div>
              <div class="value">Good (75%)</div>
            </div>
            <div class="row">
              <div class="label">Credit Age:</div>
              <div class="value">Fair (60%)</div>
            </div>
            <div class="row">
              <div class="label">Account Mix:</div>
              <div class="value">Good (80%)</div>
            </div>
            <div class="row">
              <div class="label">Recent Inquiries:</div>
              <div class="value">Excellent (90%)</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">VERIFIED DATA SOURCES</div>
            <div class="row">
              <div class="label">TransUnion:</div>
              <div class="value">Verified • Last Updated: ${formatDate(new Date())}</div>
            </div>
            <div class="row">
              <div class="label">Experian:</div>
              <div class="value">Verified • Last Updated: ${formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))}</div>
            </div>
            <div class="row">
              <div class="label">M-Pesa:</div>
              <div class="value">Verified • Last Updated: ${formatDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000))}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">OFFICIAL STAMPS</div>
            <div style="display: flex; flex-wrap: wrap;">
              ${stamps.map(stamp => `
                <div class="stamp ${stamp.verified ? 'stamp-verified' : ''}">
                  <div>${stamp.institution}</div>
                  <div>${formatDate(new Date(stamp.date))}</div>
                  ${stamp.verified ? '<div style="color: #047857; font-weight: bold;">VERIFIED</div>' : ''}
                </div>
              `).join('')}
              <div class="stamp" style="border-style: dotted;">
                <div>+ Add Stamp</div>
                <div style="font-size: 8px;">For Financial Institutions</div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div>
              <div>This document is officially issued by CreditBoost Ltd.</div>
              <div>To verify this document, scan the QR code or visit creditboost.co.ke/verify</div>
              <div>Document ID: DOC-${Math.random().toString(36).substring(2, 10).toUpperCase()}</div>
            </div>
            <img src="${generateQRCodeUrl()}" class="qr-code" alt="Verification QR Code">
          </div>
        </body>
        </html>
      `;
      
      // Create a blob and download it
      const blob = new Blob([passportHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CreditPassport_${userData.firstName}_${userData.lastName}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Generate shareable link
      generatePassportLink();
      
      toast({
        title: "Passport Generated Successfully",
        description: "Your Credit Passport has been downloaded as an HTML document.",
      });
    } catch (error) {
      console.error('Error generating passport:', error);
      
      toast({
        title: "Error Generating Passport",
        description: "There was an error generating your Credit Passport. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle copy link
  const handleCopyLink = () => {
    const link = passportLink || generatePassportLink();
    navigator.clipboard.writeText(link);
    
    toast({
      title: "Link Copied",
      description: "Passport link copied to clipboard.",
    });
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-4">
        <Button 
          className="w-full" 
          onClick={handleDownload}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Generating...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Credit Passport
            </>
          )}
        </Button>
        
        <Button variant="outline" onClick={onShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
      
      {passportLink && (
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
          <div className="text-sm text-gray-600 truncate flex-1 mr-2">
            {passportLink}
          </div>
          <Button variant="ghost" size="sm" onClick={handleCopyLink}>
            Copy Link
          </Button>
        </div>
      )}
      
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Globe className="h-4 w-4" />
        <span>
          {countryInfo ? (
            <>
              {countryInfo.flag} {countryInfo.country}, {countryInfo.region}
            </>
          ) : (
            'Detecting location...'
          )}
        </span>
      </div>
      
      {stamps.length > 0 && (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span>
            {stamps.length} official {stamps.length === 1 ? 'stamp' : 'stamps'} from financial institutions
          </span>
        </div>
      )}
      
      <div className="bg-blue-50 p-4 rounded-md">
        <p className="text-sm text-blue-700">
          Your Credit Passport is an official document that verifies your financial identity. 
          It can be shared with financial institutions, landlords, or employers as proof of your creditworthiness.
        </p>
      </div>
    </div>
  );
};

export default EnhancedPassportDocument;