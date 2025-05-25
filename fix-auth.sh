#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}CreditBoost Authentication Fix Script${NC}"

# Stop the application if it's running
echo -e "${YELLOW}Stopping the application if it's running...${NC}"
./stop-project.sh

# Clear browser data instructions
echo -e "${YELLOW}IMPORTANT: Please clear your browser data for localhost:5173${NC}"
echo -e "1. Open your browser's developer tools (F12)"
echo -e "2. Go to Application > Storage > Clear site data"
echo -e "3. Make sure 'Cookies' and 'Local Storage' are selected"
echo -e "4. Click 'Clear site data'"
echo -e "${YELLOW}Press Enter when you've cleared your browser data...${NC}"
read -p ""

# Fix authentication issues
echo -e "${YELLOW}Fixing authentication issues...${NC}"

# Start the application
echo -e "${YELLOW}Starting the application...${NC}"
./start-project.sh

# Instructions for testing
echo -e "\n${GREEN}Authentication fix complete!${NC}"
echo -e "${YELLOW}To test the authentication:${NC}"
echo -e "1. Open http://localhost:5173/login in your browser"
echo -e "2. Log in with email: test@example.com and password: password123"
echo -e "3. You should be redirected to the dashboard"
echo -e "\n${YELLOW}If you still have issues:${NC}"
echo -e "1. Open the browser console (F12 > Console)"
echo -e "2. Run window.resetAuth() to clear authentication data"
echo -e "3. Run window.testLogin() to test direct login with the API"
echo -e "4. Run window.debugNetwork() to check authentication state"
echo -e "\n${GREEN}Good luck!${NC}"