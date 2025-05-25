#!/bin/bash

# Kill any existing Node.js server processes
pkill -f "node.*server.js" || true

# Change to the API directory
cd /home/sam/CreditBoost/api

# Start the server with explicit port
PORT=3000 node src/server.js