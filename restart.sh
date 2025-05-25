#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Restarting CreditBoost Application...${NC}"

# Stop the application
echo -e "${YELLOW}Stopping current processes...${NC}"
./stop-project.sh

# Wait a moment to ensure all processes are stopped
sleep 2

# Start the application
echo -e "${YELLOW}Starting application...${NC}"
./start-project.sh

echo -e "${GREEN}CreditBoost application has been restarted!${NC}"