# Universal Credit Passport

A blockchain-based digital identity system for securely storing and sharing credit history.

## Fixed Issues

- Fixed TypeScript type errors in routes and controllers
- Added proper error handling for file uploads
- Enhanced security for file uploads with type validation and size limits
- Improved TypeScript configuration
- Added comprehensive type definitions

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Truffle (for blockchain development)

### Installation

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build

# Start the server
npm start
```

### Development

```bash
# Run in development mode with hot reloading
npm run dev

# Run tests
npm test

# Deploy smart contracts
npm run migrate
```

## API Endpoints

- `POST /api/users/onboard` - Onboard a new user
- `POST /api/passport/create` - Create a new credit passport
- `PUT /api/passport/score` - Update a credit score
- `GET /api/passport/:userAddress` - Get a credit passport
- `POST /api/passport/:userAddress/kyc` - Upload KYC documents
- `POST /api/passport/fraud-check` - Check for fraudulent activity

## Security Features

- File type validation for uploads
- File size limits
- Secure error handling
- Comprehensive audit logging

