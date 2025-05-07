import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export const useScrollRestoration = (dependencies = []) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef(new Map());
  const isRestoringScroll = useRef(false);

  // Save scroll position before leaving
  useEffect(() => {
    if (!isRestoringScroll.current) {
      const key = location.key;
      scrollPositions.current.set(key, {
        x: window.scrollX,
        y: window.scrollY,
        timestamp: Date.now()
      });

      // Clean up old scroll positions (older than 30 minutes)
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
      for (const [key, value] of scrollPositions.current.entries()) {
        if (value.timestamp < thirtyMinutesAgo) {
          scrollPositions.current.delete(key);
        }
      }
    }
  }, [location, ...dependencies]);

  // Restore scroll position
  useEffect(() => {
    if (navigationType === 'POP') {
      const key = location.key;
      const savedPosition = scrollPositions.current.get(key);

      if (savedPosition) {
        isRestoringScroll.current = true;

        // Wait for any dynamic content to render
        requestAnimationFrame(() => {
          window.scrollTo({
            left: savedPosition.x,
            top: savedPosition.y,
            behavior: 'instant' // Use instant to avoid smooth scrolling when restoring
          });

          // Reset the flag after a short delay to ensure scroll is complete
          setTimeout(() => {
            isRestoringScroll.current = false;
          }, 100);
        });
      } else {
        // If no saved position, scroll to top
        window.scrollTo(0, 0);
      }
    } else if (navigationType === 'PUSH') {
      // For new routes, scroll to top
      window.scrollTo(0, 0);
    }
  }, [location, navigationType]);

  // Prevent scroll restoration on page reload
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  // Handle mobile browser's overscroll behavior
  useEffect(() => {
    const handleTouchMove = (e) => {
      const isAtTop = window.scrollY === 0;
      const isAtBottom = 
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight;

      if ((isAtTop && e.touches[0].clientY > 60) || 
          (isAtBottom && e.touches[0].clientY < -60)) {
        e.preventDefault();
      }
    };

    // Only add the listener on touch devices
    if ('ontouchstart' in window) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      if ('ontouchstart' in window) {
        document.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, []);

  return {
    isRestoringScroll: isRestoringScroll.current
  };
};