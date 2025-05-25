#!/bin/bash

# Script to run the API server only
echo "Starting CreditBoost API Server..."
echo "================================="

# Navigate to the API directory
cd api || {
    echo "Failed to navigate to the API directory"
    exit 1
}

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the API server
echo "Starting API server on port 3000..."
node start-api.js

# The server will continue running in the foreground