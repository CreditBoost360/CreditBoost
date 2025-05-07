import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileTypeFromBuffer } from 'file-type';
import sanitizeFilename from 'sanitize-filename';
import sharp from 'sharp';
import { AppError } from './errorHandler.js';
import { encryption } from './encryption.js';
import ExcelJS from 'exceljs';
import { parse } from 'csv-parse';

// Supported file types and their configurations
const FILE_TYPES = {
    'credit-data': {
        mimeTypes: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        maxSize: 5 * 1024 * 1024, // 5MB
        extensions: ['.csv', '.xls', '.xlsx']
    },
    'profile-photo': {
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSize: 2 * 1024 * 1024, // 2MB
        extensions: ['.jpg', '.jpeg', '.png', '.webp']
    },
    'document': {
        mimeTypes: ['application/pdf'],
        maxSize: 10 * 1024 * 1024, // 10MB
        extensions: ['.pdf']
    }
};

// File validation middleware
const validateFile = (fileType) => async (req, file, cb) => {
    try {
        const config = FILE_TYPES[fileType];
        if (!config) {
            return cb(new AppError('Invalid file type configuration', 400));
        }

        // Check file extension
        const ext = path.extname(file.originalname).toLowerCase();
        if (!config.extensions.includes(ext)) {
            return cb(new AppError(`Only ${config.extensions.join(', ')} files are allowed`, 400));
        }

        // Check MIME type
        if (!config.mimeTypes.includes(file.mimetype)) {
            return cb(new AppError('Invalid file type', 400));
        }

        // Validate file name
        const sanitizedName = sanitizeFilename(file.originalname);
        if (sanitizedName !== file.originalname) {
            return cb(new AppError('Invalid filename', 400));
        }

        cb(null, true);
    } catch (error) {
        cb(error);
    }
};

// Secure storage configuration
const createStorage = (fileType) => {
    return multer.diskStorage({
        destination: async (req, file, cb) => {
            const uploadDir = path.join(process.cwd(), 'uploads', fileType);
            try {
                await fs.access(uploadDir);
            } catch {
                await fs.mkdir(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            // Generate secure random filename
            const uniqueSuffix = encryption.generateToken(16);
            const ext = path.extname(file.originalname).toLowerCase();
            const timestamp = Date.now();
            cb(null, `${timestamp}-${uniqueSuffix}${ext}`);
        }
    });
};

// Process uploaded images
const processImage = async (filePath, options = {}) => {
    try {
        const image = sharp(filePath);
        
        // Get image metadata
        const metadata = await image.metadata();
        
        // Validate image dimensions
        if (metadata.width > 4096 || metadata.height > 4096) {
            throw new AppError('Image dimensions too large', 400);
        }

        // Process image based on type
        if (options.isProfilePhoto) {
            // Resize and optimize profile photos
            await image
                .resize(200, 200, { fit: 'cover' })
                .webp({ quality: 80 })
                .toFile(filePath.replace(/\.[^/.]+$/, '.webp'));
            
            // Delete original file
            await fs.unlink(filePath);
            
        } else {
            // General image optimization
            await image
                .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 85 })
                .toFile(filePath.replace(/\.[^/.]+$/, '.webp'));
            
            // Delete original file
            await fs.unlink(filePath);
        }
    } catch (error) {
        throw new AppError('Image processing failed', 500);
    }
};

// Handle Excel file processing
export const processExcelFile = async (filePath) => {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);

        const worksheet = workbook.getWorksheet(1);
        const data = [];

        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header row
            const rowData = {};
            row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
                const header = worksheet.getRow(1).getCell(colNumber).value;
                rowData[header] = cell.value;
            });
            data.push(rowData);
        });

        // Clean up the file after processing
        await fs.unlink(filePath);
        return data;
    } catch (error) {
        // Clean up on error
        try {
            await fs.unlink(filePath);
        } catch (unlinkError) {
            console.error('Error cleaning up file:', unlinkError);
        }
        throw new AppError('Failed to process Excel file', 500);
    }
};

// Handle CSV file processing
export const processCsvFile = async (filePath) => {
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return new Promise((resolve, reject) => {
            const data = [];
            const parser = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true
            });

            parser.on('readable', function() {
                let record;
                while (record = this.read()) {
                    // Sanitize each field
                    Object.keys(record).forEach(key => {
                        record[key] = typeof record[key] === 'string' 
                            ? sanitize.xss(record[key])
                            : record[key];
                    });
                    data.push(record);
                }
            });

            parser.on('error', (error) => {
                fs.unlink(filePath).catch(console.error);
                reject(new AppError('Failed to parse CSV file', 500));
            });

            parser.on('end', () => {
                fs.unlink(filePath).catch(console.error);
                resolve(data);
            });
        });
    } catch (error) {
        await fs.unlink(filePath).catch(console.error);
        throw new AppError('Failed to process CSV file', 500);
    }
};

// Create multer upload instances for different file types
export const uploads = {
    creditData: multer({
        storage: createStorage('credit-data'),
        fileFilter: validateFile('credit-data'),
        limits: {
            fileSize: FILE_TYPES['credit-data'].maxSize
        }
    }),

    profilePhoto: multer({
        storage: createStorage('profile-photo'),
        fileFilter: validateFile('profile-photo'),
        limits: {
            fileSize: FILE_TYPES['profile-photo'].maxSize
        }
    }),

    document: multer({
        storage: createStorage('document'),
        fileFilter: validateFile('document'),
        limits: {
            fileSize: FILE_TYPES['document'].maxSize
        }
    })
};

// File type validation middleware
export const validateFileType = async (filePath) => {
    try {
        const buffer = await fs.readFile(filePath);
        const fileType = await fileTypeFromBuffer(buffer);
        
        if (!fileType) {
            throw new AppError('Unable to determine file type', 400);
        }

        // Check if file type matches any allowed configurations
        let isValid = false;
        for (const config of Object.values(FILE_TYPES)) {
            if (config.mimeTypes.includes(fileType.mime)) {
                isValid = true;
                break;
            }
        }

        if (!isValid) {
            throw new AppError('Invalid file type detected', 400);
        }

        return fileType;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('File validation failed', 500);
    }
};

// Handle file upload errors
export const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                status: 'error',
                code: 'FILE_TOO_LARGE',
                message: 'File size exceeds limit'
            });
        }
        return res.status(400).json({
            status: 'error',
            code: 'UPLOAD_ERROR',
            message: error.message
        });
    }

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            status: 'error',
            code: error.code,
            message: error.message
        });
    }

    next(error);
};

// Clean up files on error
export const cleanupOnError = async (req, res, next) => {
    res.on('finish', async () => {
        if (res.statusCode >= 400 && req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (error) {
                console.error('Error cleaning up file:', error);
            }
        }
    });
    next();
};