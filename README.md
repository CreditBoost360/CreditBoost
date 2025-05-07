# CreditBoost Platform

## Overview

CreditBoost is a comprehensive financial platform designed to help users understand, manage, and improve their credit profiles. The platform integrates with multiple credit bureaus and payment systems to provide users with insights into their financial data and opportunities for credit improvement.

## Key Features

- **Credit Data Analysis**: Integration with TransUnion, Experian, Equifax, and M-Pesa
- **AI-Powered Data Chat**: Interactive chat interface for querying financial data
- **Credit Passport**: Portable credit identity for users
- **Financial Education**: Learning modules and quizzes to improve financial literacy
- **Community Support**: User communities for shared financial goals
- **MicroFinance Access**: Connect users with appropriate financial products
- **Transparency System**: Audit logs and verification for all administrative actions

## Tech Stack

### Frontend
- React.js with Vite
- React Router for navigation
- Tailwind CSS with Shadcn UI components
- Lucide React for icons

### Backend
- Node.js Express API server
- Java SpringBoot services
- Supabase for authentication and database
- JWT for secure token-based authentication

### Security Features
- Multi-factor authentication
- Device fingerprinting
- Rate limiting
- CSRF and XSS protection
- Encryption for sensitive data

## Project Structure

```
CreditBoost/
├── api/                  # Node.js Express API server
│   ├── src/              # Source code
│   │   ├── auth/         # Authentication modules
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic services
│   │   ├── payments/     # Payment processing modules
│   │   └── security/     # Security implementations
├── frontEnd/
│   └── credit-boost/     # React frontend application
│       ├── src/
│       │   ├── components/  # Reusable UI components
│       │   ├── pages/       # Application pages
│       │   ├── services/    # API client services
│       │   ├── context/     # React context providers
│       │   └── hooks/       # Custom React hooks
├── server/
│   └── Backend SpringBoot/  # Java backend services
└── sdk/                     # Client SDK for API integration
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- Java JDK 17
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/CreditBoost.git
   cd CreditBoost
   ```

2. Set up environment variables:
   ```
   cp api/.env.example api/.env
   # Edit the .env file with your configuration
   ```

3. Install API dependencies:
   ```
   cd api
   npm install
   ```

4. Install frontend dependencies:
   ```
   cd ../frontEnd/credit-boost
   npm install
   ```

5. Set up the database:
   ```
   cd ../../server/Backend\ SpringBoot/
   ./setup-postgres.sh
   ```

### Running the Application

1. Start the API server:
   ```
   cd api
   npm start
   ```

2. Start the frontend development server:
   ```
   cd ../frontEnd/credit-boost
   npm run dev
   ```

3. Start the Java backend services:
   ```
   cd ../../server/Backend\ SpringBoot/
   ./run-app.sh
   ```

## Security Considerations

- All API endpoints require proper authentication
- Sensitive data is encrypted at rest and in transit
- Rate limiting is implemented to prevent abuse
- Regular security audits are recommended

## Development Guidelines

- Follow the established code structure and patterns
- Use the provided security middleware for all new endpoints
- Write tests for new features
- Document API changes

## License

[Specify your license here]

## Contact

[Your contact information]