#!/bin/bash

# CreditBoost V2.0 Migration Runner
# This script runs all migration scripts in order

# Exit on error
set -e

echo "Starting CreditBoost V2.0 database migrations..."

# Check for required tools
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting."; exit 1; }
command -v mongo >/dev/null 2>&1 || { echo "MongoDB client is required but not installed. Aborting."; exit 1; }

# Load environment variables
if [ -f "../../api/.env" ]; then
  export $(grep -v '^#' ../../api/.env | xargs)
else
  echo "Error: .env file not found in api directory"
  exit 1
fi

# Run migrations in order
echo "Running migration: 01-update-user-schema.js"
node 01-update-user-schema.js

# Add more migrations as needed
# echo "Running migration: 02-another-migration.js"
# node 02-another-migration.js

echo "Running Supabase migrations..."
# Add Supabase migration commands here if applicable

echo "All migrations completed successfully!"

# Make the script executable
chmod +x run-migrations.sh