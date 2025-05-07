/**
 * Dependency Validator for CreditBoost
 * 
 * Validates installed dependencies against known vulnerabilities
 * and enforces security best practices
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Configuration
const VALIDATOR_CONFIG = {
  scanInterval: 24 * 60 * 60 * 1000, // 24 hours
  packageJsonPath: path.resolve(process.cwd(), 'package.json'),
  packageLockPath: path.resolve(process.cwd(), 'package-lock.json'),
  maxVulnerabilities: {
    critical: 0,
    high: 0,
    moderate: 5
  },
  alertWebhook: process.env.SECURITY_ALERT_WEBHOOK
};

class DependencyValidator {
  constructor() {
    this.vulnerabilities = null;
    this.lastScan = 0;
    this.isScanning = false;
  }

  /**
   * Initialize the dependency validator
   */
  async initialize() {
    try {
      console.log('Initializing dependency validator...');
      
      // Schedule regular scans
      this.scheduleScans();
      
      // Perform initial scan
      await this.scanDependencies();
      
      console.log('Dependency validator initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize dependency validator:', error);
      return false;
    }
  }

  /**
   * Schedule regular dependency scans
   */
  scheduleScans() {
    setInterval(async () => {
      try {
        await this.scanDependencies();
      } catch (error) {
        console.error('Scheduled dependency scan failed:', error);
      }
    }, VALIDATOR_CONFIG.scanInterval);
  }

  /**
   * Scan dependencies for vulnerabilities
   */
  async scanDependencies() {
    if (this.isScanning) {
      console.log('Dependency scan already in progress, skipping');
      return;
    }
    
    this.isScanning = true;
    
    try {
      console.log('Scanning dependencies for vulnerabilities...');
      
      // Run npm audit
      const { stdout, stderr } = await execPromise('npm audit --json');
      
      if (stderr) {
        console.warn('npm audit warnings:', stderr);
      }
      
      // Parse audit results
      const auditResults = JSON.parse(stdout);
      
      // Process vulnerabilities
      this.vulnerabilities = this.processVulnerabilities(auditResults);
      
      // Check against thresholds
      const exceedsThreshold = this.checkVulnerabilityThresholds();
      
      if (exceedsThreshold) {
        await this.alertSecurityTeam();
      }
      
      this.lastScan = Date.now();
      console.log('Dependency scan completed');
      
      return this.vulnerabilities;
    } catch (error) {
      console.error('Dependency scan failed:', error);
      throw error;
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Process vulnerability data from npm audit
   * @param {Object} auditResults - Results from npm audit
   * @returns {Object} Processed vulnerability data
   */
  processVulnerabilities(auditResults) {
    const counts = {
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
      info: 0,
      total: 0
    };
    
    const vulnerablePackages = new Map();
    
    // Process vulnerabilities from audit data
    if (auditResults.vulnerabilities) {
      Object.entries(auditResults.vulnerabilities).forEach(([pkgName, data]) => {
        if (data.severity) {
          counts[data.severity.toLowerCase()] += 1;
          counts.total += 1;
          
          vulnerablePackages.set(pkgName, {
            severity: data.severity,
            via: data.via,
            effects: data.effects || [],
            fixAvailable: !!data.fixAvailable
          });
        }
      });
    }
    
    return {
      counts,
      vulnerablePackages: Object.fromEntries(vulnerablePackages),
      metadata: {
        scanTime: new Date().toISOString(),
        totalDependencies: auditResults.metadata?.totalDependencies || 0
      }
    };
  }

  /**
   * Check if vulnerabilities exceed configured thresholds
   * @returns {boolean} True if thresholds are exceeded
   */
  checkVulnerabilityThresholds() {
    if (!this.vulnerabilities || !this.vulnerabilities.counts) {
      return false;
    }
    
    const { counts } = this.vulnerabilities;
    const { maxVulnerabilities } = VALIDATOR_CONFIG;
    
    return (
      counts.critical > maxVulnerabilities.critical ||
      counts.high > maxVulnerabilities.high ||
      counts.moderate > maxVulnerabilities.moderate
    );
  }

  /**
   * Alert security team about vulnerabilities
   */
  async alertSecurityTeam() {
    try {
      console.warn('SECURITY ALERT: Vulnerability thresholds exceeded!');
      
      // In a production environment, this would send an alert to a security team
      // via email, Slack, or other notification system
      
      if (VALIDATOR_CONFIG.alertWebhook) {
        // Implementation for webhook notification would go here
        console.log('Sending security alert to webhook');
      }
      
      // Log detailed vulnerability information
      console.warn('Vulnerability details:', JSON.stringify(this.vulnerabilities, null, 2));
    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }

  /**
   * Get vulnerability report
   * @returns {Object} Current vulnerability report
   */
  getVulnerabilityReport() {
    if (!this.vulnerabilities) {
      return {
        error: 'No vulnerability scan has been performed',
        lastScan: this.lastScan
      };
    }
    
    return {
      ...this.vulnerabilities,
      lastScan: this.lastScan,
      thresholdExceeded: this.checkVulnerabilityThresholds()
    };
  }
}

// Export singleton instance
export const dependencyValidator = new DependencyValidator();

// Initialize on import
dependencyValidator.initialize().catch(error => {
  console.error('Failed to initialize dependency validator:', error);
});

export default DependencyValidator;