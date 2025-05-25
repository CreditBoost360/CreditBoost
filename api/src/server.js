import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { applySecurityMiddleware, initializeSecurity } from './security/index.js';
import { config } from './config.js';
import authRoutes from './routes/authRoutes.js';

// Initialize Express app
const app = express();
const PORT = config.port;

// Initialize security components
initializeSecurity().catch(error => {
  console.error('Security initialization failed:', error);
  // Don't exit process, just log the error
  console.error('Continuing despite security initialization failure');
});

// Basic middleware
app.use(express.json({
  verify: (req, res, buf) => {
    try {
      // Store the raw body for debugging
      req.rawBody = buf.toString();
      console.log('Raw request body:', req.rawBody);
    } catch (e) {
      console.error('Error parsing request body:', e);
    }
  }
}));
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '***';
    console.log('Body:', sanitizedBody);
  }
  next();
});

// CORS middleware - simplified configuration
app.use(cors({
  origin: 'http://localhost:5173', // Explicitly set the allowed origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-CSRF-Token', 'X-Device-Fingerprint', 'X-Nonce', 'X-Timestamp']
}));

// Apply security middleware with reduced settings
try {
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for now
    crossOriginEmbedderPolicy: false, // Disable COEP for now
    crossOriginOpenerPolicy: false, // Disable COOP for now
    crossOriginResourcePolicy: false // Disable CORP for now
  }));
} catch (error) {
  console.error('Error applying helmet middleware:', error);
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'CreditBoost API is running' });
});

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  // Set CSRF cookie
  res.cookie('XSRF-TOKEN', require('crypto').randomBytes(20).toString('hex'), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.status(200).json({ message: 'CSRF token set' });
});

// Test CORS route
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS test successful',
    origin: req.headers.origin || 'No origin header found'
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Send detailed error in development
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});