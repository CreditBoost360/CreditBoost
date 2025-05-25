import React, { useState, useEffect } from 'react';
import { Check, Globe } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

/**
 * Language Switcher Component
 * 
 * Allows users to switch between different languages
 */
const LanguageSwitcher = ({ className }) => {
  // Available languages
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];
  
  // Get current language from localStorage or browser settings
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && languages.some(lang => lang.code === savedLang)) {
      return savedLang;
    }
    
    // Try to detect browser language
    const browserLang = navigator.language.split('-')[0];
    if (languages.some(lang => lang.code === browserLang)) {
      return browserLang;
    }
    
    // Default to English
    return 'en';
  });
  
  // Update language in localStorage and trigger language change event
  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('preferredLanguage', langCode);
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: langCode } }));
    
    // Reload translations
    loadTranslations(langCode);
  };
  
  // Load translations for the current language
  const loadTranslations = async (langCode) => {
    try {
      // In a real app, this would load translations from a file or API
      // For now, we'll just simulate the loading
      console.log(`Loading translations for ${langCode}`);
      
      // Example of how you might load translations in a real app:
      // const translations = await fetch(`/translations/${langCode}.json`).then(res => res.json());
      // window.translations = translations;
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  };
  
  // Load translations on component mount
  useEffect(() => {
    loadTranslations(currentLanguage);
  }, []);
  
  // Get current language object
  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <Globe className="h-4 w-4 mr-2" />
          <span>{getCurrentLanguage().flag}</span>
          <span className="ml-1 hidden md:inline">{getCurrentLanguage().name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <span className="mr-2">{language.flag}</span>
              <span>{language.name}</span>
            </div>
            {currentLanguage === language.code && (
              <Check className="h-4 w-4 ml-2" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;