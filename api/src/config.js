import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
const result = dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (result.error) {
  console.error('Error loading .env file:', result.error);
  throw new Error('Failed to load environment variables');
}

// Validate critical environment variables
const requiredEnvVars = [
  'ENCRYPTION_KEY',
  'JWT_SECRET',
  'SESSION_SECRET',
  'COOKIE_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`CRITICAL ERROR: ${envVar} environment variable is not set!`);
    throw new Error(`${envVar} must be set in environment variables`);
  }
}

// Export configuration
export const config = {
  port: 3000, // Hardcoded to 3000 to ensure consistency
  nodeEnv: process.env.NODE_ENV || 'development',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000,https://credvault.co.ke').split(','),
  encryption: {
    key: process.env.ENCRYPTION_KEY
  },
  security: {
    cookieSecret: process.env.COOKIE_SECRET,
    sessionSecret: process.env.SESSION_SECRET,
    jwtSecret: process.env.JWT_SECRET,
    tokenIssuer: process.env.TOKEN_ISSUER || 'creditboost.app'
  },
  database: {
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/creditboost'
  },
  api: {
    url: process.env.API_URL || 'http://localhost:3000'
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@creditboost.app'
  }
};

export default config;