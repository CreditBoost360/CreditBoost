import { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { AppContext } from '@/context/AppContext';
import { unifiedAuthService } from '@/services/unifiedAuth.service';
import { apiConfig } from '@/config/api.config';
import { Loader2 } from 'lucide-react';

const PrivateRoute = () => {
    const { isAuthenticated, setIsAuthenticated, setUser, logout } = useContext(AppContext);
    const [isVerifying, setIsVerifying] = useState(true);
    const [verificationAttempts, setVerificationAttempts] = useState(0);
    const location = useLocation();

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                // Check secure context in production
                if (import.meta.env.PROD && !apiConfig.security.isSecureContext()) {
                    console.error('Insecure context detected');
                    setIsAuthenticated(false);
                    setIsVerifying(false);
                    return;
                }

                // Try unified auth service first (handles both JWT and Supabase)
                console.log('Verifying authentication...');
                
                // First check if we have a token in localStorage
                const token = localStorage.getItem('token');
                const userStr = localStorage.getItem('user');
                const isAuthFlag = localStorage.getItem('isAuthenticated');
                
                console.log('Auth state from localStorage:', { 
                    hasToken: !!token, 
                    hasUser: !!userStr,
                    isAuthenticated: isAuthFlag
                });
                
                // If we have both token and user data, consider authenticated
                if (token && userStr && isAuthFlag === 'true') {
                    console.log('Found valid auth data in localStorage');
                    setIsAuthenticated(true);
                    try {
                        setUser(JSON.parse(userStr));
                    } catch (e) {
                        console.error('Error parsing user data:', e);
                    }
                    setIsVerifying(false);
                    return;
                }
                
                // Otherwise check with the service
                const isAuth = await unifiedAuthService.isAuthenticated();
                console.log('Authentication verification result:', isAuth);
                
                if (!isAuth) {
                    console.log('Authentication verification failed');
                    setIsAuthenticated(false);
                    setIsVerifying(false);
                    return;
                }
                
                // Get current user data if authenticated
                try {
                    const userData = await unifiedAuthService.getCurrentUser();
                    setUser(userData);
                    setIsAuthenticated(true);
                } catch (userError) {
                    console.error('Error fetching user data:', userError);
                    // If we can't get user data but auth passed, still allow access
                    // but log the error
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Auth verification error:', error);
                
                // If we've tried multiple times and still failing, clear auth data
                if (verificationAttempts >= 2) {
                    console.log('Multiple verification failures, logging out');
                    await logout('verification_failed');
                } else {
                    // Increment attempts for next try
                    setVerificationAttempts(prev => prev + 1);
                    setIsAuthenticated(false);
                }
            } finally {
                setIsVerifying(false);
            }
        };

        verifyAuth();
    }, [setIsAuthenticated, setUser, logout, location.pathname, verificationAttempts]);

    if (isVerifying) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Verifying your access...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Store the attempted URL for redirect after login
        const currentPath = location.pathname + location.search;
        if (currentPath !== '/login') {
            sessionStorage.setItem('redirectAfterLogin', currentPath);
        }
        
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;