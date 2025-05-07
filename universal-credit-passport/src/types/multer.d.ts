import multer from 'multer';

declare module 'multer' {
  interface File {
    // Add any custom properties you need for multer File objects
    ipfsHash?: string;
    verificationStatus?: string;
  }
}