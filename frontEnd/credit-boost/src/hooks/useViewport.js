import { useState, useEffect, useCallback } from 'react';

export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
    orientation: 'portrait',
    visualViewport: null,
    keyboardHeight: 0,
    isLandscape: false
  });

  // Handle resize and orientation changes
  const updateViewport = useCallback(() => {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    const visualViewport = window.visualViewport;
    
    // Calculate keyboard height for mobile devices
    const keyboardHeight = visualViewport ? 
      Math.max(0, document.documentElement.clientHeight - visualViewport.height) : 0;

    setViewport({
      width: vw,
      height: vh,
      orientation: window.screen.orientation?.type || (vw > vh ? 'landscape' : 'portrait'),
      visualViewport,
      keyboardHeight,
      isLandscape: vw > vh
    });
  }, []);

  // Initialize and set up listeners
  useEffect(() => {
    // Initial update
    updateViewport();

    // Standard resize listener
    window.addEventListener('resize', updateViewport);

    // Orientation change listener
    if ('orientation' in window.screen) {
      window.screen.orientation.addEventListener('change', updateViewport);
    } else {
      window.addEventListener('orientationchange', updateViewport);
    }

    // Visual Viewport API listener for keyboards
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
      window.visualViewport.addEventListener('scroll', updateViewport);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateViewport);
      
      if ('orientation' in window.screen) {
        window.screen.orientation.removeEventListener('change', updateViewport);
      } else {
        window.removeEventListener('orientationchange', updateViewport);
      }

      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewport);
        window.visualViewport.removeEventListener('scroll', updateViewport);
      }
    };
  }, [updateViewport]);

  // Handle iOS Safari viewport inconsistencies
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      const viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      viewportMeta.content = 'width=device-width, initial-scale=1, maximum-scale=1';
      document.head.appendChild(viewportMeta);
    }

    // Fix iOS Safari 100vh issue
    const setCustomVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setCustomVh();
    window.addEventListener('resize', setCustomVh);

    return () => window.removeEventListener('resize', setCustomVh);
  }, []);

  // Utility functions
  const lockOrientation = useCallback(async (orientation = 'natural') => {
    try {
      if (window.screen?.orientation?.lock) {
        await window.screen.orientation.lock(orientation);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to lock orientation:', error);
      return false;
    }
  }, []);

  const unlockOrientation = useCallback(() => {
    try {
      if (window.screen?.orientation?.unlock) {
        window.screen.orientation.unlock();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unlock orientation:', error);
      return false;
    }
  }, []);

  return {
    ...viewport,
    lockOrientation,
    unlockOrientation
  };
};