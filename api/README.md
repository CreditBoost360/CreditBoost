# CreditBoost API

Secure API for the CreditBoost application.

## Authentication Methods

The CreditBoost API supports multiple authentication methods:

### 1. Email/Password Authentication

Standard email and password authentication using Supabase.

```
POST /auth/register
POST /auth/login
```

### 2. Google OAuth Authentication

Sign in with Google account.

```
GET /auth/google
GET /auth/callback/google
POST /auth/google/verify
```

### 3. SMS OTP Authentication

One-time password authentication via SMS.

```
POST /auth/otp/sms/send
POST /auth/otp/sms/verify
```

### 4. Email OTP Authentication

One-time password authentication via email.

```
POST /auth/otp/email/send
POST /auth/otp/email/verify
```

## Environment Setup

Make sure to set up the following environment variables in your `.env` file:

```
# Required for encryption
ENCRYPTION_KEY=your-encryption-key

# Required for authentication
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
COOKIE_SECRET=your-cookie-secret

# Supabase configuration
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key

# Email configuration (for production)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email-user
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreply@creditboost.app
```

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   ```
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Security Features

- CSRF protection
- XSS protection
- Secure encryption
- Rate limiting
- Device fingerprinting
- JWT with enhanced security