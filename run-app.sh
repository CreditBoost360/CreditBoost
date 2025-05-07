#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting CreditBoost Application...${NC}"

# Start PostgreSQL if not running
if ! systemctl is-active --quiet postgresql; then
  echo -e "${YELLOW}Starting PostgreSQL service...${NC}"
  sudo systemctl start postgresql
fi

# Start Spring Boot backend in the background
echo -e "${YELLOW}Starting Spring Boot backend on port 8081...${NC}"
cd /home/sam/CreditBoost/server/Backend\ SpringBoot
mvn spring-boot:run -pl user-service > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to initialize...${NC}"
sleep 10

# Start frontend in the background
echo -e "${YELLOW}Starting React frontend on port 3000...${NC}"
cd /home/sam/CreditBoost/frontEnd/credit-boost
npm run dev > frontend.log 2>&1 &
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