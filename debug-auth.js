#!/usr/bin/env node

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for terminal output
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

// API URL
const API_URL = 'http://localhost:3000';

// Helper function to log with color
function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

// Test API connection
async function testApiConnection() {
  try {
    log('Testing API connection...', BLUE);
    const response = await axios.get(`${API_URL}`);
    log(`✓ API is running: ${JSON.stringify(response.data)}`, GREEN);
    return true;
  } catch (error) {
    log(`✗ API connection failed: ${error.message}`, RED);
    return false;
  }
}

// Test login with email
async function testLoginWithEmail(email, password) {
  try {
    log(`Testing login with email: ${email}...`, BLUE);
    const response = await axios.post(`${API_URL}/api/auth/signin`, {
      email,
      password,
      language: 'en'
    });
    log(`✓ Login successful: ${JSON.stringify(response.data)}`, GREEN);
    return response.data;
  } catch (error) {
    log(`✗ Login failed: ${error.response?.data?.message || error.message}`, RED);
    return null;
  }
}

// Test login with phone
async function testLoginWithPhone(phoneNumber, password) {
  try {
    log(`Testing login with phone: ${phoneNumber}...`, BLUE);
    const response = await axios.post(`${API_URL}/api/auth/signin`, {
      phoneNumber,
      password,
      language: 'en'
    });
    log(`✓ Login successful: ${JSON.stringify(response.data)}`, GREEN);
    return response.data;
  } catch (error) {
    log(`✗ Login failed: ${error.response?.data?.message || error.message}`, RED);
    return null;
  }
}

// Test registration
async function testRegistration(userData) {
  try {
    log(`Testing registration with email: ${userData.email}...`, BLUE);
    const response = await axios.post(`${API_URL}/api/auth/signup`, userData);
    log(`✓ Registration successful: ${JSON.stringify(response.data)}`, GREEN);
    return response.data;
  } catch (error) {
    log(`✗ Registration failed: ${error.response?.data?.message || error.message}`, RED);
    return null;
  }
}

// Main function
async function main() {
  log('=== CreditBoost Authentication Debugger ===', YELLOW);
  
  // Test API connection
  const apiRunning = await testApiConnection();
  if (!apiRunning) {
    log('API is not running. Please start the API server first.', RED);
    rl.close();
    return;
  }
  
  // Ask for test type
  rl.question(`${YELLOW}What would you like to test? (1: Login with Email, 2: Login with Phone, 3: Registration)${RESET} `, async (answer) => {
    if (answer === '1') {
      // Test login with email
      rl.question(`${BLUE}Enter email:${RESET} `, (email) => {
        rl.question(`${BLUE}Enter password:${RESET} `, async (password) => {
          await testLoginWithEmail(email, password);
          rl.close();
        });
      });
    } else if (answer === '2') {
      // Test login with phone
      rl.question(`${BLUE}Enter phone number:${RESET} `, (phoneNumber) => {
        rl.question(`${BLUE}Enter password:${RESET} `, async (password) => {
          await testLoginWithPhone(phoneNumber, password);
          rl.close();
        });
      });
    } else if (answer === '3') {
      // Test registration
      rl.question(`${BLUE}Enter email:${RESET} `, (email) => {
        rl.question(`${BLUE}Enter password:${RESET} `, (password) => {
          rl.question(`${BLUE}Enter first name:${RESET} `, (firstName) => {
            rl.question(`${BLUE}Enter last name:${RESET} `, (lastName) => {
              rl.question(`${BLUE}Enter phone number (optional):${RESET} `, async (phoneNumber) => {
                const userData = {
                  email,
                  password,
                  firstName,
                  lastName,
                  phoneNumber: phoneNumber || '',
                  language: 'en'
                };
                await testRegistration(userData);
                rl.close();
              });
            });
          });
        });
      });
    } else {
      log('Invalid option. Please run the script again.', RED);
      rl.close();
    }
  });
}

// Run the main function
main();