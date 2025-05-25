# CreditBoost Architecture Overview

## Core Components

CreditBoost consists of four main components that work together to provide a complete credit improvement solution:

### 1. React Frontend (UI/UX)
- **Location**: `/frontEnd/credit-boost`
- **Purpose**: Provides the user interface for customers to interact with the CreditBoost platform
- **Technology**: React.js with Vite, Tailwind CSS, Shadcn UI components
- **Key Features**: 
  - Credit score dashboard
  - Improvement recommendations
  - Educational resources
  - Account management

### 2. Spring Boot Backend (Core Financial Processing)
- **Location**: `/server/Backend SpringBoot`
- **Purpose**: Handles core financial calculations, credit analysis, and data processing
- **Technology**: Java Spring Boot
- **Key Features**:
  - Credit score analysis
  - Financial calculations
  - Data processing pipelines
  - Security and compliance

### 3. API Server (Partner Integration)
- **Location**: `/api`
- **Purpose**: Provides API endpoints for partners to integrate with CreditBoost services
- **Technology**: Node.js Express
- **Key Features**:
  - RESTful API endpoints
  - Authentication and authorization
  - Rate limiting and security
  - Documentation for partners

### 4. Universal Credit Passport (Blockchain Component)
- **Location**: `/universal-credit-passport`
- **Purpose**: Provides a secure, portable credit history using blockchain technology
- **Technology**: TypeScript, Blockchain (Ethereum/Solidity)
- **Key Features**:
  - Secure credit data storage
  - Portable credit history
  - User-controlled data sharing
  - Immutable credit record

### 5. SDK (Software Development Kit)
- **Location**: `/sdk`
- **Purpose**: Client library for partners to easily integrate with CreditBoost API
- **Technology**: TypeScript
- **Key Features**:
  - Authentication helpers
  - API client methods
  - Type definitions
  - Error handling

## System Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
��  React Frontend ├──────┤  API Server     ├──────┤  Spring Boot    │
│  (UI/UX)        │      │  (Partner API)  │      │  (Core Engine)  │
│                 │      │                 │      │                 │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         │                        │                        │
         │                        │                        │
         │                        ▼                        │
         │               ┌─────────────────┐               │
         │               │                 │               │
         └───────────────┤ Universal Credit├───────────────┘
                         │ Passport        │
                         │                 │
                         └─────────────────┘
```

## Communication Flow

1. Users interact with the React Frontend
2. Frontend communicates with API Server for most operations
3. API Server communicates with Spring Boot backend for financial processing
4. Universal Credit Passport interacts with all components to maintain credit history
5. Partners use the SDK to integrate with the API Server

## Deployment

The application uses a combination of scripts to manage deployment:
- `start-all.sh`: Starts all components
- `restart.sh`: Restarts components after changes
- `run-app.sh`: Runs the Spring Boot application

## Next Steps

1. Maintain this simplified architecture
2. Focus on improving core functionality
3. Document API endpoints thoroughly for partners
4. Enhance the Universal Credit Passport features