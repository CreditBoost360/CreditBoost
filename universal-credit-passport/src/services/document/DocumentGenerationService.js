const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const { createCanvas, loadImage } = require('canvas');
const ethers = require('ethers');
const ipfsClient = require('ipfs-http-client');
const i18next = require('i18next');
const { v4: uuidv4 } = require('uuid');
const { DateTime } = require('luxon');
const sanitizeHtml = require('sanitize-html');

// Load translations
const enTranslations = require('../../locales/en/document.json');
const swTranslations = require('../../locales/sw/document.json');
const frTranslations = require('../../locales/fr/document.json');
const arTranslations = require('../../locales/ar/document.json');
const esTranslations = require('../../locales/es/document.json');
const zhTranslations = require('../../locales/zh/document.json');

/**
 * Document Generation Service
 * Generates official-looking credit passport documents with security features
 */
class DocumentGenerationService {
  constructor(config, web3Provider, ipfsConfig) {
    this.config = config;
    this.templatesDir = path.join(__dirname, '../../templates');
    this.assetsDir = path.join(__dirname, '../../assets');
    this.outputDir = path.join(__dirname, '../../../output');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    // Setup Web3 connection
    this.provider = new ethers.providers.JsonRpcProvider(web3Provider);
    
    // Setup IPFS connection
    this.ipfs = ipfsClient.create({
      host: ipfsConfig.host,
      port: ipfsConfig.port,
      protocol: ipfsConfig.protocol
    });
    
    // Initialize i18next for translations
    this.initializeI18n();
  }
  
  /**
   * Initialize internationalization
   */
  initializeI18n() {
    i18next.init({
      lng: 'en',
      fallbackLng: 'en',
      resources: {
        en: { translation: enTranslations },
        sw: { translation: swTranslations },
        fr: { translation: frTranslations },
        ar: { translation: arTranslations },
        es: { translation: esTranslations },
        zh: { translation: zhTranslations }
      }
    });
  }
  
  /**
   * Set the current language for document generation
   * @param {string} language - Language code ('en', 'sw', 'fr', 'ar', 'es', 'zh')
   */
  setLanguage(language) {
    i18next.changeLanguage(language);
  }
  
  /**
   * Generate a verification QR code for the passport
   * @param {Object} passport - Passport data
   * @param {string} verificationUrl - URL for verification
   * @returns {Promise<Buffer>} QR code image buffer
   */
  async generateQRCode(passport, verificationUrl) {
    // Create verification URL with passport ID and token
    const verificationData = {
      passportNumber: passport.passportNumber,
      tokenId: passport.tokenId,
      blockchainId: passport.blockchainId,
      verificationToken: uuidv4()
    };
    
    const qrUrl = `${verificationUrl}?data=${encodeURIComponent(JSON.stringify(verificationData))}`;
    
    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 200,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    // Convert data URL to buffer
    const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    
    return qrBuffer;
  }
  
  /**
   * Create a watermark for the document
   * @param {string} text - Watermark text
   * @returns {Promise<Buffer>} Watermark image buffer
   */
  async createWatermark(text) {
    const canvas = createCanvas(600, 400);
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, 600, 400);
    
    // Set watermark properties
    ctx.font = '40px Arial';
    ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Rotate canvas
    ctx.translate(300, 200);
    ctx.rotate(-Math.PI / 6);
    ctx.translate(-300, -200);
    
    // Draw watermark text
    ctx.fillText(text, 300, 200);
    
    // Reset transformation
    ctx.resetTransform();
    
    // Return buffer
    return canvas.toBuffer('image/png');
  }
  
  /**
   * Load and render an institution stamp
   * @param {Object} institution - Institution data
   * @returns {Promise<Buffer>} Stamp image buffer
   */
  async createInstitutionStamp(institution) {
    const canvas = createCanvas(300, 300);
    const ctx = canvas.getContext('2d');
    
    // Draw circular stamp background
    ctx.beginPath();
    ctx.arc(150, 150, 140, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(150, 150, 140, 0, 2 * Math.PI);
    ctx.strokeStyle = institution.color || '#0056b3';
    ctx.lineWidth = 5;
    ctx.stroke();
    
    // Draw inner circle
    ctx.beginPath();
    ctx.arc(150, 150, 120, 0, 2 * Math.PI);
    ctx.strokeStyle = institution.color || '#0056b3';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw institution name
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Split text to fit in circle
    const words = institution.name.split(' ');
    let line = '';
    let lines = [];
    let y = 110;
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      if (ctx.measureText(testLine).width > 200) {
        lines.push(line);
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);
    
    // Draw each line
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 150, y + i * 25);
    }
    
    // Draw verification text
    ctx.font = '16px Arial';
    ctx.fillText(i18next.t('document.verified'), 150, 200);
    
    // Draw verification date
    const verificationDate = DateTime.fromJSDate(new Date(institution.verificationDate))
      .toFormat('dd MMM yyyy');
    ctx.font = '14px Arial';
    ctx.fillText(verificationDate, 150, 220);
    
    // Try to load institution logo if available
    try {
      if (institution.logoUrl) {
        const logo = await loadImage(institution.logoUrl);
        // Draw logo in the center
        const logoSize = 60;
        ctx.drawImage(logo, 150 - logoSize/2, 150 - logoSize/2, logoSize, logoSize);
      }
    } catch (err) {
      console.error('Failed to load institution logo:', err);
    }
    
    return canvas.toBuffer('image/png');
  }
  
  /**
   * Generate a credit passport document
   * @param {Object} passportData - Passport data
   * @param {Array} verifications - Verification data from institutions
   * @param {string} language - Document language
   * @param {string} templateName - Template name
   * @returns {Promise<Object>} Generated document data
   */
  async generateCreditPassport(passportData, verifications, language = 'en', templateName = 'standard') {
    // Set document language
    this.setLanguage(language);
    
    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: i18next.t('document.title'),
        Author: 'CreditBoost',
        Subject: i18next.t('document.subtitle'),
        Keywords: 'credit, passport, blockchain, verification',
        CreationDate: new Date(),
        ModDate: new Date()
      }
    });
    
    // Generate a unique filename
    const filename = `credit_passport_${passportData.passportNumber}_${new Date().getTime()}.pdf`;
    const filepath = path.join(this.outputDir, filename);
    
    // Create write stream
    const writeStream = fs.createWriteStream(filepath);
    doc.pipe(writeStream);
    
    // Add document security features
    doc.encrypt({
      userPassword: '',
      ownerPassword: passportData.securityToken,
      permissions: {
        printing: 'highResolution',
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: true,
        documentAssembly: false
      }
    });
    
    // Load template configuration
    const templateConfig = require(`${this.templatesDir}/${templateName}/config.json`);
    
    // Add header with logo
    const logoPath = path.join(this.assetsDir, 'logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 50, { width: 100 });
    }
    
    // Add document title
    doc.font('Helvetica-Bold')
       .fontSize(22)
       .fillColor('#00356B')
       .text(i18next.t('document.title'), { align: 'center' })
       .moveDown(0.5);
    
    // Add document subtitle
    doc.font('Helvetica')
       .fontSize(14)
       .fillColor('#666666')
       .text(i18next.t('document.subtitle'), { align: 'center' })
       .moveDown(1);
    
    // Add passport number and blockchain reference
    doc.font('Helvetica-Bold')
       .fontSize(10)
       .fillColor('#333333')
       .text(`${i18next.t('document.passportNumber')}: ${passportData.passportNumber}`, { align: 'right' })
       .font('Helvetica')
       .fontSize(8)
       .fillColor('#666666')
       .text(`${i18next.t('document.blockchainReference')}: ${passportData.blockchainId.substring(0, 16)}...`, { align: 'right' })
       .moveDown(1);
    
    // Add issuance and expiration dates
    const issuanceDate = DateTime.fromJSDate(new Date(passportData.issuanceDate))
      .setLocale(language)
      .toLocaleString(DateTime.DATE_FULL);
    
    const expirationDate = DateTime.fromJSDate(new Date(passportData.expirationDate))
      .setLocale(language)
      .toLocaleString(DateTime.DATE_FULL);
    
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#333333')
       .text(`${i18next.t('document.issuanceDate')}: ${issuanceDate}`)
       .text(`${i18next.t('document.expirationDate')}: ${expirationDate}`)
       .moveDown(1);
    
    // Add holder information section
    doc.font('Helvetica-Bold')
       .fontSize(14)
       .fillColor('#00356B')
       .text(i18next.t('document.holderInformation'))
       .moveDown(0.5);
    
    // Add holder data
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#333333');
    
    const holderInfo = [
      { label: i18next.t('document.name'), value: `${passportData.firstName} ${passportData.lastName}` },
      { label: i18next.t('document.nationalId'), value: passportData.nationalId },
      { label: i18next.t('document.address'), value: passportData.address },
      { label: i18next.t('document.country'), value: passportData.country }
    ];
    
    // Create holder information table
    holderInfo.forEach(info => {
      doc.font('Helvetica-Bold')
         .text(`${info.label}: `, { continued: true })
         .font('Helvetica')
         .text(info.value);
    });
    
    doc.moveDown(1);
    
    // Add credit score section
    doc.font('Helvetica-Bold')
       .fontSize(14)
       .fillColor('#00356B')
       .text(i18next.t('document.creditScoreSection'))
       .moveDown(0.5);
    
    // Add credit score
    doc.font('Helvetica-Bold')
       .fontSize(24)
       .fillColor(this.getCreditScoreColor(passportData.creditScore))
       .text(passportData.creditScore.toString(), { align: 'center' })
       .moveDown(0.5);
    
    // Add credit score range
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#666666')
       .text(i18next.t('document.scoreRange', { min: 300, max: 850 }), { align: 'center' })
       .moveDown(0.5);
    
    // Add risk level
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .fillColor('#333333')
       .text(`${i18next.t('document.riskLevel')}: ${i18next.t(`document.riskLevel_${passportData.riskLevel}`)}`, { align: 'center' })
       .moveDown(1);
    
    // Add credit factors
    if (passportData.creditFactors && passportData.creditFactors.length > 0) {
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .fillColor('#00356B')
         .text(i18next.t('document.creditFactors'), { align: 'left' })
         .moveDown(0.5);
      
      // Draw factor bars
      const factors = passportData.creditFactors;
      factors.forEach(factor => {
        // Factor name and status
        doc.font('Helvetica-Bold')
           .fontSize(10)
           .fillColor('#333333')
           .text(i18next.t(`document.factor_${factor.name}`), { continued: true });
        
        doc.font('Helvetica')
           .fontSize(10)
           .fillColor(this.getStatusColor(factor.status))
           .text(` - ${i18next.t(`document.status_${factor.status}`)}`, { align: 'left' });
        
        // Draw progress bar
        const barWidth = 200;
        const barHeight = 10;
        const barX = doc.x;
        const barY = doc.y + 5;
        
        // Background
        doc.rect(barX, barY, barWidth, barHeight)
           .fillColor('#e6e6e6')
           .fill();
        
        // Progress
        doc.rect(barX, barY, barWidth * (factor.percentage / 100), barHeight)
           .fillColor(this.getStatusColor(factor.status))
           .fill();
        
        // Percentage text
        doc.font('Helvetica')
           .fontSize(8)
           .fillColor('#666666')
           .text(`${factor.percentage}%`, barX + barWidth + 5, barY + 2);
        
        doc.moveDown(1);
      });
      
      doc.moveDown(1);
    }
    
    // Add verification stamps section
    if (verifications && verifications.length > 0) {
      doc.addPage();
      
      doc.font('Helvetica-Bold')
         .fontSize(16)
         .fillColor('#00356B')
         .text(i18next.t('document.verifications'), { align: 'center' })
         .moveDown(1);
      
      // Group verifications by institution
      const verificationsByInstitution = {};
      verifications.forEach(verification => {
        if (!verificationsByInstitution[verification.institution.name]) {
          verificationsByInstitution[verification.institution.name] = [];
        }
        verificationsByInstitution[verification.institution.name].push(verification);
      });
      
      // Draw institution stamps
      let stampX = 60;
      let stampY = doc.y + 20;
      const stampsPerRow = 2;
      let currentStamp = 0;
      
      for (const [institutionName, institutionVerifications] of Object.entries(verificationsByInstitution)) {
        const institution = institutionVerifications[0].institution;
        
        // Create institution stamp
        const stampBuffer = await this.createInstitutionStamp(institution);
        
        // Calculate position for current stamp
        const column = currentStamp % stampsPerRow;
        const row = Math.floor(currentStamp / stampsPerRow);
        const x = stampX + (column * 250);
        let y = stampY + (row * 320);
        
        // Start a new page if needed
        if (y > 700) {
          doc.addPage();
          y = 60;
          stampY = 60;
          currentStamp = 0;
        }
        
        // Add institution stamp
        doc.image(stampBuffer, x, y, { width: 200 });
        
        // Add verification types
        doc.font('Helvetica')
           .fontSize(10)
           .fillColor('#333333')
           .text(i18next.t('document.verifiedData'), x, y + 220);
        
        institutionVerifications.forEach((verification, index) => {
          doc.font('Helvetica')
             .fontSize(9)
             .fillColor('#333333')
             .text(`${index + 1}. ${i18next.t(`document.verificationType_${verification.type}`)}`, x + 10, y + 240 + (index * 15));
        });
        
        currentStamp++;
      }
      
      doc.moveDown(2);
    }
    
    // Add QR code for verification
    const qrCodeBuffer = await this.generateQRCode(passportData, this.config.verificationUrl);
    
    doc.addPage();
    
    doc.font('Helvetica-Bold')
       .fontSize(16)
       .fillColor('#00356B')
       .text(i18next.t('document.verifyAuthenticity'), { align: 'center' })
       .moveDown(1);
    
    // Add QR code in the center
    const pageWidth = doc.page.width;
    const qrCodeWidth = 200;
    const qrCodeX = (pageWidth - qrCodeWidth) / 2;
    
    doc.image(qrCodeBuffer, qrCodeX, doc.y, { width: qrCodeWidth });
    
    doc.moveDown(1);
    
    // Add verification instructions
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#333333')
       .text(i18next.t('document.scanQRCodeInstructions'), { align: 'center' })
       .moveDown(0.5);
    
    // Add verification link
    const verificationLink = `${this.config.verificationUrl}?id=${passportData.passportNumber}`;
    doc.text(i18next.t('document.verificationLinkText'), { align: 'center' })
       .font('Helvetica')
       .fillColor('#0066cc')
       .text(verificationLink, { align: 'center', link: verificationLink })
       .moveDown(2);
    
    // Add blockchain verification data
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .fillColor('#00356B')
       .text(i18next.t('document.blockchainVerification'), { align: 'center' })
       .moveDown(0.5);
    
    const blockchainInfo = [
      { label: i18next.t('document.blockchainNetwork'), value: 'Ethereum' },
      { label: i18next.t('document.contractAddress'), value: this.config.contractAddress },
      { label: i18next.t('document.tokenId'), value: passportData.tokenId },
      { label: i18next.t('document.blockchainId'), value: passportData.blockchainId },
      { label: i18next.t('document.lastVerified'), value: DateTime.fromJSDate(new Date(passportData.lastVerifiedAt)).toRelative({ locale: language }) }
    ];
    
    // Create blockchain verification table
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#333333');
    
    blockchainInfo.forEach(info => {
      doc.font('Helvetica-Bold')
         .text(`${info.label}: `, { continued: true })
         .font('Helvetica')
         .text(info.value);
    });
    
    // Add digital signature verification
    if (passportData.digitalSignature) {
      doc.moveDown(1);
      
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .fillColor('#00356B')
         .text(i18next.t('document.digitalSignature'), { align: 'center' })
         .moveDown(0.5);
      
      doc.font('Helvetica')
         .fontSize(8)
         .fillColor('#333333')
         .text(passportData.digitalSignature, { align: 'center' })
         .moveDown(0.5);
    }
    
    // Add document watermark on each page
    const watermarkBuffer = await this.createWatermark(i18next.t('document.watermarkText'));
    
    // Loop through pages to add watermark
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.image(watermarkBuffer, 150, 250, { width: 300, opacity: 0.2 });
    }
    
    // Add footer with page numbers
    const totalPages = range.start + range.count;
    for (let i = range.start; i < totalPages; i++) {
      doc.switchToPage(i);
      const pageNumberText = i18next.t('document.pageNumber', { page: i + 1, total: totalPages });
      
      doc.font('Helvetica')
         .fontSize(8)
         .fillColor('#666666')
         .text(
           pageNumberText, 
           doc.page.margins.left, 
           doc.page.height - doc.page.margins.bottom - 20,
           { align: 'center' }
         );
      
      // Add document security footer
      const securityText = i18next.t('document.securityFooter');
      doc.font('Helvetica')
         .fontSize(6)
         .fillColor('#999999')
         .text(
           securityText, 
           doc.page.margins.left, 
           doc.page.height - doc.page.margins.bottom - 10,
           { align: 'center' }
         );
    }
    
    // Finalize document
    doc.end();
    
    // Wait for the file to be written
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    
    // Upload document to IPFS
    let ipfsHash = null;
    try {
      const fileBuffer = fs.readFileSync(filepath);
      const result = await this.ipfs.add(fileBuffer);
      ipfsHash = result.path;
      
      // Add document metadata
      const metadataObject = {
        passportNumber: passportData.passportNumber,
        tokenId: passportData.tokenId,
        blockchainId: passportData.blockchainId,
        issuanceDate: passportData.issuanceDate,
        expirationDate: passportData.expirationDate,
        documentType: 'credit_passport',
        version: '1.0',
        language: language,
        template: templateName,
        contentHash: this.calculateFileHash(filepath),
        mimeType: 'application/pdf'
      };
      
      // Add metadata to IPFS
      const metadataBuffer = Buffer.from(JSON.stringify(metadataObject));
      const metadataResult = await this.ipfs.add(metadataBuffer);
      const metadataHash = metadataResult.path;
      
      return {
        filename,
        filepath,
        ipfsHash,
        metadataHash,
        documentHash: this.calculateFileHash(filepath),
        url: `ipfs://${ipfsHash}`,
        metadataUrl: `ipfs://${metadataHash}`
      };
    } catch (error) {
      console.error('Failed to upload to IPFS:', error);
      
      // Return local file information if IPFS upload fails
      return {
        filename,
        filepath,
        documentHash: this.calculateFileHash(filepath)
      };
    }
  }
  
  /**
   * Calculate hash of a file for verification
   * @param {string} filepath - Path to the file
   * @returns {string} SHA-256 hash of the file
   */
  calculateFileHash(filepath) {
    const fileBuffer = fs.readFileSync(filepath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  }
  
  /**
   * Get color based on credit score
   * @param {number} score - Credit score
   * @returns {string} Color hex code
   */
  getCreditScoreColor(score) {
    if (score < 580) return '#e53e3e'; // Poor (red)
    if (score < 670) return '#ed8936'; // Fair (orange)
    if (score < 740) return '#ecc94b'; // Good (yellow)
    if (score < 800) return '#48bb78'; // Very good (green)
    return '#38a169'; // Excellent (darker green)
  }
  
  /**
   * Get color based on status
   * @param {string} status - Status (excellent, good, fair, poor)
   * @returns {string} Color hex code
   */
  getStatusColor(status) {
    switch (status) {
      case 'excellent': return '#38a169'; // green
      case 'good': return '#48bb78'; // light green
      case 'fair': return '#ecc94b'; // yellow
      case 'poor': return '#e53e3e'; // red
      default: return '#718096'; // gray
    }
  }
  
  /**
   * Verify the authenticity of a document
   * @param {string} documentHash - Hash of the document
   * @param {string} tokenId - Token ID on blockchain
   * @returns {Promise<boolean>} Whether the document is authentic
   */
  async verifyDocumentAuthenticity(documentHash, tokenId) {
    try {
      // Create contract instance
      const contract = new ethers.Contract(
        this.config.contractAddress,
        this.config.contractAbi,
        this.provider
      );
      
      // Call verifyDocumentIntegrity method on the contract
      const isAuthentic = await contract.verifyDocumentIntegrity(tokenId, documentHash);
      return isAuthentic;
    } catch (error) {
      console.error('Error verifying document authenticity:', error);
      return false;
    }
  }
  
  /**
   * Create a digital signature for a document
   * @param {string} documentHash - Hash of the document
   * @param {string} privateKey - Private key for signing
   * @returns {string} Digital signature
   */
  createDigitalSignature(documentHash, privateKey) {
    try {
      const wallet = new ethers.Wallet(privateKey);
      const messageHash = ethers.utils.id(documentHash);
      const messageHashBytes = ethers.utils.arrayify(messageHash);
      const signature = wallet.signMessage(messageHashBytes);
      return signature;
    } catch (error) {
      console.error('Error creating digital signature:', error);
      throw error;
    }
  }
  
  /**
   * Verify a digital signature
   * @param {string} documentHash - Hash of the document
   * @param {string} signature - Digital signature
   * @param {string} publicAddress - Address of the signer
   * @returns {boolean} Whether the signature is valid
   */
  verifyDigitalSignature(documentHash, signature, publicAddress) {
    try {
      const messageHash = ethers.utils.id(documentHash);
      const messageHashBytes = ethers.utils.arrayify(messageHash);
      const recoveredAddress = ethers.utils.verifyMessage(messageHashBytes, signature);
      return recoveredAddress.toLowerCase() === publicAddress.toLowerCase();
    } catch (error) {
      console.error('Error verifying digital signature:', error);
      return false;
    }
  }
}

module.exports = DocumentGenerationService;

