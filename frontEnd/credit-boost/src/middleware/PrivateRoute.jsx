import { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppContext } from '@/context/AppContext';
import { authService } from '@/services/auth.service';
import { apiConfig } from '@/config/api.config';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, setIsAuthenticated } = useContext(AppContext);
    const [isVerifying, setIsVerifying] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                // Check secure context in production
                if (import.meta.env.PROD && !apiConfig.security.isSecureContext()) {
                    console.error('Insecure context detected');
                    setIsAuthenticated(false);
                    return;
                }

                // Verify stored token
                const token = authService.getToken();
                if (!token) {
                    setIsAuthenticated(false);
                    return;
                }

                // Verify token validity and expiration
                if (!apiConfig.security.validateToken(token)) {
                    console.log('Token validation failed');
                    apiConfig.security.clearAuthData();
                    setIsAuthenticated(false);
                    return;
                }

                // Verify with server
                const isValid = await authService.verifyToken();
                if (!isValid) {
                    console.log('Server token verification failed');
                    apiConfig.security.clearAuthData();
                    setIsAuthenticated(false);
                    return;
                }

                setIsAuthenticated(true);
            } catch (error) {
                console.error('Auth verification error:', error);
                setIsAuthenticated(false);
            } finally {
                setIsVerifying(false);
            }
        };

        verifyAuth();
    }, [setIsAuthenticated, location.pathname]);

    if (isVerifying) {
        // You could return a loading spinner here
        return null;
    }

    if (!isAuthenticated) {
        // Store the attempted URL for redirect after login
        const currentPath = location.pathname + location.search;
        if (currentPath !== '/login') {
            sessionStorage.setItem('redirectAfterLogin', currentPath);
        }
        
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute;