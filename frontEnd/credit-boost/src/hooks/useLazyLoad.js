import { useEffect, useRef, useState } from 'react';

export const useLazyLoad = (options = {}) => {
  const [isIntersecting, setIntersecting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) return;

    // Check if native lazy loading is supported
    const hasNativeLazy = 'loading' in HTMLImageElement.prototype;

    if (hasNativeLazy && !options.forceIntersectionObserver) {
      setIntersecting(true);
      return;
    }

    observerRef.current = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
      if (entry.isIntersecting) {
        observerRef.current.disconnect();
      }
    }, {
      rootMargin: '50px',
      threshold: 0,
      ...options
    });

    observerRef.current.observe(elementRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [options]);

  const handleLoad = () => {
    setHasLoaded(true);
  };

  return {
    elementRef,
    isIntersecting,
    hasLoaded,
    handleLoad
  };
};