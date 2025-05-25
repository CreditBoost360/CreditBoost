import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AuthenticatedLayout from './Layouts/AuthenticatedLayout';
import LanguageSelector from '@/components/LanguageSelector';
import CurrencyConverter from '@/components/CurrencyConverter';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [userSettings, setUserSettings] = useState({
    language: 'en',
    currency: 'USD',
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      shareData: false,
      allowAnalytics: true
    }
  });
  
  // Available currencies
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' }
  ];
  
  // Handle language change
  const handleLanguageChange = (langCode) => {
    setUserSettings(prev => ({
      ...prev,
      language: langCode
    }));
  };
  
  // Handle currency change
  const handleCurrencyChange = (currencyCode) => {
    setUserSettings(prev => ({
      ...prev,
      currency: currencyCode
    }));
  };
  
  // Handle theme change
  const handleThemeChange = (theme) => {
    setUserSettings(prev => ({
      ...prev,
      theme
    }));
    
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  };
  
  // Handle notification setting change
  const handleNotificationChange = (type, value) => {
    setUserSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value
      }
    }));
  };
  
  // Handle privacy setting change
  const handlePrivacyChange = (type, value) => {
    setUserSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [type]: value
      }
    }));
  };
  
  // Save settings
  const saveSettings = () => {
    // In a real app, this would save to backend
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    
    // Show success message
    alert('Settings saved successfully!');
  };
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setUserSettings(JSON.parse(savedSettings));
    }
    
    // Apply theme
    document.documentElement.classList.add(userSettings.theme);
  }, []);
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Settings Navigation */}
          <div className="w-full md:w-64 space-y-2">
            <Button
              variant={activeTab === 'general' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('general')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              General
            </Button>
            <Button
              variant={activeTab === 'language' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('language')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="m5 8 6 6"></path>
                <path d="m4 14 6-6 2-3"></path>
                <path d="M2 5h12"></path>
                <path d="M7 2h1"></path>
                <path d="m22 22-5-10-5 10"></path>
                <path d="M14 18h6"></path>
              </svg>
              Language & Region
            </Button>
            <Button
              variant={activeTab === 'notifications' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('notifications')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
              </svg>
              Notifications
            </Button>
            <Button
              variant={activeTab === 'privacy' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('privacy')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Privacy & Security
            </Button>
            <Button
              variant={activeTab === 'currency' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('currency')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <circle cx="12" cy="12" r="8"></circle>
                <line x1="3" x2="6" y1="3" y2="6"></line>
                <line x1="21" x2="18" y1="3" y2="6"></line>
                <line x1="3" x2="6" y1="21" y2="18"></line>
                <line x1="21" x2="18" y1="21" y2="18"></line>
              </svg>
              Currency Converter
            </Button>
          </div>
          
          {/* Settings Content */}
          <div className="flex-1">
            {activeTab === 'general' && (
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Selection */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Theme</h3>
                    <div className="flex gap-2">
                      <Button
                        variant={userSettings.theme === 'light' ? 'default' : 'outline'}
                        onClick={() => handleThemeChange('light')}
                        className="flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="4"></circle>
                          <path d="M12 2v2"></path>
                          <path d="M12 20v2"></path>
                          <path d="m4.93 4.93 1.41 1.41"></path>
                          <path d="m17.66 17.66 1.41 1.41"></path>
                          <path d="M2 12h2"></path>
                          <path d="M20 12h2"></path>
                          <path d="m6.34 17.66-1.41 1.41"></path>
                          <path d="m19.07 4.93-1.41 1.41"></path>
                        </svg>
                        Light
                      </Button>
                      <Button
                        variant={userSettings.theme === 'dark' ? 'default' : 'outline'}
                        onClick={() => handleThemeChange('dark')}
                        className="flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                        </svg>
                        Dark
                      </Button>
                    </div>
                  </div>
                  
                  {/* Language Quick Setting */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Language</h3>
                    <LanguageSelector 
                      initialLanguage={userSettings.language}
                      onLanguageChange={handleLanguageChange}
                    />
                  </div>
                  
                  {/* Currency Quick Setting */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Currency</h3>
                    <div className="flex flex-wrap gap-2">
                      {currencies.slice(0, 5).map(currency => (
                        <Button
                          key={currency.code}
                          variant={userSettings.currency === currency.code ? 'default' : 'outline'}
                          onClick={() => handleCurrencyChange(currency.code)}
                          className="flex items-center gap-2"
                        >
                          <span>{currency.flag}</span>
                          <span>{currency.code}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={saveSettings}>Save Settings</Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {activeTab === 'language' && (
              <Card>
                <CardHeader>
                  <CardTitle>Language & Region Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Language Selection */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Select Language</h3>
                    <p className="text-muted-foreground mb-4">
                      Choose your preferred language for the application interface
                    </p>
                    <LanguageSelector 
                      initialLanguage={userSettings.language}
                      onLanguageChange={handleLanguageChange}
                    />
                  </div>
                  
                  {/* Currency Selection */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Select Currency</h3>
                    <p className="text-muted-foreground mb-4">
                      Choose your preferred currency for financial calculations and displays
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {currencies.map(currency => (
                        <Button
                          key={currency.code}
                          variant={userSettings.currency === currency.code ? 'default' : 'outline'}
                          onClick={() => handleCurrencyChange(currency.code)}
                          className="flex items-center gap-2 justify-start"
                        >
                          <span>{currency.flag}</span>
                          <div className="text-left">
                            <div>{currency.code}</div>
                            <div className="text-xs text-muted-foreground">{currency.name}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={saveSettings}>Save Settings</Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Notification Channels</h3>
                    <p className="text-muted-foreground mb-4">
                      Choose how you want to receive notifications
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Email Notifications</div>
                          <div className="text-sm text-muted-foreground">Receive updates via email</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={userSettings.notifications.email}
                            onChange={(e) => handleNotificationChange('email', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Push Notifications</div>
                          <div className="text-sm text-muted-foreground">Receive notifications in your browser</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={userSettings.notifications.push}
                            onChange={(e) => handleNotificationChange('push', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">SMS Notifications</div>
                          <div className="text-sm text-muted-foreground">Receive text messages for important updates</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={userSettings.notifications.sms}
                            onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={saveSettings}>Save Settings</Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {activeTab === 'privacy' && (
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Data Sharing</h3>
                    <p className="text-muted-foreground mb-4">
                      Control how your data is used and shared
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Share Financial Data</div>
                          <div className="text-sm text-muted-foreground">Allow sharing anonymized financial data for improved recommendations</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={userSettings.privacy.shareData}
                            onChange={(e) => handlePrivacyChange('shareData', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Usage Analytics</div>
                          <div className="text-sm text-muted-foreground">Allow collection of usage data to improve the application</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={userSettings.privacy.allowAnalytics}
                            onChange={(e) => handlePrivacyChange('allowAnalytics', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={saveSettings}>Save Settings</Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {activeTab === 'currency' && (
              <Card>
                <CardHeader>
                  <CardTitle>Currency Converter</CardTitle>
                </CardHeader>
                <CardContent>
                  <CurrencyConverter />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Settings;