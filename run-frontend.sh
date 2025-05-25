#!/bin/bash

# Script to run the React frontend only
echo "Starting CreditBoost Frontend..."
echo "==============================="

# Navigate to the frontend directory
cd frontEnd/credit-boost || {
    echo "Failed to navigate to the frontend directory"
    exit 1
}

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the development server
echo "Starting development server..."
npm run dev

# The server will continue running in the foreground