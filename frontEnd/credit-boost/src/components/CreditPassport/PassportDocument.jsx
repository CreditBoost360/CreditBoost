import React, { useRef } from 'react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import QRCode from 'qrcode';

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1E40AF',
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 5,
  },
  section: {
    marginTop: 15,
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1E40AF',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: '40%',
    fontSize: 10,
    color: '#64748B',
  },
  value: {
    width: '60%',
    fontSize: 10,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#64748B',
  },
  qrCode: {
    width: 80,
    height: 80,
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 60,
    color: 'rgba(203, 213, 225, 0.3)',
  },
  logo: {
    width: 100,
    height: 50,
    marginBottom: 10,
  },
  photo: {
    width: 80,
    height: 100,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  scoreSection: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  scoreRating: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 5,
  },
  verificationBadge: {
    backgroundColor: '#D1FAE5',
    padding: 5,
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  verificationText: {
    fontSize: 8,
    color: '#047857',
    fontWeight: 'bold',
  },
  factorBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginTop: 5,
    marginBottom: 10,
  },
  factorFill: {
    height: 6,
    borderRadius: 3,
  },
});

// Create PDF Document
const CreditPassportPDF = ({ userData, creditData, verificationData }) => {
  const getScoreRating = (score) => {
    if (score < 580) return { label: 'Poor', color: '#EF4444' };
    if (score < 670) return { label: 'Fair', color: '#F59E0B' };
    if (score < 740) return { label: 'Good', color: '#3B82F6' };
    if (score < 800) return { label: 'Very Good', color: '#10B981' };
    return { label: 'Excellent', color: '#047857' };
  };

  const scoreRating = getScoreRating(creditData.score);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>CREDIT PASSPORT</Text>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>UNIVERSAL CREDIT PASSPORT</Text>
            <Text style={styles.subtitle}>Official Financial Identity Document</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.subtitle}>Passport ID: {verificationData.passportId}</Text>
            <Text style={styles.subtitle}>Issue Date: {formatDate(verificationData.issueDate)}</Text>
            <Text style={styles.subtitle}>Valid Until: {formatDate(verificationData.validUntil)}</Text>
          </View>
        </View>
        
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <View style={styles.row}>
                <Text style={styles.label}>Full Name:</Text>
                <Text style={styles.value}>{userData.firstName} {userData.lastName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{userData.email}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{userData.phone || 'Not provided'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>National ID:</Text>
                <Text style={styles.value}>{userData.nationalId || 'Not verified'}</Text>
              </View>
            </View>
            {userData.profileImage && (
              <Image src={userData.profileImage} style={styles.photo} />
            )}
          </View>
          
          <View style={styles.verificationBadge}>
            <Text style={styles.verificationText}>✓ IDENTITY VERIFIED</Text>
          </View>
        </View>
        
        {/* Credit Score */}
        <View style={styles.scoreSection}>
          <View>
            <Text style={styles.sectionTitle}>CREDIT SCORE</Text>
            <Text style={[styles.scoreValue, { color: scoreRating.color }]}>{creditData.score}</Text>
            <Text style={[styles.scoreRating, { color: scoreRating.color }]}>{scoreRating.label}</Text>
          </View>
          <View>
            <Text style={styles.subtitle}>Last Updated: {formatDate(creditData.lastUpdated)}</Text>
            <Text style={styles.subtitle}>Score Range: 300-850</Text>
          </View>
        </View>
        
        {/* Credit Factors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CREDIT FACTORS</Text>
          
          {creditData.factors.map((factor, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <View style={styles.row}>
                <Text style={styles.label}>{factor.name}:</Text>
                <Text style={styles.value}>{factor.status.toUpperCase()}</Text>
              </View>
              <View style={styles.factorBar}>
                <View 
                  style={[
                    styles.factorFill, 
                    { 
                      width: `${factor.percentage}%`,
                      backgroundColor: 
                        factor.status === 'excellent' ? '#10B981' : 
                        factor.status === 'good' ? '#3B82F6' : 
                        factor.status === 'fair' ? '#F59E0B' : 
                        '#EF4444'
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
        
        {/* Data Sources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VERIFIED DATA SOURCES</Text>
          
          {creditData.dataSources.map((source, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.label}>{source.name}:</Text>
              <Text style={styles.value}>{source.status} • Last Updated: {formatDate(source.lastUpdate)}</Text>
            </View>
          ))}
        </View>
        
        {/* Verification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VERIFICATION INFORMATION</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Verification Method:</Text>
            <Text style={styles.value}>{verificationData.method}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Blockchain Verified:</Text>
            <Text style={styles.value}>{verificationData.blockchainVerified ? 'Yes' : 'No'}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Verification Authority:</Text>
            <Text style={styles.value}>{verificationData.authority}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Verification ID:</Text>
            <Text style={styles.value}>{verificationData.verificationId}</Text>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerText}>This document is officially issued by CreditBoost Ltd.</Text>
            <Text style={styles.footerText}>To verify this document, scan the QR code or visit creditboost.co.ke/verify</Text>
            <Text style={styles.footerText}>Document ID: {verificationData.documentId}</Text>
          </View>
          <Image src={verificationData.qrCode} style={styles.qrCode} />
        </View>
      </Page>
    </Document>
  );
};

/**
 * Credit Passport Document Component
 * 
 * Creates a downloadable PDF document that looks like an official passport
 */
const PassportDocument = ({ userData, onShare }) => {
  const [qrCodeUrl, setQrCodeUrl] = React.useState('');
  
  // Generate QR code for verification
  React.useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(`https://creditboost.co.ke/verify/${userData.id}`);
        setQrCodeUrl(url);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };
    
    generateQR();
  }, [userData]);
  
  // Sample credit data (in a real app, this would come from an API)
  const creditData = {
    score: 710,
    lastUpdated: new Date().toISOString(),
    factors: [
      { name: 'Payment History', status: 'excellent', percentage: 95 },
      { name: 'Credit Utilization', status: 'good', percentage: 75 },
      { name: 'Credit Age', status: 'fair', percentage: 60 },
      { name: 'Account Mix', status: 'good', percentage: 80 },
      { name: 'Recent Inquiries', status: 'excellent', percentage: 90 }
    ],
    dataSources: [
      { name: 'TransUnion', status: 'Verified', lastUpdate: new Date().toISOString() },
      { name: 'Experian', status: 'Verified', lastUpdate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      { name: 'M-Pesa', status: 'Verified', lastUpdate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  };
  
  // Verification data
  const verificationData = {
    passportId: `CP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    issueDate: new Date().toISOString(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    method: 'Multi-factor Authentication',
    blockchainVerified: true,
    authority: 'CreditBoost Verification Authority',
    verificationId: `VER-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    documentId: `DOC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    qrCode: qrCodeUrl
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-4">
        <PDFDownloadLink
          document={<CreditPassportPDF userData={userData} creditData={creditData} verificationData={verificationData} />}
          fileName={`CreditPassport_${userData.firstName}_${userData.lastName}.pdf`}
          className="w-full"
        >
          {({ blob, url, loading, error }) => (
            <Button className="w-full" disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              {loading ? 'Generating Document...' : 'Download Credit Passport'}
            </Button>
          )}
        </PDFDownloadLink>
        
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

export default PassportDocument;