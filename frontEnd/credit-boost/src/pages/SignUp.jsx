import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { authenticateWithGoogle } from '../api/socialAuth';
import AuthLayout from './Layouts/AuthLayout';
import { authService } from '@/services/auth.service';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

const SignUp = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '', 
        email: '',
        phone: '',
        password: '',
        password2: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validation
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            setError('Please fill in all required fields');
            return;
        }

        if (formData.password !== formData.password2) {
            setError('Passwords do not match');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Password validation - at least 8 chars, one letter, one number, one special char
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            setError('Password must be at least 8 characters long and contain at least one letter, one number, and one special character');
            return;
        }

        setIsSubmitting(true);
        
        try {
            console.log("Starting registration process");
            
            const result = await authService.register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone || null
            });
            
            console.log("Registration successful:", result);
            setShowSuccess(true);
            // Clear form
            setFormData({
                firstName: '',
                lastName: '', 
                email: '',
                phone: '',
                password: '',
                password2: ''
            });
            // Delay navigation to show success message
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error("Registration error:", err);
            // Handle specific error cases
            if (err.message.includes('Email already registered')) {
                setError('This email is already registered. Please try logging in instead.');
            } else {
                setError(err.message || 'Registration failed. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            title="Create an account" 
            subtitle="Get started with CreditBoost"
        >
            {showSuccess && (
                <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                    <CheckCircle2 className="h-5 w-5" />
                    <AlertTitle>Success!</AlertTitle>
                    <AlertDescription>
                        Account created successfully. Redirecting to login...
                    </AlertDescription>
                </Alert>
            )}

            <button
                onClick={authenticateWithGoogle}
                className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm hover:bg-gray-50 mb-6"
            >
                <img src="google.svg" className="w-5 h-5" alt="Google logo" />
                <span>Sign up with Google</span>
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
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSignUp} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            First Name
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:ring-sky-500 dark:bg-gray-800 dark:border-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Last Name
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:ring-sky-500 dark:bg-gray-800 dark:border-gray-700"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:ring-sky-500 dark:bg-gray-800 dark:border-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:ring-sky-500 dark:bg-gray-800 dark:border-gray-700"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:ring-sky-500 dark:bg-gray-800 dark:border-gray-700"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        required
                        value={formData.password2}
                        onChange={(e) => setFormData({...formData, password2: e.target.value})}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:ring-sky-500 dark:bg-gray-800 dark:border-gray-700"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 disabled:opacity-70"
                >
                    {isSubmitting ? "Creating account..." : "Create account"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-sky-600 hover:text-sky-500 font-medium">
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    );
};

export default SignUp;
