#!/bin/bash

echo "Starting CreditBoost application..."

# Kill any existing processes
echo "Stopping any existing processes..."
pkill -f "node.*server.js" || true
pkill -f "node.*vite" || true

# Start the backend API on port 3000
echo "Starting backend API on port 3000..."
cd /home/sam/CreditBoost/api
PORT=3000 node src/server.js > /dev/null 2>&1 &
echo "Backend started with PID $!"

# Wait a moment for the backend to initialize
sleep 2

# Start the frontend
echo "Starting frontend on port 5173..."
cd /home/sam/CreditBoost/frontEnd/credit-boost
npm run dev > /dev/null 2>&1 &
echo "Frontend started with PID $!"

echo "CreditBoost is now running!"
echo "- Frontend: http://localhost:5173"
echo "- Backend API: http://localhost:3000"
echo ""
echo "You can now open http://localhost:5173 in your browser"