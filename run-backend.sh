#!/bin/bash

# Script to run the Spring Boot backend only
echo "Starting CreditBoost Backend..."
echo "=============================="

# Navigate to the server directory
cd server || {
    echo "Failed to navigate to the server directory"
    exit 1
}

# Run the existing script
./run-app.sh

# The server will continue running in the foreground