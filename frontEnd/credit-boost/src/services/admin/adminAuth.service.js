import { apiConfig } from "@/config/api.config";
import { v4 as uuidv4 } from 'uuid';

/**
 * Admin Authentication Service
 * Provides secure authentication and authorization for admin users
 * with advanced security features for protection against sophisticated attacks
 */
export const adminAuthService = {
    /**
     * Login with credentials and 2FA
     * @param {string} email Admin email
     * @param {string} password Admin password
     * @param {string} twoFactorCode 2FA code
     * @returns {Promise<Object>} Authentication result
     */
    login: async (email, password, twoFactorCode) => {
        try {
            // Generate request ID for tracing
            const requestId = uuidv4();
            
            // Generate device fingerprint
            const deviceFingerprint = await adminAuthService.generateDeviceFingerprint();
            
            // First step: Verify credentials
            const response = await fetch(`${apiConfig.getApiUrl('admin/auth/login')}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Request-ID': requestId,
                    'X-Device-Fingerprint': deviceFingerprint
                },
                body: JSON.stringify({
                    email,
                    password,
                    twoFactorCode,
                    deviceInfo: {
                        userAgent: navigator.userAgent,
                        platform: navigator.platform,
                        language: navigator.language,
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        screenResolution: `${window.screen.width}x${window.screen.height}`
                    }
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Authentication failed');
            }
            
            const data = await response.json();
            
            // Store authentication token securely
            localStorage.setItem('admin-token', data.token);
            
            // Store session metadata
            localStorage.setItem('admin-session-id', data.sessionId);
            localStorage.setItem('admin-session-start', Date.now().toString());
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
    
    /**
     * Verify Level 6 security key
     * @param {string} securityKey The daily security key
     * @returns {Promise<Object>} Verification result
     */
    verifySecurityKey: async (securityKey) => {
        try {
            const token = localStorage.getItem('admin-token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const response = await fetch(`${apiConfig.getApiUrl('admin/auth/verify-security-key')}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ securityKey })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Security key verification failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Security key verification error:', error);
            throw error;
        }
    },
    
    /**
     * Verify admin session
     * @returns {Promise<Object>} Admin user data if session is valid
     */
    verifyAdminSession: async () => {
        try {
            const token = localStorage.getItem('admin-token');
            if (!token) {
                return null;
            }
            
            // Generate device fingerprint
            const deviceFingerprint = await adminAuthService.generateDeviceFingerprint();
            
            const response = await fetch(`${apiConfig.getApiUrl('admin/auth/verify')}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Device-Fingerprint': deviceFingerprint
                },
                body: JSON.stringify({
                    sessionId: localStorage.getItem('admin-session-id'),
                    sessionStart: localStorage.getItem('admin-session-start')
                })
            });
            
            if (!response.ok) {
                // Clear invalid session
                adminAuthService.clearSession();
                return null;
            }
            
            return await response.json();
        } catch (error) {
            console.error('Session verification error:', error);
            adminAuthService.clearSession();
            return null;
        }
    },
    
    /**
     * Log admin activity
     * @param {Object} activityData Activity data to log
     * @returns {Promise<Object>} Logging result
     */
    logAdminActivity: async (activityData) => {
        try {
            const token = localStorage.getItem('admin-token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Generate request ID for tracing
            const requestId = uuidv4();
            
            const response = await fetch(`${apiConfig.getApiUrl('admin/audit/log')}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Request-ID': requestId
                },
                body: JSON.stringify({
                    ...activityData,
                    timestamp: new Date().toISOString(),
                    sessionId: localStorage.getItem('admin-session-id'),
                    url: window.location.href,
                    userAgent: navigator.userAgent
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to log activity');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Activity logging error:', error);
            // Silent fail for logging - don't disrupt user experience
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Logout admin user
     * @returns {Promise<boolean>} Logout success
     */
    logout: async () => {
        try {
            const token = localStorage.getItem('admin-token');
            if (token) {
                // Notify server about logout
                await fetch(`${apiConfig.getApiUrl('admin/auth/logout')}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        sessionId: localStorage.getItem('admin-session-id')
                    })
                }).catch(err => console.error('Logout notification error:', err));
            }
            
            // Clear session data
            adminAuthService.clearSession();
            
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear session even if server notification fails
            adminAuthService.clearSession();
            return false;
        }
    },
    
    /**
     * Clear admin session data
     */
    clearSession: () => {
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-bridge-token');
        localStorage.removeItem('admin-session-id');
        localStorage.removeItem('admin-session-start');
        
        // Clear any other admin-related data
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('admin-')) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
    },
    
    /**
     * Generate device fingerprint for security verification
     * @returns {Promise<string>} Device fingerprint hash
     */
    generateDeviceFingerprint: async () => {
        // Collect browser and device information
        const fingerprint = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            colorDepth: window.screen.colorDepth,
            deviceMemory: navigator.deviceMemory,
            hardwareConcurrency: navigator.hardwareConcurrency,
            plugins: Array.from(navigator.plugins || []).map(p => p.name),
            timestamp: Date.now()
        };
        
        // Create hash of fingerprint
        const fingerprintString = JSON.stringify(fingerprint);
        const encoder = new TextEncoder();
        const data = encoder.encode(fingerprintString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return hashHex;
    },
    
    /**
     * Request bridge access
     * @param {Object} requestData Bridge access request data
     * @returns {Promise<Object>} Request result
     */
    requestBridgeAccess: async (requestData) => {
        try {
            const token = localStorage.getItem('admin-token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Generate request ID for tracing
            const requestId = uuidv4();
            
            // Generate device fingerprint
            const deviceFingerprint = await adminAuthService.generateDeviceFingerprint();
            
            const response = await fetch(`${apiConfig.getApiUrl('admin/bridge/request-access')}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Request-ID': requestId,
                    'X-Device-Fingerprint': deviceFingerprint
                },
                body: JSON.stringify({
                    ...requestData,
                    timestamp: new Date().toISOString(),
                    deviceFingerprint
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Bridge access request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Bridge access request error:', error);
            throw error;
        }
    },
    
    /**
     * Check bridge access request status
     * @param {string} requestId Bridge request ID
     * @returns {Promise<Object>} Request status
     */
    checkBridgeStatus: async (requestId) => {
        try {
            const token = localStorage.getItem('admin-token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const response = await fetch(`${apiConfig.getApiUrl(`admin/bridge/status/${requestId}`)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to check bridge status');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Bridge status check error:', error);
            throw error;
        }
    },
    
    /**
     * Approve bridge access request
     * @param {string} requestId Bridge request ID
     * @param {string} securityKey Admin security key
     * @returns {Promise<Object>} Approval result
     */
    approveBridgeRequest: async (requestId, securityKey) => {
        try {
            const token = localStorage.getItem('admin-token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Generate request ID for tracing
            const traceId = uuidv4();
            
            const response = await fetch(`${apiConfig.getApiUrl(`admin/bridge/approve/${requestId}`)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Request-ID': traceId
                },
                body: JSON.stringify({ securityKey })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to approve bridge request');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Bridge approval error:', error);
            throw error;
        }
    },
    
    /**
     * Deny bridge access request
     * @param {string} requestId Bridge request ID
     * @param {string} reason Denial reason
     * @returns {Promise<Object>} Denial result
     */
    denyBridgeRequest: async (requestId, reason) => {
        try {
            const token = localStorage.getItem('admin-token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Generate request ID for tracing
            const traceId = uuidv4();
            
            const response = await fetch(`${apiConfig.getApiUrl(`admin/bridge/deny/${requestId}`)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Request-ID': traceId
                },
                body: JSON.stringify({ reason })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to deny bridge request');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Bridge denial error:', error);
            throw error;
        }
    },
    
    /**
     * Request admin deactivation
     * @param {Object} requestData Deactivation request data
     * @returns {Promise<Object>} Request result
     */
    requestAdminDeactivation: async (requestData) => {
        try {
            const token = localStorage.getItem('admin-token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Generate request ID for tracing
            const requestId = uuidv4();
            
            const response = await fetch(`${apiConfig.getApiUrl('admin/deactivation/request')}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Request-ID': requestId
                },
                body: JSON.stringify({
                    ...requestData,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Deactivation request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Deactivation request error:', error);
            throw error;
        }
    },
    
    /**
     * Check admin deactivation request status
     * @param {string} requestId Deactivation request ID
     * @returns {Promise<Object>} Request status
     */
    checkDeactivationStatus: async (requestId) => {
        try {
            const token = localStorage.getItem('admin-token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const response = await fetch(`${apiConfig.getApiUrl(`admin/deactivation/status/${requestId}`)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to check deactivation status');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Deactivation status check error:', error);
            throw error;
        }
    }
};

export default adminAuthService;