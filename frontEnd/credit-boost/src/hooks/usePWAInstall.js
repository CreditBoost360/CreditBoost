import { useState, useEffect, useCallback } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { useSoundFeedback } from './useSoundFeedback';

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { online } = useNetworkStatus();
  const { feedback } = useSoundFeedback();

  // Check if app is installed
  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone ||
                          document.referrer.includes('android-app://');
      
      setIsInstalled(isStandalone);
    };

    checkInstalled();
    window.addEventListener('appinstalled', checkInstalled);

    return () => window.removeEventListener('appinstalled', checkInstalled);
  }, []);

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Handle installation
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt || !online) return false;

    try {
      const result = await deferredPrompt.prompt();
      
      // Clear the prompt
      setDeferredPrompt(null);
      setIsInstallable(false);

      // Play success feedback if installed
      if (result?.outcome === 'accepted') {
        feedback('success');
      }

      return result?.outcome === 'accepted';
    } catch (error) {
      console.error('Installation failed:', error);
      return false;
    }
  }, [deferredPrompt, online, feedback]);

  // Function to check requirements
  const checkRequirements = useCallback(() => {
    const requirements = {
      https: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
      serviceWorker: 'serviceWorker' in navigator,
      webManifest: !!document.querySelector('link[rel="manifest"]'),
      ios: /iPad|iPhone|iPod/.test(navigator.userAgent),
      android: /Android/.test(navigator.userAgent)
    };

    const missing = Object.entries(requirements)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    return {
      satisfied: missing.length === 0,
      missing,
      requirements
    };
  }, []);

  // Function to get installation instructions
  const getInstallInstructions = useCallback(() => {
    const ua = navigator.userAgent;
    
    if (/iPad|iPhone|iPod/.test(ua)) {
      return {
        platform: 'iOS',
        steps: [
          'Tap the Share button in Safari',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to confirm'
        ]
      };
    } else if (/Android/.test(ua)) {
      return {
        platform: 'Android',
        steps: [
          'Tap the menu button (three dots)',
          'Tap "Install app" or "Add to Home screen"',
          'Follow the installation prompts'
        ]
      };
    } else {
      return {
        platform: 'Desktop',
        steps: [
          'Click the install icon in the address bar',
          'Click "Install" in the prompt',
          'Follow any additional installation prompts'
        ]
      };
    }
  }, []);

  return {
    isInstallable,
    isInstalled,
    promptInstall,
    checkRequirements,
    getInstallInstructions
  };
};