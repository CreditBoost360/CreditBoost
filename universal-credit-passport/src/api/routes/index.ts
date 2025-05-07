import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import IndexController from '../controllers/index';
import CreditPassportController from '../controllers/creditPassportController';
// Import multer directly without using namespace import
import multer from 'multer';

// Configure multer for file uploads with security enhancements
const storage = multer.memoryStorage();
const fileFilter = (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    // Accept only specific file types
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error('Only JPEG, PNG, and PDF files are allowed'));
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

export const setRoutes = (app: Express): void => {
    const indexController = new IndexController();
    const creditPassportController = new CreditPassportController();
    
    // Helper function to wrap controller methods
    const asyncHandler = (fn: (req: Request, res: Response) => Promise<any>): RequestHandler => 
        (req: Request, res: Response, next: NextFunction) => {
            Promise.resolve(fn(req, res)).catch(next);
        };
    
    // Base routes
    app.post('/api/users/onboard', asyncHandler(indexController.onboardUser));
    app.post('/api/passport/share', asyncHandler(indexController.shareCreditPassport));
    app.post('/api/credit/verify', asyncHandler(indexController.verifyCreditData));
    
    // Credit Passport routes
    app.post('/api/passport/create', asyncHandler(creditPassportController.createPassport));
    app.put('/api/passport/score', asyncHandler(creditPassportController.updateScore));
    app.get('/api/passport/:userAddress', asyncHandler(creditPassportController.getCreditPassport));
    
    // Enhanced file upload route with error handling
    app.post('/api/passport/:userAddress/kyc', (req: Request, res: Response, next: NextFunction) => {
        upload.array('documents')(req, res, (err: any) => {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading
                return res.status(400).json({ 
                    error: true, 
                    message: `Upload error: ${err.message}` 
                });
            } else if (err) {
                // An unknown error occurred
                return res.status(500).json({ 
                    error: true, 
                    message: `Server error: ${err.message}` 
                });
            }
            
            // Everything went fine, proceed with controller
            creditPassportController.uploadKYCDocuments(req, res).catch(next);
        });
    });
    
    app.post('/api/passport/fraud-check', asyncHandler(creditPassportController.checkFraud));
    
    // Health check route
    app.get('/health', (req: Request, res: Response) => {
        res.status(200).json({ status: 'ok' });
    });
};