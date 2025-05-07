# CreditBoost: Your Credit Improvement Companion

## What is CreditBoost?

CreditBoost is a simple but powerful app that helps you understand and improve your credit score. Think of it as a personal financial coach that lives in your phone or computer.

## What Does It Actually Do?

1. **Shows Your Credit Score**: Connects to credit bureaus (TransUnion, Experian, Equifax) to show your current score in one place.

2. **Explains Your Score**: Uses AI to explain in plain language why your score is what it is and what affects it.

3. **Helps You Improve**: Gives you step-by-step actions to take that can improve your score over time.

4. **Keeps Your Information Safe**: Uses bank-level security to protect all your financial data.

5. **Creates a "Credit Passport"**: Makes a secure digital version of your credit history that you can share when needed (like when applying for loans).

6. **Teaches About Money**: Includes simple lessons about credit, loans, and saving money.

## Who Is This For?

- People who want to improve their credit score
- Anyone confused about how credit works
- People applying for loans or mortgages
- Anyone who wants to better understand their financial standing

## How It Works (In Simple Terms)

1. You create an account and securely connect your credit information
2. The app analyzes your credit history and current standing
3. You get a dashboard showing your score and what affects it
4. The app suggests specific actions to improve your score
5. You can track your progress over time

---

# For Developers

## Tech Stack Overview

- **Frontend**: 
  - React.js with Vite for fast development
  - Tailwind CSS with Shadcn UI components for styling
  - React Router for navigation
  - Lucide React for icons

- **Backend**: 
  - Node.js Express API server for main services
  - Java SpringBoot for specialized financial processing
  - Supabase for authentication and database
  - JWT for secure token-based authentication

- **Security**: 
  - Multi-factor authentication
  - Device fingerprinting
  - Rate limiting
  - CSRF and XSS protection
  - Encryption for sensitive data

- **Blockchain**:
  - Universal Credit Passport implementation
  - Smart contracts for secure credit data

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
├── universal-credit-passport/ # Blockchain credit passport
└── sdk/                     # Client SDK for API integration
```

## Development Setup

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

## API Documentation

For detailed API documentation, see the [API README](./api/README.md).

## Contributing

Please see our [Workflow Guide](./Workflow.md) for information on how to contribute to this project.

---

# General Information

## Getting Started (For Users)

Visit [www.creditboost.com](http://www.creditboost.com) to create your account or download the app from your app store.

## License

This project is licensed under the MIT License - see below for details:

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

## Contact

For support or questions: help@creditboost.com