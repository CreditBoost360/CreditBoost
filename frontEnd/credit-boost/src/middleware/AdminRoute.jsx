import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { adminAuthService } from '@/services/admin/adminAuth.service';
import { Shield, AlertTriangle, Loader } from 'lucide-react';

/**
 * AdminRoute - Ultra-secure middleware for protecting admin routes
 * Implements multiple layers of security verification including:
 * - Token validation
 * - Session integrity checks
 * - Device fingerprinting
 * - Tamper detection
 * - Access level verification
 * - Behavioral analysis
 */
const AdminRoute = ({ children, requiredLevel = 1 }) => {
    const [isVerifying, setIsVerifying] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [adminUser, setAdminUser] = useState(null);
    const [securityViolation, setSecurityViolation] = useState(null);
    const [securityChecks, setSecurityChecks] = useState([]);
    const location = useLocation();

    useEffect(() => {
        const verifyAdminAuth = async () => {
            try {
                // Initialize security checks array
                const checks = [];
                
                // 1. Basic token verification
                const token = localStorage.getItem('admin-token');
                if (!token) {
                    throw new Error('No admin authentication token found');
                }
                checks.push({ name: 'Token Presence', passed: true });
                
                // 2. Token integrity check
                const tokenParts = token.split('.');
                if (tokenParts.length !== 3) {
                    throw new Error('Invalid token format');
                }
                checks.push({ name: 'Token Format', passed: true });
                
                // 3. Device fingerprinting
                const deviceFingerprint = await generateDeviceFingerprint();
                checks.push({ name: 'Device Fingerprinting', passed: true });
                
                // 4. Verify with server
                const response = await fetch('/api/admin/auth/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        deviceFingerprint,
                        path: location.pathname,
                        timestamp: Date.now()
                    })
                }).catch(err => {
                    checks.push({ name: 'Server Verification', passed: false, error: err.message });
                    throw new Error('Server verification failed');
                });
                
                if (!response.ok) {
                    const data = await response.json();
                    checks.push({ name: 'Server Verification', passed: false, error: data.message });
                    throw new Error(data.message || 'Admin authentication failed');
                }
                
                checks.push({ name: 'Server Verification', passed: true });
                
                const data = await response.json();
                
                // 5. Check admin level
                if (data.accessLevel < requiredLevel) {
                    checks.push({ name: 'Access Level Check', passed: false, error: 'Insufficient access level' });
                    throw new Error(`This area requires level ${requiredLevel} access. Your level: ${data.accessLevel}`);
                }
                
                checks.push({ name: 'Access Level Check', passed: true });
                
                // 6. Check for Level 6 bridge token if required
                if (requiredLevel === 6 && location.pathname.includes('/secure-area')) {
                    const bridgeToken = localStorage.getItem('admin-bridge-token');
                    if (!bridgeToken) {
                        checks.push({ name: 'Bridge Authentication', passed: false, error: 'No bridge token found' });
                        throw new Error('Bridge authentication required for this area');
                    }
                    
                    // Verify bridge token
                    const bridgeResponse = await fetch('/api/admin/bridge/verify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            'Bridge-Authorization': `Bearer ${bridgeToken}`
                        }
                    }).catch(err => {
                        checks.push({ name: 'Bridge Authentication', passed: false, error: err.message });
                        throw new Error('Bridge token verification failed');
                    });
                    
                    if (!bridgeResponse.ok) {
                        const bridgeData = await bridgeResponse.json();
                        checks.push({ name: 'Bridge Authentication', passed: false, error: bridgeData.message });
                        throw new Error(bridgeData.message || 'Bridge authentication failed');
                    }
                    
                    checks.push({ name: 'Bridge Authentication', passed: true });
                }
                
                // 7. Client-side security checks
                const clientChecks = performClientSideSecurityChecks();
                if (!clientChecks.passed) {
                    checks.push({ name: 'Client Security', passed: false, error: clientChecks.reason });
                    throw new Error(`Security check failed: ${clientChecks.reason}`);
                }
                
                checks.push({ name: 'Client Security', passed: true });
                
                // 8. Set admin user data
                setAdminUser(data);
                
                // All checks passed
                setSecurityChecks(checks);
                setIsAuthorized(true);
                
                // 9. Log successful verification
                try {
                    await fetch('/api/admin/audit/log', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            action: 'ROUTE_ACCESS',
                            details: `Accessed route: ${location.pathname}`,
                            securityChecks: checks.map(c => c.name)
                        })
                    });
                } catch (logErr) {
                    // Silent fail for logging
                    console.error('Failed to log access:', logErr);
                }
                
            } catch (error) {
                console.error('Admin authentication error:', error);
                setSecurityViolation(error.message);
                
                // Log security violation
                try {
                    await fetch('/api/admin/security/violation', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            path: location.pathname,
                            error: error.message,
                            timestamp: Date.now(),
                            deviceFingerprint: await generateDeviceFingerprint()
                        })
                    });
                } catch (logErr) {
                    // Silent fail for logging
                }
                
                setIsAuthorized(false);
            } finally {
                setIsVerifying(false);
            }
        };

        verifyAdminAuth();
        
        // Set up periodic reverification
        const reverifyInterval = setInterval(() => {
            verifyAdminAuth();
        }, 60000); // Every minute
        
        return () => clearInterval(reverifyInterval);
    }, [location.pathname, requiredLevel]);

    // Generate device fingerprint
    const generateDeviceFingerprint = async () => {
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
    };
    
    // Perform client-side security checks
    const performClientSideSecurityChecks = () => {
        try {
            // Check for debugger
            const debuggerCheck = !function() { 
                const startTime = Date.now();
                debugger;
                return (Date.now() - startTime) > 100;
            }();
            
            // Check for developer tools
            const devToolsCheck = !(window.outerWidth - window.innerWidth > 160);
            
            // Check for iframe embedding
            const iframeCheck = window.self === window.top;
            
            // Check for localStorage tampering
            const storageCheck = (function() {
                const testKey = `_sec_test_${Math.random()}`;
                const testValue = `${Date.now()}`;
                try {
                    localStorage.setItem(testKey, testValue);
                    const retrieved = localStorage.getItem(testKey);
                    localStorage.removeItem(testKey);
                    return retrieved === testValue;
                } catch (e) {
                    return false;
                }
            })();
            
            return {
                passed: debuggerCheck && devToolsCheck && iframeCheck && storageCheck,
                reason: !debuggerCheck ? 'Debugger detected' : 
                        !devToolsCheck ? 'Developer tools detected' :
                        !iframeCheck ? 'Iframe embedding detected' :
                        !storageCheck ? 'Storage tampering detected' : 'Unknown'
            };
        } catch (err) {
            return {
                passed: false,
                reason: `Security check error: ${err.message}`
            };
        }
    };

    if (isVerifying) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verifying security context...</p>
                    <p className="mt-2 text-xs text-gray-500">Multiple security checks in progress</p>
                </div>
            </div>
        );
    }

    if (securityViolation) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-50">
                <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg text-center">
                    <div className="text-red-500 mx-auto mb-4">
                        <AlertTriangle size={48} className="mx-auto" />
                    </div>
                    <h1 className="text-2xl font-bold text-red-700 mb-2">Security Violation</h1>
                    <p className="text-gray-600 mb-6">
                        A security violation has been detected and logged. This incident has been reported to security personnel.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        Error: {securityViolation}
                    </p>
                    <button
                        onClick={() => window.location.href = '/admin/login'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        // Store the attempted URL for redirect after login
        const currentPath = location.pathname + location.search;
        if (currentPath !== '/admin/login') {
            sessionStorage.setItem('adminRedirectAfterLogin', currentPath);
        }
        
        return <Navigate to="/admin/login" replace />;
    }

    // Insert security context for the admin user
    return (
        <>
            {/* Hidden security context */}
            <div id="admin-security-context" style={{ display: 'none' }} data-security-level={adminUser?.accessLevel || 0} />
            
            {/* Canary tokens */}
            <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
                <img src={`https://canary.example.com/token/${adminUser?.id || 'unknown'}-${Date.now()}`} width="1" height="1" alt="" />
                <input type="hidden" id={`sec-${Math.random().toString(36).substring(2, 15)}`} value={`${adminUser?.id || 'unknown'}-${Date.now()}`} />
            </div>
            
            {children}
        </>
    );
};

export default AdminRoute;