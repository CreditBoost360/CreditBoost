#!/bin/bash

# CreditBoost Simplified Startup Script
# This script starts all components of the CreditBoost application

echo "Starting CreditBoost components..."

# Start Spring Boot backend
echo "Starting Spring Boot backend..."
cd server/Backend\ SpringBoot/
./run-app.sh &
BACKEND_PID=$!
echo $BACKEND_PID > ../../backend.pid
cd ../../

# Start API server
echo "Starting API server..."
cd api/
node start-api.js &
API_PID=$!
echo $API_PID > ../api.pid
cd ../

# Start frontend
echo "Starting React frontend..."
cd frontEnd/credit-boost/
npm run dev &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../../frontend.pid
cd ../../

echo "All components started!"
echo "- Frontend: http://localhost:5173"
echo "- API: http://localhost:3000/api"
echo "- Backend: http://localhost:8080"

echo ""
echo "To stop all components, run: ./stop-creditboost.sh"

# Create stop script
cat > /home/sam/CreditBoost/stop-creditboost.sh << 'STOPEOF'
#!/bin/bash

# CreditBoost Stop Script
echo "Stopping CreditBoost components..."

if [ -f backend.pid ]; then
  BACKEND_PID=$(cat backend.pid)
  echo "Stopping Spring Boot backend (PID: $BACKEND_PID)..."
  kill $BACKEND_PID 2>/dev/null || true
  rm backend.pid
fi

if [ -f api.pid ]; then
  API_PID=$(cat api.pid)
  echo "Stopping API server (PID: $API_PID)..."
  kill $API_PID 2>/dev/null || true
  rm api.pid
fi

if [ -f frontend.pid ]; then
  FRONTEND_PID=$(cat frontend.pid)
  echo "Stopping React frontend (PID: $FRONTEND_PID)..."
  kill $FRONTEND_PID 2>/dev/null || true
  rm frontend.pid
fi

echo "All components stopped!"
STOPEOF

chmod +x /home/sam/CreditBoost/stop-creditboost.sh
