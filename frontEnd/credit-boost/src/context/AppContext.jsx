import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { unifiedAuthService } from '@/services/unifiedAuth.service';
import { toast } from '@/components/ui/use-toast';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const navigate = useNavigate();
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

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Check if user is authenticated with either system
                const isAuth = await unifiedAuthService.isAuthenticated();
                
                if (!isAuth) {
                    setIsLoading(false);
                    return;
                }

                // Get current user data
                const userData = await unifiedAuthService.getCurrentUser();
                setUser(userData);
                setIsAuthenticated(true);
                
            } catch (error) {
                console.error("Auth initialization failed:", error);
                // Clean up on auth errors
                await unifiedAuthService.logout();
                setUser(null);
                setIsAuthenticated(false);
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, [navigate]);

    // Logout helper
    const logout = async () => {
        try {
            await unifiedAuthService.logout();
            setIsAuthenticated(false);
            setUser(null);
            toast({ title: "Success", description: "Logged out successfully" });
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast({ title: "Error", description: "Logout failed", variant: "destructive" });
        }
    };

    // Update user helper
    const updateUser = async (newData) => {
        try {
            if (!Object.keys(newData).length) return;

            const updatedUser = await unifiedAuthService.updateUserData(newData);
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            if (error.message.includes('token') || error.message.includes('auth')) {
                logout();
            }
            throw error;
        }
    };

    const contextValue = {
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        updateUser,
        logout,
        isLoading
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};