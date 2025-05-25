#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting CreditBoost Application...${NC}"

# Kill any existing processes
echo -e "${YELLOW}Cleaning up any existing processes...${NC}"

# Check for processes using port 3000 (API server)
if sudo lsof -ti:3000 >/dev/null; then
    echo -e "${YELLOW}Port 3000 is in use, killing process...${NC}"
    sudo kill -9 $(sudo lsof -ti:3000)
    sleep 2
fi

# Check for processes using port 5173 (Vite frontend)
if sudo lsof -ti:5173 >/dev/null; then
    echo -e "${YELLOW}Port 5173 is in use, killing process...${NC}"
    sudo kill -9 $(sudo lsof -ti:5173)
    sleep 2
fi

# Also kill by process name as a backup
pkill -f "node.*api/src/server.js" || true
pkill -f "vite" || true

# Start API server
echo -e "${YELLOW}Starting API server...${NC}"
cd /home/sam/CreditBoost/api
# Clear previous log
> /home/sam/CreditBoost/api.log
# Start the server with proper error handling
node src/server.js > /home/sam/CreditBoost/api.log 2>&1 &
API_PID=$!
echo $API_PID > /home/sam/CreditBoost/api.pid
echo -e "${GREEN}API server started with PID: $API_PID${NC}"

# Wait for API server to start
echo -e "${YELLOW}Waiting for API server to initialize...${NC}"
sleep 3

# Check if API server is running
if ps -p $API_PID > /dev/null; then
    echo -e "${GREEN}API server is running successfully!${NC}"
else
    echo -e "${RED}API server failed to start. Check logs at /home/sam/CreditBoost/api.log${NC}"
    exit 1
fi

# Start Frontend
echo -e "${YELLOW}Starting Frontend...${NC}"
cd /home/sam/CreditBoost/frontEnd/credit-boost
# Clear previous log
> /home/sam/CreditBoost/frontend.log
# Set environment variables for the frontend
export VITE_API_URL=http://localhost:3000
# Start the frontend with proper error handling
npm run dev > /home/sam/CreditBoost/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > /home/sam/CreditBoost/frontend.pid
echo -e "${GREEN}Frontend started with PID: $FRONTEND_PID${NC}"

# Wait for frontend to start
echo -e "${YELLOW}Waiting for frontend to initialize...${NC}"
sleep 5

# Check if frontend is running
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}Frontend is running successfully!${NC}"
else
    echo -e "${RED}Frontend failed to start. Check logs at /home/sam/CreditBoost/frontend.log${NC}"
    exit 1
fi

echo -e "${GREEN}CreditBoost application is now running!${NC}"
echo -e "${GREEN}API: http://localhost:3000${NC}"
echo -e "${GREEN}Frontend: http://localhost:5173${NC}"
echo -e "${YELLOW}To stop the application, run: ./stop-project.sh${NC}"