#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping CreditBoost Application...${NC}"

# Stop API server
if [ -f "/home/sam/CreditBoost/api.pid" ]; then
    API_PID=$(cat /home/sam/CreditBoost/api.pid)
    if ps -p $API_PID > /dev/null; then
        echo -e "${YELLOW}Stopping API server (PID: $API_PID)...${NC}"
        kill $API_PID
        echo -e "${GREEN}API server stopped${NC}"
    else
        echo -e "${RED}API server process not found${NC}"
    fi
    rm -f /home/sam/CreditBoost/api.pid
else
    echo -e "${RED}API PID file not found${NC}"
    # Try to find and kill the process anyway
    pkill -f "node.*api/src/server.js" || true
fi

# Stop Frontend
if [ -f "/home/sam/CreditBoost/frontend.pid" ]; then
    FRONTEND_PID=$(cat /home/sam/CreditBoost/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null; then
        echo -e "${YELLOW}Stopping Frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID
        echo -e "${GREEN}Frontend stopped${NC}"
    else
        echo -e "${RED}Frontend process not found${NC}"
    fi
    rm -f /home/sam/CreditBoost/frontend.pid
else
    echo -e "${RED}Frontend PID file not found${NC}"
    # Try to find and kill the process anyway
    pkill -f "vite" || true
fi

# Make sure all related processes are killed
echo -e "${YELLOW}Ensuring all related processes are stopped...${NC}"
pkill -f "node.*api/src/server.js" || true
pkill -f "vite" || true

# Check for processes using port 3000 and 5173 as a last resort
if lsof -ti:3000 >/dev/null 2>&1; then
    echo -e "${YELLOW}Process still using port 3000, force killing...${NC}"
    kill -9 $(lsof -ti:3000) 2>/dev/null || true
fi

if lsof -ti:5173 >/dev/null 2>&1; then
    echo -e "${YELLOW}Process still using port 5173, force killing...${NC}"
    kill -9 $(lsof -ti:5173) 2>/dev/null || true
fi

echo -e "${GREEN}All CreditBoost processes have been stopped${NC}"