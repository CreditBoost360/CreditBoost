/**
 * File utility functions for handling file operations
 */

/**
 * Get the file extension from a file name
 * @param {string} fileName - The name of the file
 * @returns {string} The file extension (without the dot)
 */
export const getFileExtension = (fileName) => {
  if (!fileName) return '';
  return fileName.split('.').pop().toLowerCase();
};

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Check if a file is an image
 * @param {File} file - The file to check
 * @returns {boolean} True if the file is an image
 */
export const isImageFile = (file) => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  return imageTypes.includes(file.type);
};

/**
 * Check if a file is a document (PDF, Word, Excel, etc.)
 * @param {File} file - The file to check
 * @returns {boolean} True if the file is a document
 */
export const isDocumentFile = (file) => {
  const docTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ];
  return docTypes.includes(file.type);
};

/**
 * Get a file icon based on file type
 * @param {File|string} file - The file or file type
 * @returns {string} Icon name for the file type
 */
export const getFileIcon = (file) => {
  const fileType = typeof file === 'string' ? file : file.type;
  const fileName = typeof file === 'string' ? file : file.name;
  const extension = getFileExtension(fileName);
  
  // Image files
  if (fileType.startsWith('image/')) {
    return 'mdi:file-image';
  }
  
  // Document files
  if (fileType === 'application/pdf') {
    return 'mdi:file-pdf';
  }
  
  if (fileType.includes('word') || fileType.includes('wordprocessing')) {
    return 'mdi:file-word';
  }
  
  if (fileType.includes('excel') || fileType.includes('spreadsheet') || extension === 'csv') {
    return 'mdi:file-excel';
  }
  
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
    return 'mdi:file-powerpoint';
  }
  
  if (fileType === 'text/plain') {
    return 'mdi:file-document';
  }
  
  // Archive files
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar') || 
      fileType.includes('gzip') || fileType.includes('7z')) {
    return 'mdi:file-zip';
  }
  
  // Audio files
  if (fileType.startsWith('audio/')) {
    return 'mdi:file-music';
  }
  
  // Video files
  if (fileType.startsWith('video/')) {
    return 'mdi:file-video';
  }
  
  // Code files
  const codeExtensions = ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'json', 'xml', 
                          'py', 'java', 'c', 'cpp', 'cs', 'php', 'rb', 'go', 'rust'];
  if (codeExtensions.includes(extension)) {
    return 'mdi:file-code';
  }
  
  // Default file icon
  return 'mdi:file';
};

/**
 * Read a file as text
 * @param {File} file - The file to read
 * @returns {Promise<string>} The file contents as text
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

/**
 * Read a file as data URL
 * @param {File} file - The file to read
 * @returns {Promise<string>} The file contents as data URL
 */
export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Validate file size
 * @param {File} file - The file to validate
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {boolean} True if the file size is valid
 */
export const validateFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

/**
 * Validate file type
 * @param {File} file - The file to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean} True if the file type is valid
 */
export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file extension
 * @param {File} file - The file to validate
 * @param {string[]} allowedExtensions - Array of allowed file extensions (without the dot)
 * @returns {boolean} True if the file extension is valid
 */
export const validateFileExtension = (file, allowedExtensions) => {
  const extension = getFileExtension(file.name);
  return allowedExtensions.includes(extension);
};