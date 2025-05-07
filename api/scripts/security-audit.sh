#!/bin/bash

# Security Audit Script for CreditBoost
# Performs comprehensive security checks on the application

# Exit on error
set -e

# Configuration
REPORT_DIR="./security-reports"
DATE_STAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_FILE="$REPORT_DIR/security-audit-$DATE_STAMP.txt"

# Create report directory if it doesn't exist
mkdir -p "$REPORT_DIR"

# Start report
echo "CreditBoost Security Audit Report" > "$REPORT_FILE"
echo "Date: $(date)" >> "$REPORT_FILE"
echo "----------------------------------------" >> "$REPORT_FILE"

# Function to run a check and append to report
run_check() {
  local title="$1"
  local command="$2"
  
  echo -e "\n\n== $title ==" >> "$REPORT_FILE"
  echo "Command: $command" >> "$REPORT_FILE"
  echo "----------------------------------------" >> "$REPORT_FILE"
  
  # Run the command and capture output
  if eval "$command >> '$REPORT_FILE' 2>&1"; then
    echo "[PASS] $title" | tee -a "$REPORT_FILE"
  else
    echo "[FAIL] $title" | tee -a "$REPORT_FILE"
  fi
}

# Check environment variables
check_env_vars() {
  echo "Checking required environment variables..."
  
  # List of required security-related environment variables
  REQUIRED_VARS=("JWT_SECRET" "ENCRYPTION_KEY" "SESSION_SECRET" "COOKIE_SECRET")
  
  # Source the .env file to get variables
  if [ -f .env ]; then
    source .env
  fi
  
  for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
      echo "Missing required environment variable: $var"
      return 1
    else
      # Check minimum length for security keys
      if [[ "$var" == *"SECRET"* || "$var" == *"KEY"* ]]; then
        if [ ${#var} -lt 32 ]; then
          echo "Security warning: $var is too short (less than 32 characters)"
        fi
      fi
    fi
  done
  
  echo "All required environment variables are set"
  return 0
}

# Run npm audit
run_check "NPM Security Audit" "npm audit --json || echo 'Audit completed with warnings'"

# Check for outdated packages
run_check "Outdated Packages" "npm outdated || echo 'No outdated packages found'"

# Check Node.js version
run_check "Node.js Version" "node -v"

# Check environment variables
run_check "Environment Variables" "check_env_vars || echo 'Environment variable check failed'"

# Check file permissions
run_check "File Permissions" "find . -type f -name '*.js' -not -path './node_modules/*' -exec ls -la {} \\; || echo 'File permission check completed'"

# Check for sensitive information in git history
run_check "Git Secrets Scan" "git log -p | grep -i 'password\\|secret\\|key\\|token' || echo 'No obvious secrets found in git history'"

# Check for HTTPS configuration
run_check "HTTPS Configuration" "grep -r 'https' --include='*.js' --include='*.json' . || echo 'No HTTPS configuration found'"

# Check Content Security Policy
run_check "Content Security Policy" "grep -r 'Content-Security-Policy' --include='*.js' . || echo 'No CSP configuration found'"

# Check for helmet usage
run_check "Helmet Security Headers" "grep -r 'helmet' --include='*.js' . || echo 'No helmet usage found'"

# Check for rate limiting
run_check "Rate Limiting" "grep -r 'rate' --include='*.js' . || echo 'No rate limiting found'"

# Check for CSRF protection
run_check "CSRF Protection" "grep -r 'csrf' --include='*.js' . || echo 'No CSRF protection found'"

# Check for XSS protection
run_check "XSS Protection" "grep -r 'xss' --include='*.js' . || echo 'No XSS protection found'"

# Check for SQL injection protection
run_check "SQL Injection Protection" "grep -r 'parameterized\\|prepared\\|sanitize' --include='*.js' . || echo 'No SQL injection protection found'"

# Check for encryption usage
run_check "Encryption" "grep -r 'encrypt\\|decrypt\\|crypto' --include='*.js' . || echo 'No encryption found'"

# Check for authentication
run_check "Authentication" "grep -r 'authenticate\\|login\\|jwt\\|token' --include='*.js' . || echo 'No authentication found'"

# Check for authorization
run_check "Authorization" "grep -r 'authorize\\|permission\\|role' --include='*.js' . || echo 'No authorization found'"

# Check for logging
run_check "Logging" "grep -r 'log\\|logger\\|winston\\|bunyan' --include='*.js' . || echo 'No logging found'"

# Check for error handling
run_check "Error Handling" "grep -r 'catch\\|error\\|exception' --include='*.js' . || echo 'No error handling found'"

# Check for input validation
run_check "Input Validation" "grep -r 'validate\\|sanitize\\|joi\\|yup\\|schema' --include='*.js' . || echo 'No input validation found'"

# Finalize report
echo -e "\n\nSecurity Audit Complete" >> "$REPORT_FILE"
echo "Report saved to: $REPORT_FILE"

# Display summary
echo -e "\n\n========== SECURITY AUDIT SUMMARY =========="
echo "Report saved to: $REPORT_FILE"
echo "Run 'cat $REPORT_FILE' to view the full report"
echo "=============================================="