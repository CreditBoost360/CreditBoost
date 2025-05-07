/**
 * Configuration Index
 * 
 * This file exports all configuration modules for easy access.
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Export configuration modules
module.exports = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development',
    corsOrigins: (process.env.CORS_ORIGINS || '*').split(','),
    apiPrefix: process.env.API_PREFIX || '/api/v1',
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10) // 100 requests per minute
    }
  },
  
  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'creditboost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_SSL === 'true',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10)
  },
  
  // Authentication configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10),
    mfa: {
      enabled: process.env.MFA_ENABLED === 'true',
      issuer: process.env.MFA_ISSUER || 'CreditBoost',
      window: parseInt(process.env.MFA_WINDOW || '1', 10)
    }
  },
  
  // Payment configuration
  payment: require('./payment'),
  
  // Email configuration
  email: {
    enabled: process.env.EMAIL_ENABLED !== 'false',
    from: process.env.EMAIL_FROM || 'noreply@creditboost.com',
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY
    },
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    }
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    filename: process.env.LOG_FILE || 'creditboost-api.log',
    maxSize: parseInt(process.env.LOG_MAX_SIZE || '10485760', 10), // 10MB
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10)
  },
  
  // Credit scoring configuration
  creditScoring: {
    minScore: parseInt(process.env.MIN_CREDIT_SCORE || '300', 10),
    maxScore: parseInt(process.env.MAX_CREDIT_SCORE || '850', 10),
    defaultScore: parseInt(process.env.DEFAULT_CREDIT_SCORE || '600', 10),
    providers: {
      internal: {
        enabled: process.env.INTERNAL_CREDIT_SCORING_ENABLED !== 'false'
      },
      experian: {
        enabled: process.env.EXPERIAN_ENABLED === 'true',
        apiKey: process.env.EXPERIAN_API_KEY,
        clientId: process.env.EXPERIAN_CLIENT_ID,
        clientSecret: process.env.EXPERIAN_CLIENT_SECRET
      },
      equifax: {
        enabled: process.env.EQUIFAX_ENABLED === 'true',
        apiKey: process.env.EQUIFAX_API_KEY,
        clientId: process.env.EQUIFAX_CLIENT_ID,
        clientSecret: process.env.EQUIFAX_CLIENT_SECRET
      },
      transunion: {
        enabled: process.env.TRANSUNION_ENABLED === 'true',
        apiKey: process.env.TRANSUNION_API_KEY,
        username: process.env.TRANSUNION_USERNAME,
        password: process.env.TRANSUNION_PASSWORD
      }
    }
  },
  
  // Storage configuration
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    local: {
      directory: process.env.LOCAL_STORAGE_DIR || 'uploads'
    },
    s3: {
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION || 'us-east-1',
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    },
    gcs: {
      bucket: process.env.GCS_BUCKET,
      keyFilename: process.env.GCS_KEY_FILENAME
    }
  }
};