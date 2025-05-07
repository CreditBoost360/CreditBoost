#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}CreditBoost Restart Script${NC}"

# Kill any existing processes on ports 8081 and 3000
echo -e "${YELLOW}Stopping any existing processes...${NC}"
sudo kill -9 $(sudo lsof -t -i:8081) 2>/dev/null || true
sudo kill -9 $(sudo lsof -t -i:3000) 2>/dev/null || true

# Make sure PostgreSQL is running
echo -e "${YELLOW}Starting PostgreSQL...${NC}"
sudo systemctl start postgresql

# Start backend in the background
echo -e "${YELLOW}Starting Spring Boot backend...${NC}"
cd /home/sam/CreditBoost/server/Backend\ SpringBoot
mvn spring-boot:run -pl user-service > /home/sam/CreditBoost/backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to initialize...${NC}"
sleep 15

# Start frontend in the background
echo -e "${YELLOW}Starting React frontend...${NC}"
cd /home/sam/CreditBoost/frontEnd/credit-boost
npm run dev > /home/sam/CreditBoost/frontend.log 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}CreditBoost is starting up!${NC}"
echo -e "${GREEN}Backend running on http://localhost:8081${NC}"
echo -e "${GREEN}Frontend running on http://localhost:3000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Function to kill processes on exit
cleanup() {
  echo -e "${YELLOW}Stopping servers...${NC}"
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  echo -e "${GREEN}Servers stopped${NC}"
  exit 0
}

# Register the cleanup function for when script receives SIGINT (Ctrl+C)
trap cleanup SIGINT

# Keep script running
wait
