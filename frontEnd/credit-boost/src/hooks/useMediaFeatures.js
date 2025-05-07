import { useState, useEffect } from 'react';
import { useNetworkStatus } from './useNetworkStatus';

export const useMediaFeatures = () => {
  const { isSlow, shouldUseLowData } = useNetworkStatus();
  const [preferences, setPreferences] = useState({
    prefersReducedMotion: false,
    prefersReducedData: false,
    prefersLightTheme: true,
    devicePixelRatio: 1,
    isHighEndDevice: true
  });

  useEffect(() => {
    const updatePreferences = () => {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Check for data saver mode
      const prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches || 
                                shouldUseLowData;
      
      // Check color scheme preference
      const prefersLightTheme = window.matchMedia('(prefers-color-scheme: light)').matches;
      
      // Get device pixel ratio
      const devicePixelRatio = window.devicePixelRatio || 1;
      
      // Determine if this is a high-end device
      const isHighEndDevice = (() => {
        const navigator = window.navigator;
        if ('deviceMemory' in navigator) {
          return navigator.deviceMemory > 4; // More than 4GB RAM
        }
        if ('hardwareConcurrency' in navigator) {
          return navigator.hardwareConcurrency > 4; // More than 4 cores
        }
        return true; // Default to true if we can't detect
      })();

      setPreferences({
        prefersReducedMotion,
        prefersReducedData,
        prefersLightTheme,
        devicePixelRatio,
        isHighEndDevice
      });
    };

    // Initial check
    updatePreferences();

    // Set up media query listeners
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reducedDataQuery = window.matchMedia('(prefers-reduced-data: reduce)');
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: light)');

    // Modern event listener
    const addListener = (mediaQuery, handler) => {
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handler);
      }
    };

    const removeListener = (mediaQuery, handler) => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handler);
      }
    };

    // Add listeners
    addListener(reducedMotionQuery, updatePreferences);
    addListener(reducedDataQuery, updatePreferences);
    addListener(colorSchemeQuery, updatePreferences);

    // Cleanup
    return () => {
      removeListener(reducedMotionQuery, updatePreferences);
      removeListener(reducedDataQuery, updatePreferences);
      removeListener(colorSchemeQuery, updatePreferences);
    };
  }, [shouldUseLowData]);

  // Helper functions for commonly used combinations
  const shouldLoadHighQualityImages = !preferences.prefersReducedData && 
                                    preferences.isHighEndDevice && 
                                    preferences.devicePixelRatio > 1;

  const shouldEnableAnimations = !preferences.prefersReducedMotion && 
                                preferences.isHighEndDevice;

  return {
    ...preferences,
    shouldLoadHighQualityImages,
    shouldEnableAnimations,
    isSlow
  };
};