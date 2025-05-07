#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Installing Node.js and npm...${NC}"

# Update package lists
sudo apt update

# Install Node.js and npm
sudo apt install -y nodejs npm

# Check versions
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)

echo -e "${GREEN}Node.js ${NODE_VERSION} installed successfully!${NC}"
echo -e "${GREEN}npm ${NPM_VERSION} installed successfully!${NC}"

# Install frontend dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd /home/sam/CreditBoost/frontEnd/credit-boost
npm install

echo -e "${GREEN}Setup complete!${NC}"
echo -e "You can now run the application with: ${YELLOW}./run-app.sh${NC}"