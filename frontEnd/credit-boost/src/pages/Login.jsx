import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { authenticateWithGoogle } from '../api/socialAuth';
import AuthLayout from './Layouts/AuthLayout';
import { unifiedAuthService } from '@/services/unifiedAuth.service';
import { useToast } from '@/components/ui/use-toast';

const LoginPage = () => {
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [authProvider, setAuthProvider] = useState('jwt'); // Default to JWT
    
    const { setIsAuthenticated, setUser } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const isAuth = await unifiedAuthService.isAuthenticated();
            if (isAuth) {
                navigate('/dashboard', { replace: true });
            }
            setIsLoading(false);
        };
        
        checkAuth();
    }, [navigate]);
    
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        
        try {
            const response = await unifiedAuthService.login(email, password, authProvider);
            console.log('Login response:', response);
            
            setIsAuthenticated(true);
            setUser(response.user);
            
            toast({ title: "Success", description: "Login successful" });
            navigate('/dashboard', { replace: true }); 
        } catch (err) {
            console.error('Login error:', err);
            setError('Invalid email or password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleAuthProvider = () => {
        setAuthProvider(prev => prev === 'jwt' ? 'supabase' : 'jwt');
        toast({ description: `Switched to ${authProvider === 'jwt' ? 'Supabase' : 'JWT'} authentication` });
    };

    if (isLoading) {
        return null;
    }

    return (
        <AuthLayout 
            title="Welcome back"
            subtitle="Sign in to continue to your account"
        >
            <button
                onClick={authenticateWithGoogle}
                className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm hover:bg-gray-50 mb-6"
            >
                <img src="google.svg" className="w-5 h-5" alt="Google logo" />
                <span>Continue with Google</span>
            </button>
            
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">Or continue with</span>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:ring-sky-500 dark:bg-gray-800 dark:border-gray-700"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <Link to="/forgot-password" className="text-sm text-sky-600 hover:text-sky-500">
                            Forgot password?
                        </Link>
                    </div>
                    <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:ring-sky-500 dark:bg-gray-800 dark:border-gray-700"
                    />
                </div>

                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={toggleAuthProvider}
                        className="text-xs text-sky-600 hover:text-sky-500 ml-auto"
                    >
                        Using {authProvider === 'jwt' ? 'JWT' : 'Supabase'} auth
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/signup" className="text-sky-600 hover:text-sky-500 font-medium">
                    Sign up
                </Link>
            </p>
        </AuthLayout>
    );
};

export default LoginPage;