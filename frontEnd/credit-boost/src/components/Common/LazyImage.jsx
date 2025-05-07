import React from 'react';
import { useLazyLoad } from '@/hooks/useLazyLoad';
import { cn } from '@/lib/utils';

export function LazyImage({
  src,
  alt,
  className,
  placeholderStyle,
  onLoad: onLoadProp,
  ...props
}) {
  const {
    elementRef,
    isIntersecting,
    hasLoaded,
    handleLoad
  } = useLazyLoad();

  const handleLoadComplete = (e) => {
    handleLoad();
    onLoadProp?.(e);
  };

  return (
    <div className="relative overflow-hidden" ref={elementRef}>
      {!hasLoaded && (
        <div
          className={cn(
            "absolute inset-0 animate-pulse bg-muted",
            placeholderStyle
          )}
        />
      )}
      <img
        src={isIntersecting ? src : undefined}
        data-src={src}
        alt={alt}
        className={cn(
          className,
          !hasLoaded && "opacity-0",
          "transition-opacity duration-300"
        )}
        loading="lazy"
        decoding="async"
        onLoad={handleLoadComplete}
        {...props}
      />
    </div>
  );
}