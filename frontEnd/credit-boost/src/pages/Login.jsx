import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import LanguageSelector from '@/components/LanguageSelector';
import { authService } from '@/services/auth.service';

const Login = () => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [loginMethod, setLoginMethod] = useState('email');
  const navigate = useNavigate();
  
  // Load preferred language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setPreferredLanguage(savedLanguage);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (browserLang) {
        setPreferredLanguage(browserLang);
        localStorage.setItem('preferredLanguage', browserLang);
      }
    }
  }, []);
  
  // Handle language change
  const handleLanguageChange = (langCode) => {
    setPreferredLanguage(langCode);
    localStorage.setItem('preferredLanguage', langCode);
  };
  
  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Login form submitted');
      
      // Prepare login data based on selected method
      const loginData = {
        password,
        language: preferredLanguage
      };
      
      if (loginMethod === 'email') {
        loginData.email = email;
        console.log('Logging in with email:', email);
      } else {
        loginData.phoneNumber = phoneNumber;
        console.log('Logging in with phone number:', phoneNumber);
      }
      
      // Call the auth service to login
      console.log('Calling auth service login...');
      const response = await authService.login(loginData);
      console.log('Login successful, response:', response);
      
      // Store user data and token
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('preferredLanguage', preferredLanguage);
      
      console.log('Authentication data stored in localStorage');
      console.log('Current localStorage state:', { 
        isAuthenticated: localStorage.getItem('isAuthenticated'),
        hasToken: !!localStorage.getItem('token'),
        hasUser: !!localStorage.getItem('user')
      });
      
      // Redirect to dashboard
      console.log('Redirecting to dashboard...');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Translations for login page
  const translations = {
    en: {
      title: 'Login',
      description: 'Enter your credentials to access your account',
      emailLabel: 'Email',
      emailPlaceholder: 'Enter your email',
      phoneLabel: 'Phone Number',
      phonePlaceholder: 'Enter your phone number',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      forgotPassword: 'Forgot password?',
      loginButton: 'Login',
      noAccount: 'Don\'t have an account?',
      signUp: 'Sign up',
      languageSelector: 'Select Language',
      emailTab: 'Email',
      phoneTab: 'Phone',
      showPassword: 'Show password',
      hidePassword: 'Hide password'
    },
    es: {
      title: 'Iniciar sesión',
      description: 'Ingrese sus credenciales para acceder a su cuenta',
      emailLabel: 'Correo electrónico',
      emailPlaceholder: 'Ingrese su correo electrónico',
      phoneLabel: 'Número de teléfono',
      phonePlaceholder: 'Ingrese su número de teléfono',
      passwordLabel: 'Contraseña',
      passwordPlaceholder: 'Ingrese su contraseña',
      forgotPassword: '¿Olvidó su contraseña?',
      loginButton: 'Iniciar sesión',
      noAccount: '¿No tiene una cuenta?',
      signUp: 'Registrarse',
      languageSelector: 'Seleccionar idioma',
      emailTab: 'Correo',
      phoneTab: 'Teléfono',
      showPassword: 'Mostrar contraseña',
      hidePassword: 'Ocultar contraseña'
    },
    fr: {
      title: 'Connexion',
      description: 'Entrez vos identifiants pour accéder à votre compte',
      emailLabel: 'Email',
      emailPlaceholder: 'Entrez votre email',
      phoneLabel: 'Numéro de téléphone',
      phonePlaceholder: 'Entrez votre numéro de téléphone',
      passwordLabel: 'Mot de passe',
      passwordPlaceholder: 'Entrez votre mot de passe',
      forgotPassword: 'Mot de passe oublié?',
      loginButton: 'Se connecter',
      noAccount: 'Vous n\'avez pas de compte?',
      signUp: 'S\'inscrire',
      languageSelector: 'Sélectionner la langue',
      emailTab: 'Email',
      phoneTab: 'Téléphone',
      showPassword: 'Afficher le mot de passe',
      hidePassword: 'Masquer le mot de passe'
    }
  };
  
  // Get translations for current language (fallback to English)
  const t = translations[preferredLanguage] || translations.en;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{t.languageSelector}:</span>
            <LanguageSelector 
              initialLanguage={preferredLanguage}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">CreditBoost</h1>
          <p className="mt-2 text-gray-600">Improve your financial health</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{t.title}</CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <Tabs 
                defaultValue="email" 
                className="w-full" 
                onValueChange={(value) => setLoginMethod(value)}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email">{t.emailTab}</TabsTrigger>
                  <TabsTrigger value="phone">{t.phoneTab}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="email" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.emailLabel}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required={loginMethod === 'email'}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="phone" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">{t.phoneLabel}</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder={t.phonePlaceholder}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required={loginMethod === 'phone'}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t.passwordLabel}</Label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    {t.forgotPassword}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? t.hidePassword : t.showPassword}
                  </button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{t.loginButton}...</span>
                  </div>
                ) : (
                  t.loginButton
                )}
              </Button>
              
              <div className="text-center text-sm">
                {t.noAccount}{' '}
                <Link to="/register" className="text-primary hover:underline">
                  {t.signUp}
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;