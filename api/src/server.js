import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { applySecurityMiddleware, initializeSecurity } from './security/index.js';
import { encryption } from './encryption.js';
import { config } from './config.js';
import authRoutes from './routes/authRoutes.js';

// Initialize Express app
const app = express();
const PORT = config.port;

// Initialize security components
initializeSecurity().catch(error => {
  console.error('Security initialization failed:', error);
  process.exit(1);
});

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply security middleware
applySecurityMiddleware(app, {
  headers: {
    // Allow specific scripts if needed for your application
    allowScripts: '',
    // Allow specific styles if needed for your application
    allowStyles: ''
  },
  cache: {
    noStore: true
  },
  xss: {
    skipFields: ['encryptedData'] // Skip XSS protection for already encrypted fields
  },
  csrfExcludePaths: ['/api/webhook'] // Exclude webhooks from CSRF protection
});

// CORS configuration - ensure it's applied before routes
app.use(cors({
  origin: config.allowedOrigins.length > 0 ? config.allowedOrigins : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Device-Fingerprint', 'X-Nonce', 'X-Timestamp', 'X-Requested-With'],
  exposedHeaders: ['X-Token-Expiring', 'X-Timestamp'],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'CreditBoost API is running securely' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't expose error details in production
  const message = config.nodeEnv === 'production' 
    ? 'An error occurred' 
    : err.message;
  
  res.status(err.status || 500).json({
    error: message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});