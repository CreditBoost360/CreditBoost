#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing API endpoints...${NC}"

# Test health endpoint
echo -e "\n${YELLOW}Testing health endpoint:${NC}"
curl -s http://localhost:8081/api/health | jq || echo -e "${RED}Failed to connect to health endpoint${NC}"

# Test registration endpoint
echo -e "\n${YELLOW}Testing registration endpoint:${NC}"
curl -s -X POST http://localhost:8081/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test2@example.com",
    "password": "password123"
  }' | jq || echo -e "${RED}Failed to connect to registration endpoint${NC}"

# Test login endpoint
echo -e "\n${YELLOW}Testing login endpoint:${NC}"
curl -s -X POST http://localhost:8081/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }' | jq || echo -e "${RED}Failed to connect to login endpoint${NC}"

echo -e "\n${GREEN}API tests completed${NC}"