#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing CreditBoost Application Connectivity...${NC}"

# Test API server
echo -e "${BLUE}Testing API server on port 3000...${NC}"
if curl -s http://localhost:3000/ > /dev/null; then
    echo -e "${GREEN}✓ API server is running and accessible${NC}"
    
    # Test CORS endpoint
    echo -e "${BLUE}Testing CORS configuration...${NC}"
    CORS_RESPONSE=$(curl -s -H "Origin: http://localhost:5173" http://localhost:3000/api/test-cors)
    if [[ $CORS_RESPONSE == *"CORS test successful"* ]]; then
        echo -e "${GREEN}✓ CORS is properly configured${NC}"
    else
        echo -e "${RED}✗ CORS test failed. Response: ${CORS_RESPONSE}${NC}"
    fi
    
    # Test CSRF token endpoint
    echo -e "${BLUE}Testing CSRF token endpoint...${NC}"
    CSRF_RESPONSE=$(curl -s -v http://localhost:3000/api/csrf-token 2>&1)
    if [[ $CSRF_RESPONSE == *"XSRF-TOKEN"* ]]; then
        echo -e "${GREEN}✓ CSRF token endpoint is working${NC}"
    else
        echo -e "${RED}✗ CSRF token endpoint test failed${NC}"
    fi
else
    echo -e "${RED}✗ API server is not responding${NC}"
fi

# Test Frontend
echo -e "${BLUE}Testing Frontend on port 5173...${NC}"
if curl -s http://localhost:5173/ > /dev/null; then
    echo -e "${GREEN}✓ Frontend is running and accessible${NC}"
else
    echo -e "${RED}✗ Frontend is not responding${NC}"
fi

# Check for processes
echo -e "${BLUE}Checking running processes...${NC}"
API_PROCESS=$(ps aux | grep -v grep | grep "node.*api/src/server.js")
FRONTEND_PROCESS=$(ps aux | grep -v grep | grep "vite")

if [[ ! -z "$API_PROCESS" ]]; then
    echo -e "${GREEN}✓ API process is running: ${API_PROCESS}${NC}"
else
    echo -e "${RED}✗ API process is not running${NC}"
fi

if [[ ! -z "$FRONTEND_PROCESS" ]]; then
    echo -e "${GREEN}✓ Frontend process is running: ${FRONTEND_PROCESS}${NC}"
else
    echo -e "${RED}✗ Frontend process is not running${NC}"
fi

# Check ports
echo -e "${BLUE}Checking ports...${NC}"
PORT_3000=$(lsof -i :3000 | grep LISTEN)
PORT_5173=$(lsof -i :5173 | grep LISTEN)

if [[ ! -z "$PORT_3000" ]]; then
    echo -e "${GREEN}✓ Port 3000 is in use by: ${PORT_3000}${NC}"
else
    echo -e "${RED}✗ Port 3000 is not in use${NC}"
fi

if [[ ! -z "$PORT_5173" ]]; then
    echo -e "${GREEN}✓ Port 5173 is in use by: ${PORT_5173}${NC}"
else
    echo -e "${RED}✗ Port 5173 is not in use${NC}"
fi

echo -e "${YELLOW}Connection test completed${NC}"