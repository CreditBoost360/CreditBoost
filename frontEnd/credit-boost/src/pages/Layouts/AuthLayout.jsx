import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logos/logo-no-bg.png'

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="w-full border-b bg-white">
                <div className="container mx-auto px-6 py-1">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={logo} alt="Company Logo" className="w-50 h-10" />
                        <span>
                            <span className="font-brand text-brand-credit">CREDIT</span>
                            <span className="font-brand text-brand-boost text-primary">BOOST</span>
                        </span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="min-h-[calc(100vh-57px)] flex">
                <div className="w-full lg:w-1/2 p-2 lg:p-4 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">{title}</h2>
                            <p className="text-muted-foreground text-sm">{subtitle}</p>
                        </div>
                        {children}
                    </div>
                </div>

                {/* Right side - Credit Score Illustration */}
                <div className="hidden lg:flex w-1/2 bg-primary/5 items-center justify-center p-6">
                    <div className="max-w-lg flex flex-col items-center">
                        <svg viewBox="0 0 400 400" className="w-full h-full transform transition-transform hover:scale-105 duration-300 motion-reduce:transition-none">
                            <circle 
                                cx="200" 
                                cy="200" 
                                r="160" 
                                fill="none" 
                                stroke="currentColor" 
                                className="text-primary motion-safe:animate-[dash_2s_ease-in-out]" 
                                strokeWidth="20" 
                                strokeDasharray="840" 
                                strokeDashoffset="180"
                                style={{
                                    '@media(prefersReducedMotion: reduce)': {
                                        animation: 'none',
                                        strokeDashoffset: '0'
                                    }
                                }}
                            />
                            <text 
                                x="200" 
                                y="180" 
                                textAnchor="middle" 
                                className="text-6xl font-bold fill-primary motion-safe:animate-[fadeIn_1s_ease-in]"
                            >
                                750
                            </text>
                        </svg>
                        <h3 className="text-2xl font-bold text-gray-800 mt-6 text-center">Build Your Credit Score</h3>
                        <p className="text-gray-600 mt-2 text-center">
                            Track, improve, and maintain your credit score with our expert tools and guidance.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t py-6 text-sm text-muted-foreground">
                <div className="container mx-auto px-6">
                    <div className="flex justify-center space-x-4">
                        <span>&copy; CreditBoost</span>
                        <a href="#" className="hover:text-primary">Contact</a>
                        <a href="#" className="hover:text-primary">Privacy & Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AuthLayout;