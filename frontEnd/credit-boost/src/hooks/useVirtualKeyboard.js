import { useEffect, useState } from 'react';

export const useVirtualKeyboard = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    // Only run on mobile devices
    if (typeof window === 'undefined' || window.innerWidth > 768) return;

    const detectKeyboard = () => {
      // iOS detection
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      
      if (isIOS) {
        // iOS reports correct viewport height when keyboard is shown
        const vh = window.visualViewport?.height || window.innerHeight;
        const windowHeight = window.innerHeight;
        const diff = windowHeight - vh;
        
        setIsKeyboardVisible(diff > 100);
        setKeyboardHeight(diff);
      } else {
        // Android detection
        const isAndroid = /Android/.test(navigator.userAgent);
        if (isAndroid) {
          window.visualViewport?.addEventListener('resize', () => {
            const vh = window.visualViewport?.height || window.innerHeight;
            const windowHeight = window.innerHeight;
            const diff = windowHeight - vh;
            
            setIsKeyboardVisible(diff > 100);
            setKeyboardHeight(diff);
          });
        }
      }
    };

    // Handle window resize
    window.addEventListener('resize', detectKeyboard);
    // Handle viewport changes
    window.visualViewport?.addEventListener('resize', detectKeyboard);

    // Initial detection
    detectKeyboard();

    return () => {
      window.removeEventListener('resize', detectKeyboard);
      window.visualViewport?.removeEventListener('resize', detectKeyboard);
    };
  }, []);

  return {
    isKeyboardVisible,
    keyboardHeight,
    // Helper function to scroll element into view when keyboard is shown
    scrollIntoView: (element) => {
      if (!element || !isKeyboardVisible) return;
      
      // Use native scroll into view with smooth behavior
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };
};