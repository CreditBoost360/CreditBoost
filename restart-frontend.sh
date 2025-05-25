#!/bin/bash

# Kill any existing frontend processes
pkill -f "node.*vite" || true

# Change to the frontend directory
cd /home/sam/CreditBoost/frontEnd/credit-boost

# Start the frontend
npm run dev