import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRY: z.string().default('24h'),
  REDIS_URL: z.string().optional(),
  BLOCKCHAIN_RPC_URL: z.string(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  API_RATE_LIMIT: z.string().transform(Number).default('100'),
  API_RATE_WINDOW: z.string().transform(Number).default('900'), // 15 minutes
  MAX_LOGIN_ATTEMPTS: z.string().transform(Number).default('5'),
  ACCOUNT_LOCKOUT_TIME: z.string().transform(Number).default('900'), // 15 minutes
});

export const env = envSchema.parse(process.env);

export const ROLES = {
  CUSTOMER: 'customer',
  ORGANIZATION: 'organization',
  DEVELOPER: 'developer',
  ADMIN: 'admin'
} as const;

export const PERMISSIONS = {
  READ_CREDIT_SCORE: 'read:credit_score',
  WRITE_CREDIT_SCORE: 'write:credit_score',
  MANAGE_USERS: 'manage:users',
  ACCESS_API: 'access:api',
  MANAGE_ORGANIZATIONS: 'manage:organizations',
  VIEW_AUDIT_LOGS: 'view:audit_logs',
  MANAGE_SYSTEM: 'manage:system'
} as const;

export const ROLE_PERMISSIONS = {
  [ROLES.CUSTOMER]: [
    PERMISSIONS.READ_CREDIT_SCORE
  ],
  [ROLES.ORGANIZATION]: [
    PERMISSIONS.READ_CREDIT_SCORE,
    PERMISSIONS.WRITE_CREDIT_SCORE,
    PERMISSIONS.MANAGE_USERS
  ],
  [ROLES.DEVELOPER]: [
    PERMISSIONS.READ_CREDIT_SCORE,
    PERMISSIONS.ACCESS_API
  ],
  [ROLES.ADMIN]: Object.values(PERMISSIONS)
} as const;
