import { useState, useEffect, useCallback } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { useMediaFeatures } from './useMediaFeatures';

export const useOptimizedImage = ({
  src,
  srcSet,
  sizes,
  loading = 'lazy',
  preload = false,
  quality = 'auto',
  placeholder = 'blur'
} = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [blurredDataUrl, setBlurredDataUrl] = useState(null);
  
  const { shouldUseLowData } = useMediaFeatures();
  const { online, effectiveType } = useNetworkStatus();

  // Generate optimized srcSet based on network conditions
  const getOptimizedSrcSet = useCallback(() => {
    if (!srcSet) return undefined;
    
    if (shouldUseLowData || effectiveType === '2g' || effectiveType === 'slow-2g') {
      // Filter to only include smaller images for low data mode
      return srcSet
        .split(',')
        .filter(set => {
          const width = parseInt(set.match(/\d+w/)?.[0] || '0');
          return width <= 640; // Only include images up to 640px wide
        })
        .join(',');
    }
    
    return srcSet;
  }, [srcSet, shouldUseLowData, effectiveType]);

  // Generate tiny blurred placeholder
  const generateBlurPlaceholder = useCallback(async (imageSrc) => {
    if (!online || !imageSrc) return null;
    
    try {
      // Create a tiny version of the image (e.g., 32px wide)
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set canvas size to tiny dimensions
          canvas.width = 32;
          canvas.height = (32 * img.height) / img.width;
          
          // Draw and blur
          ctx.filter = 'blur(8px)';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          resolve(canvas.toDataURL('image/jpeg', 0.5));
        };
        img.src = URL.createObjectURL(blob);
      });
    } catch (error) {
      console.error('Failed to generate blur placeholder:', error);
      return null;
    }
  }, [online]);

  // Preload image
  const preloadImage = useCallback(async (imageSrc) => {
    if (!online || !imageSrc) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageSrc;
      });
      
      setIsLoaded(true);
      return true;
    } catch (err) {
      setError(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [online]);

  // Handle initial load
  useEffect(() => {
    if (!src) return;
    
    const loadImage = async () => {
      // Generate blur placeholder if needed
      if (placeholder === 'blur' && !blurredDataUrl) {
        const dataUrl = await generateBlurPlaceholder(src);
        setBlurredDataUrl(dataUrl);
      }
      
      // Preload image if requested
      if (preload) {
        await preloadImage(src);
      }
    };
    
    loadImage();
  }, [src, preload, placeholder, blurredDataUrl, generateBlurPlaceholder, preloadImage]);

  return {
    isLoaded,
    isLoading,
    error,
    blurredDataUrl,
    optimizedSrcSet: getOptimizedSrcSet(),
    preloadImage,
    imageProps: {
      src,
      srcSet: getOptimizedSrcSet(),
      sizes,
      loading,
      onLoad: () => setIsLoaded(true),
      onError: (e) => setError(e)
    }
  };
};