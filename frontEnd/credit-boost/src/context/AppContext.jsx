import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { unifiedAuthService } from '@/services/unifiedAuth.service';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export const AppContext = createContext();

// List of public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/', '/google-auth'];

export const AppProvider = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(() => {
        try {
            const cached = localStorage.getItem('user_data');
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState(null);
    const [lastAuthCheck, setLastAuthCheck] = useState(0);

    // Enhanced logout with reason tracking
    const logout = useCallback(async (reason = 'user_initiated') => {
        try {
            await unifiedAuthService.logout();
            setIsAuthenticated(false);
            setUser(null);
            
            // Only show toast for user-initiated logouts
            if (reason === 'user_initiated') {
                toast({ title: "Success", description: "Logged out successfully" });
            } else if (reason === 'session_expired') {
                toast({ 
                    title: "Session Expired", 
                    description: "Your session has expired. Please log in again.",
                    variant: "default" 
                });
            }
            
            // Store the current path for redirect after login if not already on a public route
            if (!PUBLIC_ROUTES.includes(location.pathname)) {
                sessionStorage.setItem('redirectAfterLogin', location.pathname);
            }
            
            navigate('/login', { 
                replace: true,
                state: { reason }
            });
        } catch (error) {
            console.error('Logout error:', error);
            toast({ title: "Error", description: "Logout failed", variant: "destructive" });
        }
    }, [navigate, location.pathname]);

    // Check authentication status
    const checkAuthentication = useCallback(async (force = false) => {
        // Don't check too frequently unless forced
        const now = Date.now();
        if (!force && now - lastAuthCheck < 60000) { // 1 minute
            return isAuthenticated;
        }
        
        try {
            setLastAuthCheck(now);
            const isAuth = await unifiedAuthService.isAuthenticated();
            
            if (isAuth && !isAuthenticated) {
                // Get current user data if authenticated but not set in state
                const userData = await unifiedAuthService.getCurrentUser();
                setUser(userData);
                setIsAuthenticated(true);
                setAuthError(null);
                return true;
            } else if (!isAuth && isAuthenticated) {
                // Handle case where server says not authenticated but local state thinks we are
                setIsAuthenticated(false);
                setUser(null);
                return false;
            }
            
            return isAuth;
        } catch (error) {
            console.error("Auth check failed:", error);
            setAuthError(error.message || "Authentication check failed");
            return false;
        }
    }, [isAuthenticated, lastAuthCheck]);

    // Initialize authentication on app load
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                console.log('Initializing authentication, current path:', location.pathname);
                
                // Check localStorage first for quick auth check
                const token = localStorage.getItem('token');
                const userStr = localStorage.getItem('user');
                const isAuthFlag = localStorage.getItem('isAuthenticated');
                
                console.log('Auth state from localStorage:', { 
                    hasToken: !!token, 
                    hasUser: !!userStr,
                    isAuthenticated: isAuthFlag
                });
                
                // Skip auth check for public routes to improve performance
                if (PUBLIC_ROUTES.includes(location.pathname)) {
                    console.log('On public route, skipping auth check');
                    setIsLoading(false);
                    return;
                }
                
                // If we have direct auth data in localStorage, use it
                if (token && userStr && isAuthFlag === 'true') {
                    console.log('Found valid auth data in localStorage, setting authenticated');
                    setIsAuthenticated(true);
                    try {
                        const userData = JSON.parse(userStr);
                        setUser(userData);
                        console.log('User data loaded from localStorage:', userData);
                    } catch (e) {
                        console.error('Error parsing user data:', e);
                    }
                    setIsLoading(false);
                    return;
                }
                
                // Otherwise do a full auth check
                console.log('Performing full authentication check');
                const isAuth = await checkAuthentication(true);
                console.log('Authentication check result:', isAuth);
                
                if (!isAuth && !PUBLIC_ROUTES.includes(location.pathname)) {
                    // If not authenticated and not on a public route, redirect to login
                    console.log('Not authenticated, redirecting to login');
                    sessionStorage.setItem('redirectAfterLogin', location.pathname);
                    navigate('/login', { replace: true });
                }
            } catch (error) {
                console.error("Auth initialization failed:", error);
                setAuthError(error.message || "Authentication initialization failed");
                
                // Clean up on auth errors
                await unifiedAuthService.logout();
                setUser(null);
                setIsAuthenticated(false);
                
                if (!PUBLIC_ROUTES.includes(location.pathname)) {
                    navigate('/login', { replace: true });
                }
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, [navigate, location.pathname, checkAuthentication]);

    // Set up periodic auth check
    useEffect(() => {
        // Skip for public routes
        if (PUBLIC_ROUTES.includes(location.pathname)) {
            return;
        }
        
        // Check auth every 5 minutes
        const authCheckInterval = setInterval(() => {
            checkAuthentication(true).then(isAuth => {
                if (!isAuth && isAuthenticated) {
                    // Session expired during use
                    logout('session_expired');
                }
            });
        }, 5 * 60 * 1000);
        
        return () => clearInterval(authCheckInterval);
    }, [location.pathname, isAuthenticated, checkAuthentication, logout]);

    // Update user helper
    const updateUser = async (newData) => {
        try {
            if (!Object.keys(newData).length) return;

            const updatedUser = await unifiedAuthService.updateUserData(newData);
            setUser(updatedUser);
            
            // Store in localStorage for persistence
            localStorage.setItem('user_data', JSON.stringify(updatedUser));
            
            return updatedUser;
        } catch (error) {
            if (error.message.includes('token') || error.message.includes('auth')) {
                logout('token_invalid');
            }
            throw error;
        }
    };

    // Update user in localStorage when state changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user_data', JSON.stringify(user));
        }
    }, [user]);

    const contextValue = {
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        updateUser,
        logout,
        checkAuthentication,
        authError,
        isLoading
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-sky-600" />
                    <p className="text-gray-600 dark:text-gray-300">Loading CreditBoost...</p>
                </div>
            </div>
        );
    }

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};