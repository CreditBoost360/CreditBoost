#!/usr/bin/env node

/**
 * CreditBoost Application Server
 * This script starts both the API and frontend servers
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Configuration
const API_PORT = 3000;
const FRONTEND_PORT = 5173;
const BASE_DIR = __dirname;
const API_DIR = path.join(BASE_DIR, 'api');
const FRONTEND_DIR = path.join(BASE_DIR, 'frontEnd/credit-boost');
const LOG_DIR = BASE_DIR;

// Colors for terminal output
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

// Create log files
const apiLogStream = fs.createWriteStream(path.join(LOG_DIR, 'api.log'), { flags: 'a' });
const frontendLogStream = fs.createWriteStream(path.join(LOG_DIR, 'frontend.log'), { flags: 'a' });

// Helper function to log with timestamp
function log(message, color = RESET) {
  const timestamp = new Date().toISOString();
  console.log(`${color}[${timestamp}] ${message}${RESET}`);
}

// Helper function to check if a port is in use
async function isPortInUse(port) {
  return new Promise((resolve) => {
    const netstat = spawn('lsof', ['-i', `:${port}`]);
    netstat.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

// Helper function to kill process using a port
async function killProcessOnPort(port) {
  log(`Attempting to kill process on port ${port}...`, YELLOW);
  try {
    const kill = spawn('kill', ['-9', `$(lsof -t -i:${port})`], { shell: true });
    await new Promise(resolve => kill.on('close', resolve));
    log(`Killed process on port ${port}`, GREEN);
  } catch (error) {
    log(`Failed to kill process on port ${port}: ${error.message}`, RED);
  }
}

// Start API server
async function startApiServer() {
  log('Starting API server...', BLUE);
  
  // Check if port is in use
  if (await isPortInUse(API_PORT)) {
    log(`Port ${API_PORT} is already in use. Attempting to free it...`, YELLOW);
    await killProcessOnPort(API_PORT);
  }
  
  // Start the API server
  const apiServer = spawn('node', ['src/server.js'], { 
    cwd: API_DIR,
    env: { ...process.env, PORT: API_PORT }
  });
  
  // Save PID for later cleanup
  fs.writeFileSync(path.join(BASE_DIR, 'api.pid'), apiServer.pid.toString());
  
  // Handle output
  apiServer.stdout.pipe(apiLogStream);
  apiServer.stderr.pipe(apiLogStream);
  
  apiServer.stdout.on('data', (data) => {
    log(`API: ${data.toString().trim()}`, GREEN);
  });
  
  apiServer.stderr.on('data', (data) => {
    log(`API ERROR: ${data.toString().trim()}`, RED);
  });
  
  apiServer.on('close', (code) => {
    log(`API server exited with code ${code}`, code === 0 ? GREEN : RED);
  });
  
  // Wait for API server to start
  await new Promise(resolve => setTimeout(resolve, 2000));
  log('API server started', GREEN);
  
  return apiServer;
}

// Start Frontend server
async function startFrontendServer() {
  log('Starting Frontend server...', BLUE);
  
  // Check if port is in use
  if (await isPortInUse(FRONTEND_PORT)) {
    log(`Port ${FRONTEND_PORT} is already in use. Attempting to free it...`, YELLOW);
    await killProcessOnPort(FRONTEND_PORT);
  }
  
  // Start the Frontend server
  const frontendServer = spawn('npm', ['run', 'dev'], { 
    cwd: FRONTEND_DIR,
    env: { ...process.env, PORT: FRONTEND_PORT }
  });
  
  // Save PID for later cleanup
  fs.writeFileSync(path.join(BASE_DIR, 'frontend.pid'), frontendServer.pid.toString());
  
  // Handle output
  frontendServer.stdout.pipe(frontendLogStream);
  frontendServer.stderr.pipe(frontendLogStream);
  
  frontendServer.stdout.on('data', (data) => {
    log(`Frontend: ${data.toString().trim()}`, GREEN);
  });
  
  frontendServer.stderr.on('data', (data) => {
    log(`Frontend ERROR: ${data.toString().trim()}`, RED);
  });
  
  frontendServer.on('close', (code) => {
    log(`Frontend server exited with code ${code}`, code === 0 ? GREEN : RED);
  });
  
  // Wait for Frontend server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  log('Frontend server started', GREEN);
  
  return frontendServer;
}

// Main function to start all services
async function startServices() {
  try {
    log('Starting CreditBoost services...', YELLOW);
    
    // Start API server first
    const apiServer = await startApiServer();
    
    // Then start Frontend
    const frontendServer = await startFrontendServer();
    
    log('All services started successfully!', GREEN);
    log(`API running at: http://localhost:${API_PORT}`, BLUE);
    log(`Frontend running at: http://localhost:${FRONTEND_PORT}`, BLUE);
    
    // Handle process termination
    process.on('SIGINT', async () => {
      log('Shutting down services...', YELLOW);
      apiServer.kill();
      frontendServer.kill();
      process.exit(0);
    });
    
  } catch (error) {
    log(`Error starting services: ${error.message}`, RED);
    process.exit(1);
  }
}

// Start everything
startServices();