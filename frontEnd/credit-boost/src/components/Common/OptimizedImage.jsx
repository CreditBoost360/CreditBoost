import React from 'react';
import { cn } from '@/lib/utils';
import { useMediaFeatures } from '@/hooks/useMediaFeatures';
import { LazyImage } from './LazyImage';

export function OptimizedImage({
  src,
  alt,
  srcSet,
  sizes,
  className,
  width,
  height,
  priority = false,
  quality = 75,
  ...props
}) {
  const { 
    shouldLoadHighQualityImages,
    devicePixelRatio,
    prefersReducedData
  } = useMediaFeatures();

  // Calculate optimal quality based on preferences
  const optimizedQuality = prefersReducedData ? 
    Math.min(quality, 60) : // Lower quality for data saving
    shouldLoadHighQualityImages ? 
      quality : // Original quality for high-end devices
      Math.min(quality, 80); // Slightly reduced quality for mid-range devices

  // Generate optimized srcset if not provided
  const optimizedSrcSet = srcSet || (() => {
    if (!width || !src) return undefined;

    const sizes = [0.5, 1, 1.5, 2, 3];
    const maxSize = Math.min(devicePixelRatio * 2, 3); // Cap at 3x
    const relevantSizes = sizes.filter(size => size <= maxSize);

    return relevantSizes
      .map(size => {
        const w = Math.round(width * size);
        // Here you would typically use an image optimization service
        // This is a placeholder for demonstration
        return `${src}?w=${w}&q=${optimizedQuality} ${w}w`;
      })
      .join(', ');
  })();

  // Generate optimal sizes attribute if not provided
  const optimizedSizes = sizes || (width ? `(max-width: ${width}px) 100vw, ${width}px` : undefined);

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={cn(
        'max-w-full h-auto',
        className
      )}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      srcSet={optimizedSrcSet}
      sizes={optimizedSizes}
      {...props}
    />
  );
}