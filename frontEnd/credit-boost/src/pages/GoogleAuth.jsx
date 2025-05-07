import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import LogoD from '/logo_d.png'
import { useToast } from '@/components/ui/use-toast';
import { handleOAuthCallback } from '../api/socialAuth';
import { unifiedAuthService } from '@/services/unifiedAuth.service';

const GoogleAuth = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);

    // Access the global state
    const { setUser, setIsAuthenticated } = useContext(AppContext);
    //initialize navigation 
    const navigate = useNavigate()
    const [searchParams] = useSearchParams();
    const effectRan = useRef(false)

    useEffect(() => {
        const state = searchParams.get('state');
        const code = searchParams.get('code');

        if (!effectRan.current) {
            const authenticate = async () => {
                try {
                    setIsLoading(true);
                    
                    // First try Supabase authentication
                    const supabaseResult = await unifiedAuthService.handleOAuthCallback();
                    
                    if (supabaseResult.success) {
                        // Supabase authentication successful
                        setIsAuthenticated(true);
                        setUser(supabaseResult.user);
                        toast({ title: "Success", description: "Logged in successfully" });
                        navigate('/dashboard');
                        return;
                    }
                    
                    // If Supabase fails or isn't available, try custom OAuth
                    if (state && code) {
                        const result = await handleOAuthCallback(state, code);
                        
                        if (result.success) {
                            setIsAuthenticated(true);
                            setUser(result.user);
                            toast({ title: "Success", description: "Logged in successfully" });
                            navigate('/dashboard');
                        } else {
                            toast({ title: "Error", description: "Authentication failed", variant: "destructive" });
                            navigate('/login');
                        }
                    } else {
                        // No state/code and Supabase auth failed
                        toast({ title: "Error", description: "Invalid authentication parameters", variant: "destructive" });
                        navigate('/login');
                    }
                } catch (error) {
                    console.error('Authentication error:', error);
                    toast({ title: "Error", description: error.message || "Failed to authenticate", variant: "destructive" });
                    navigate('/login');
                } finally {
                    setIsLoading(false);
                }
            };

            authenticate();
            effectRan.current = true;
        }
    }, [navigate, searchParams, setIsAuthenticated, setUser, toast]);

    return (
        <div className='w-full'>
            <main className='flex min-h-[85vh] items-center justify-center'>
                <div className='md:w-[38%] w-[80%]'>
                    <div className='flex justify-center'>
                        <img src={LogoD} className='h-16 w-16 mb-8' alt="Logo" />
                    </div>

                    <div className='flex justify-center'>
                        <p className='border p-3 rounded-lg py-3'>
                            {isLoading 
                                ? 'Authenticating, you will be redirected in a moment...' 
                                : 'Authentication complete, redirecting...'}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GoogleAuth;