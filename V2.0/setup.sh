#!/bin/bash

# CreditBoost V2.0 Setup Script
# This script sets up the environment for CreditBoost V2.0

# Exit on error
set -e

echo "Setting up CreditBoost V2.0..."

# Check for required tools
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed. Aborting."; exit 1; }
command -v java >/dev/null 2>&1 || { echo "Java is required but not installed. Aborting."; exit 1; }

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d '.' -f 1)
if [ $NODE_MAJOR -lt 16 ]; then
  echo "Node.js version 16 or higher is required. Found version $NODE_VERSION"
  exit 1
fi

# Check Java version
JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d '"' -f 2 | cut -d '.' -f 1)
if [ $JAVA_VERSION -lt 17 ]; then
  echo "Java version 17 or higher is required."
  exit 1
fi

# Create necessary directories if they don't exist
mkdir -p config
mkdir -p logs

# Copy configuration templates
echo "Copying configuration templates..."
cp -n V2.0/config-templates/* config/ || true

# Check for environment files
if [ ! -f api/.env ]; then
  echo "Creating API environment file from example..."
  cp api/.env.example api/.env
  echo "Please update api/.env with your configuration values."
fi

# Install dependencies
echo "Installing API dependencies..."
cd api
npm install
cd ..

echo "Installing frontend dependencies..."
cd frontEnd/credit-boost
npm install
cd ../..

# Run database migrations
echo "Running database migrations..."
cd V2.0/migrations
# Add migration commands here
cd ../..

# Set up security
echo "Setting up security features..."
# Generate random keys for development if needed
if [ "$NODE_ENV" != "production" ]; then
  echo "Generating development keys..."
  # Generate random keys for development
  JWT_SECRET=$(openssl rand -hex 32)
  ENCRYPTION_KEY=$(openssl rand -hex 32)
  
  # Update .env file with these keys if they don't exist
  if ! grep -q "JWT_SECRET" api/.env; then
    echo "JWT_SECRET=$JWT_SECRET" >> api/.env
  fi
  
  if ! grep -q "ENCRYPTION_KEY" api/.env; then
    echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> api/.env
  fi
fi

echo "Setup complete! You can now start the application."
echo "Run 'npm start' in the api directory to start the API server."
echo "Run 'npm run dev' in the frontEnd/credit-boost directory to start the frontend."

# Make the script executable
chmod +x V2.0/setup.sh