import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Sun,
  Moon,
  KeyRound
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Admin Login Component
 * This component provides the login interface for administrators.
 * It includes multi-factor authentication for Level 6 administrators.
 */
const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1 = credentials, 2 = 2FA
  const [darkMode, setDarkMode] = useState(false);
  const [securityKey, setSecurityKey] = useState('');
  const [showSecurityKey, setShowSecurityKey] = useState(false);
  const [isLevel6, setIsLevel6] = useState(false);
  
  // Check for preferred theme and existing session
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    // Check if already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('admin-token');
      if (token) {
        try {
          const response = await fetch('/api/admin/auth/verify', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            navigate('/admin/dashboard');
          }
        } catch (err) {
          // Token invalid, continue with login
          localStorage.removeItem('admin-token');
        }
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin-theme', 'light');
    }
  };
  
  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      setLoading(true);
      
      if (step === 1) {
        // Validate email and password
        if (!email || !password) {
          throw new Error('Email and password are required');
        }
        
        // Verify credentials
        const response = await fetch('/api/admin/auth/login/step1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Invalid credentials');
        }
        
        // Check if this is a Level 6 admin
        setIsLevel6(data.accessLevel === 6);
        
        // Move to 2FA step
        setStep(2);
        setLoading(false);
      } else if (step === 2) {
        // Validate 2FA code
        if (!twoFactorCode) {
          throw new Error('Two-factor authentication code is required');
        }
        
        // Verify 2FA code
        const response = await fetch('/api/admin/auth/login/step2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            email, 
            twoFactorCode 
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Invalid authentication code');
        }
        
        // If Level 6 admin, proceed to security key step
        if (isLevel6) {
          setStep(3);
          setLoading(false);
        } else {
          // For regular admins, complete login
          localStorage.setItem('admin-token', data.token);
          navigate('/admin/dashboard');
        }
      } else if (step === 3) {
        // Validate security key
        if (!securityKey) {
          throw new Error('Security key is required for Level 6 access');
        }
        
        // Verify security key
        const response = await fetch('/api/admin/auth/login/step3', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            email, 
            securityKey 
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Invalid security key');
        }
        
        // Complete login
        localStorage.setItem('admin-token', data.token);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to log in. Please check your credentials and try again.');
      setLoading(false);
    }
  };
  
  // Handle back button in multi-step login
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setTwoFactorCode('');
    } else if (step === 3) {
      setStep(2);
      setSecurityKey('');
    }
    setError(null);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      
      <Card className={`w-full max-w-md ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}>
        <CardHeader className="space-y-1 flex flex-col items-center text-center">
          <div className={`h-12 w-12 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-blue-100'} flex items-center justify-center mb-2`}>
            <Shield className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <CardTitle className={`text-2xl ${darkMode ? 'text-white' : ''}`}>Admin Portal</CardTitle>
          <CardDescription className={darkMode ? 'text-gray-400' : ''}>
            {step === 1 ? 'Enter your credentials to access the admin dashboard' : 
             step === 2 ? 'Enter your two-factor authentication code' :
             'Enter your daily security key for Level 6 access'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className={`mb-4 ${darkMode ? 'bg-red-900/30 border-red-900/50 text-red-300' : ''}`}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className={`absolute left-3 top-3 h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className={`absolute left-3 top-3 h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="text-right">
                  <a 
                    href="/admin/forgot-password" 
                    className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
            ) : step === 2 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <KeyRound className={`absolute left-3 top-3 h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <Input
                      type="text"
                      placeholder="Authentication code"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      className={`pl-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                      required
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                    />
                  </div>
                </div>
                
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Shield className={`absolute left-3 top-3 h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <Input
                      type={showSecurityKey ? "text" : "password"}
                      placeholder="Level 6 Security Key"
                      value={securityKey}
                      onChange={(e) => setSecurityKey(e.target.value)}
                      className={`pl-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecurityKey(!showSecurityKey)}
                      className={`absolute right-3 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {showSecurityKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className={`p-3 rounded-md ${darkMode ? 'bg-blue-900/20 border border-blue-900/30' : 'bg-blue-50 border border-blue-100'}`}>
                  <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                    Level 6 access requires your daily security key. This key is rotated every 24 hours
                    and is only provided to authorized Level 6 administrators.
                  </p>
                </div>
              </div>
            )}
            
            <div className={`mt-6 ${step > 1 ? 'flex justify-between' : ''}`}>
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack}
                  className={darkMode ? 'border-gray-600 hover:bg-gray-700' : ''}
                >
                  Back
                </Button>
              )}
              
              <Button 
                type="submit" 
                className={`${step === 1 ? 'w-full' : ''} ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {step === 1 ? 'Signing in...' : step === 2 ? 'Verifying...' : 'Authenticating...'}
                  </div>
                ) : (
                  step === 1 ? 'Sign In' : step === 2 ? 'Verify' : 'Access'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        
        <CardFooter className={`flex flex-col space-y-2 ${darkMode ? 'border-t border-gray-700' : 'border-t'}`}>
          <div className={`text-xs text-center w-full pt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>This is a secure area. All actions are logged and monitored.</p>
            <p className="mt-1">Each admin has a unique identifier for complete audit trail.</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLogin;