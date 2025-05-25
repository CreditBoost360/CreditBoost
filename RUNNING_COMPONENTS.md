# Running CreditBoost Components Separately

This guide explains how to run each component of the CreditBoost application separately for development and testing purposes.

## Running the Frontend

The frontend is a React application built with Vite.

```bash
# Run the frontend only
./run-frontend.sh
```

When running, the frontend will be available at:
- http://localhost:5173

## Running the Backend

The backend is a Spring Boot application.

```bash
# Run the backend only
./run-backend.sh
```

When running, the backend will be available at:
- http://localhost:8080

## Running the API Server

The API server is a Node.js Express application that provides endpoints for partner integration.

```bash
# Run the API server only
./run-api.sh
```

When running, the API will be available at:
- http://localhost:3000/api

## Running All Components Together

To run all components together:

```bash
# Run all components
./start-creditboost.sh
```

To stop all components:

```bash
# Stop all components
./stop-creditboost.sh
```

## Troubleshooting

### Frontend Issues

If the frontend fails to start:

1. Check if Node.js is installed:
   ```bash
   node --version
   ```

2. Try installing dependencies manually:
   ```bash
   cd frontEnd/credit-boost
   npm install
   ```

3. Check for errors in the console output

### Backend Issues

If the backend fails to start:

1. Check if Java is installed:
   ```bash
   java --version
   ```

2. Check if Maven is installed:
   ```bash
   mvn --version
   ```

3. Try building the application manually:
   ```bash
   cd server/Backend\ SpringBoot
   mvn clean install
   ```

4. Check the logs in `backend.log`

### API Server Issues

If the API server fails to start:

1. Check if Node.js is installed:
   ```bash
   node --version
   ```

2. Try installing dependencies manually:
   ```bash
   cd api
   npm install
   ```

3. Check the logs in `api.log`

## Environment Configuration

- Frontend environment variables are in `frontEnd/credit-boost/.env.development`
- API environment variables are in `api/.env`
- Backend configuration is in `server/Backend SpringBoot/user-service/src/main/resources/application.properties`