# CreditBoost API: The Engine Behind the App

## What This Does

This is the behind-the-scenes engine that powers the CreditBoost app. It handles:
- User accounts and logins
- Secure connections to credit bureaus
- Data processing and analysis
- Security and privacy protection

## Ways to Log In

We offer multiple secure ways for users to access their accounts:

### 1. Email and Password
The traditional username and password login.

### 2. Google Account
Quick login using your Google account.

### 3. Text Message Code
We send a one-time code to your phone.

### 4. Email Code
We send a one-time code to your email.

## For Developers: Setting Up

To make this work on your computer, you need to set up some secret keys and configuration settings in a file called `.env`:

```
# Security keys (keep these secret!)
ENCRYPTION_KEY=your-secret-key
JWT_SECRET=another-secret-key
SESSION_SECRET=yet-another-secret
COOKIE_SECRET=one-more-secret

# Supabase connection (our database)
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key

# Email settings (for sending notifications)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email-user
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreply@creditboost.app
```

## Getting Started

1. Install all the necessary components:
   ```
   npm install
   ```

2. Set up your configuration:
   ```
   cp .env.example .env
   # Then edit the .env file with your information
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Security Features

We take security seriously and have implemented:
- Protection against cross-site request forgery (CSRF)
- Protection against cross-site scripting (XSS)
- Strong encryption for sensitive data
- Limits on how many requests can be made (rate limiting)
- Device recognition for suspicious login attempts
- Secure authentication tokens

## License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2023 CreditBoost

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```