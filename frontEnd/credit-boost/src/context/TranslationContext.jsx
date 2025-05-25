import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the translation context
const TranslationContext = createContext({
  t: (key) => key,
  currentLanguage: 'en',
  changeLanguage: () => {},
});

// Sample translations for demonstration
const translations = {
  en: {
    // Common
    'app.name': 'CreditBoost',
    'app.tagline': 'Your path to financial freedom',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.download': 'Download',
    'common.share': 'Share',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.creditScore': 'Credit Score',
    'nav.uploadData': 'Upload Data',
    'nav.creditPassport': 'Credit Passport',
    'nav.learn': 'Learn',
    'nav.settings': 'Settings',
    'nav.signOut': 'Sign Out',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.overview': 'Here\'s your financial dashboard overview.',
    'dashboard.creditScore': 'Credit Score',
    'dashboard.learnScore': 'Learn Score',
    'dashboard.gameScore': 'Game Score',
    'dashboard.nextSteps': 'Your Next Steps',
    
    // Credit Passport
    'passport.title': 'Universal Credit Passport',
    'passport.subtitle': 'Your secure, portable financial identity',
    'passport.status': 'Credit Passport Status',
    'passport.active': 'Active',
    'passport.inactive': 'Inactive',
    'passport.description': 'Your Credit Passport is valid and ready to use. It contains your verified financial identity and credit information.',
    'passport.expiresIn': 'Expires in',
    'passport.days': 'days',
    'passport.verificationLevel': 'Verification Level',
    'passport.fullyVerified': 'Fully Verified',
    'passport.pendingVerification': 'Pending Verification',
    'passport.lastUpdated': 'Last Updated',
    'passport.creditScore': 'Credit Score',
    
    // Upload Data
    'upload.title': 'Financial Data Upload Center',
    'upload.subtitle': 'Upload your financial data to get personalized insights and recommendations.',
    'upload.bankStatements': 'Bank Statements',
    'upload.mpesa': 'M-Pesa',
    'upload.creditBureau': 'Credit Bureau',
    'upload.manualEntry': 'Manual Entry',
    'upload.dragDrop': 'Drag and drop your files here',
    'upload.selectFiles': 'Select Files',
    'upload.uploadedFiles': 'Uploaded Files',
    'upload.lastUpdated': 'Last Updated',
    'upload.dataFreshness': 'Data Freshness',
    'upload.upToDate': 'Up to date',
    'upload.gettingOld': 'Getting old',
    'upload.outdated': 'Outdated',
    'upload.noData': 'No Data',
    
    // Credit Score
    'creditScore.title': 'Credit Score Overview',
    'creditScore.updateData': 'Update Data',
    'creditScore.realTimeGraph': 'Credit Score Real-Time Graph',
    'creditScore.breakdown': 'Credit Score Breakdown',
    'creditScore.contributors': 'Contributors to Credit Score',
    'creditScore.dataSources': 'Data Sources',
    'creditScore.status': 'Status',
    'creditScore.lastUpdate': 'Last Update',
    'creditScore.actions': 'Actions',
    'creditScore.connected': 'Connected',
    'creditScore.pending': 'Pending',
    'creditScore.refresh': 'Refresh',
    'creditScore.connect': 'Connect',
  },
  
  sw: {
    // Common
    'app.name': 'CreditBoost',
    'app.tagline': 'Njia yako kuelekea uhuru wa kifedha',
    'common.loading': 'Inapakia...',
    'common.error': 'Hitilafu imetokea',
    'common.save': 'Hifadhi',
    'common.cancel': 'Ghairi',
    'common.delete': 'Futa',
    'common.edit': 'Hariri',
    'common.view': 'Tazama',
    'common.download': 'Pakua',
    'common.share': 'Shiriki',
    'common.yes': 'Ndio',
    'common.no': 'La',
    
    // Navigation
    'nav.dashboard': 'Dashibodi',
    'nav.creditScore': 'Alama ya Mkopo',
    'nav.uploadData': 'Pakia Data',
    'nav.creditPassport': 'Pasipoti ya Mkopo',
    'nav.learn': 'Jifunze',
    'nav.settings': 'Mipangilio',
    'nav.signOut': 'Toka',
    
    // Dashboard
    'dashboard.welcome': 'Karibu tena',
    'dashboard.overview': 'Hapa kuna muhtasari wa dashibodi yako ya kifedha.',
    'dashboard.creditScore': 'Alama ya Mkopo',
    'dashboard.learnScore': 'Alama ya Kujifunza',
    'dashboard.gameScore': 'Alama ya Mchezo',
    'dashboard.nextSteps': 'Hatua Zako Zinazofuata',
    
    // Credit Passport
    'passport.title': 'Pasipoti ya Mkopo ya Kimataifa',
    'passport.subtitle': 'Utambulisho wako salama na wa kubebeka wa kifedha',
    'passport.status': 'Hali ya Pasipoti ya Mkopo',
    'passport.active': 'Inafanya kazi',
    'passport.inactive': 'Haifanyi kazi',
    'passport.description': 'Pasipoti yako ya Mkopo ni halali na tayari kutumika. Ina utambulisho wako wa kifedha uliothibitishwa na taarifa za mkopo.',
    'passport.expiresIn': 'Inaisha baada ya',
    'passport.days': 'siku',
    'passport.verificationLevel': 'Kiwango cha Uthibitishaji',
    'passport.fullyVerified': 'Imethibitishwa Kikamilifu',
    'passport.pendingVerification': 'Uthibitishaji Unasubiri',
    'passport.lastUpdated': 'Imesasishwa Mwisho',
    'passport.creditScore': 'Alama ya Mkopo',
    
    // Upload Data
    'upload.title': 'Kituo cha Kupakia Data ya Kifedha',
    'upload.subtitle': 'Pakia data yako ya kifedha ili kupata ufahamu na mapendekezo ya kibinafsi.',
    'upload.bankStatements': 'Taarifa za Benki',
    'upload.mpesa': 'M-Pesa',
    'upload.creditBureau': 'Ofisi ya Mikopo',
    'upload.manualEntry': 'Ingizo la Mkono',
    'upload.dragDrop': 'Buruta na uache faili zako hapa',
    'upload.selectFiles': 'Chagua Faili',
    'upload.uploadedFiles': 'Faili Zilizopakiwa',
    'upload.lastUpdated': 'Imesasishwa Mwisho',
    'upload.dataFreshness': 'Usafi wa Data',
    'upload.upToDate': 'Imesasishwa',
    'upload.gettingOld': 'Inakuwa ya zamani',
    'upload.outdated': 'Imepitwa na wakati',
    'upload.noData': 'Hakuna Data',
    
    // Credit Score
    'creditScore.title': 'Muhtasari wa Alama ya Mkopo',
    'creditScore.updateData': 'Sasisha Data',
    'creditScore.realTimeGraph': 'Grafu ya Alama ya Mkopo ya Wakati Halisi',
    'creditScore.breakdown': 'Uchambuzi wa Alama ya Mkopo',
    'creditScore.contributors': 'Wachangiaji wa Alama ya Mkopo',
    'creditScore.dataSources': 'Vyanzo vya Data',
    'creditScore.status': 'Hali',
    'creditScore.lastUpdate': 'Sasishi ya Mwisho',
    'creditScore.actions': 'Vitendo',
    'creditScore.connected': 'Imeunganishwa',
    'creditScore.pending': 'Inasubiri',
    'creditScore.refresh': 'Onyesha upya',
    'creditScore.connect': 'Unganisha',
  },
  
  fr: {
    // Common
    'app.name': 'CreditBoost',
    'app.tagline': 'Votre chemin vers la liberté financière',
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur est survenue',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.download': 'Télécharger',
    'common.share': 'Partager',
    'common.yes': 'Oui',
    'common.no': 'Non',
    
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.creditScore': 'Score de crédit',
    'nav.uploadData': 'Télécharger des données',
    'nav.creditPassport': 'Passeport de crédit',
    'nav.learn': 'Apprendre',
    'nav.settings': 'Paramètres',
    'nav.signOut': 'Déconnexion',
    
    // Dashboard
    'dashboard.welcome': 'Bienvenue',
    'dashboard.overview': 'Voici l\'aperçu de votre tableau de bord financier.',
    'dashboard.creditScore': 'Score de crédit',
    'dashboard.learnScore': 'Score d\'apprentissage',
    'dashboard.gameScore': 'Score de jeu',
    'dashboard.nextSteps': 'Vos prochaines étapes',
    
    // Credit Passport
    'passport.title': 'Passeport de crédit universel',
    'passport.subtitle': 'Votre identité financière sécurisée et portable',
    'passport.status': 'Statut du passeport de crédit',
    'passport.active': 'Actif',
    'passport.inactive': 'Inactif',
    'passport.description': 'Votre passeport de crédit est valide et prêt à être utilisé. Il contient votre identité financière vérifiée et vos informations de crédit.',
    'passport.expiresIn': 'Expire dans',
    'passport.days': 'jours',
    'passport.verificationLevel': 'Niveau de vérification',
    'passport.fullyVerified': 'Entièrement vérifié',
    'passport.pendingVerification': 'Vérification en attente',
    'passport.lastUpdated': 'Dernière mise à jour',
    'passport.creditScore': 'Score de crédit',
  }
};

/**
 * Translation Provider Component
 * 
 * Provides translation functionality across the application
 */
export const TranslationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && translations[savedLang]) {
      return savedLang;
    }
    
    // Try to detect browser language
    const browserLang = navigator.language.split('-')[0];
    if (translations[browserLang]) {
      return browserLang;
    }
    
    // Default to English
    return 'en';
  });
  
  // Listen for language change events
  useEffect(() => {
    const handleLanguageChange = (event) => {
      const { language } = event.detail;
      if (translations[language]) {
        setCurrentLanguage(language);
      }
    };
    
    window.addEventListener('languageChange', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);
  
  // Translation function
  const t = (key) => {
    if (!translations[currentLanguage]) {
      return translations.en[key] || key;
    }
    
    return translations[currentLanguage][key] || translations.en[key] || key;
  };
  
  // Change language function
  const changeLanguage = (language) => {
    if (translations[language]) {
      setCurrentLanguage(language);
      localStorage.setItem('preferredLanguage', language);
      
      // Dispatch custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('languageChange', { detail: { language } }));
    }
  };
  
  return (
    <TranslationContext.Provider value={{ t, currentLanguage, changeLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook for using translations
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export default TranslationContext;