import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Language Selector Component
 * Allows users to select their preferred language and handles translations
 */
const LanguageSelector = ({ onLanguageChange, initialLanguage = 'en' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  
  // Available languages
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' }
  ];
  
  // Set initial language from browser or localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
      if (onLanguageChange) onLanguageChange(savedLanguage);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0];
      const supportedLang = languages.find(lang => lang.code === browserLang);
      if (supportedLang) {
        setSelectedLanguage(supportedLang.code);
        if (onLanguageChange) onLanguageChange(supportedLang.code);
      }
    }
  }, []);
  
  // Handle language selection
  const handleSelectLanguage = (langCode) => {
    setSelectedLanguage(langCode);
    localStorage.setItem('preferredLanguage', langCode);
    if (onLanguageChange) onLanguageChange(langCode);
    setIsOpen(false);
  };
  
  // Get current language details
  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0];
  
  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="hidden md:inline">{currentLanguage.name}</span>
      </Button>
      
      {isOpen && (
        <Card className="absolute right-0 mt-2 z-50 w-56 shadow-lg">
          <CardContent className="p-2">
            <div className="max-h-80 overflow-y-auto">
              {languages.map(language => (
                <button
                  key={language.code}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 rounded hover:bg-gray-100 ${
                    selectedLanguage === language.code ? 'bg-primary/10 text-primary' : ''
                  }`}
                  onClick={() => handleSelectLanguage(language.code)}
                >
                  <span className="text-lg">{language.flag}</span>
                  <span>{language.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LanguageSelector;