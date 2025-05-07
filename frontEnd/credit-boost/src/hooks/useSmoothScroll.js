import { useCallback, useEffect, useRef } from 'react';
import { useMediaFeatures } from './useMediaFeatures';

export const useSmoothScroll = ({ threshold = 1000 } = {}) => {
  const { prefersReducedMotion, isHighEndDevice } = useMediaFeatures();
  const frameId = useRef(null);
  const startTime = useRef(null);
  const startPosition = useRef(null);

  const easeInOutCubic = (t) => 
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

  const scrollTo = useCallback((targetY, duration = 500) => {
    // Use native smooth scroll for high-end devices that don't prefer reduced motion
    if (isHighEndDevice && !prefersReducedMotion && 'scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
      return;
    }

    // Custom implementation for better control and fallback
    const animate = (currentTime) => {
      if (!startTime.current) {
        startTime.current = currentTime;
        startPosition.current = window.scrollY;
      }

      const timeElapsed = currentTime - startTime.current;
      const progress = Math.min(timeElapsed / duration, 1);
      const easeProgress = easeInOutCubic(progress);
      
      const distance = targetY - startPosition.current;
      const position = startPosition.current + (distance * easeProgress);

      window.scrollTo(0, position);

      if (progress < 1) {
        frameId.current = requestAnimationFrame(animate);
      } else {
        // Cleanup
        startTime.current = null;
        startPosition.current = null;
      }
    };

    if (frameId.current) {
      cancelAnimationFrame(frameId.current);
    }

    frameId.current = requestAnimationFrame(animate);
  }, [isHighEndDevice, prefersReducedMotion]);

  const scrollToElement = useCallback((element, offset = 0) => {
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const targetPosition = elementPosition - offset;

    // Calculate distance to determine if we should animate
    const distance = Math.abs(window.scrollY - targetPosition);
    
    if (distance < threshold || prefersReducedMotion) {
      // For small distances or when reduced motion is preferred, jump instantly
      window.scrollTo(0, targetPosition);
    } else {
      // For larger distances, smooth scroll with duration based on distance
      const duration = Math.min(Math.max(distance / 2, 300), 1000);
      scrollTo(targetPosition, duration);
    }
  }, [threshold, prefersReducedMotion, scrollTo]);

  useEffect(() => {
    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
    };
  }, []);

  return {
    scrollTo,
    scrollToElement
  };
};