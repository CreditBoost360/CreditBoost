import React, { useState, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { useGestures } from '@/hooks/useGestures';
import { useMediaFeatures } from '@/hooks/useMediaFeatures';

export function SwipeableCarousel({
  items,
  renderItem,
  className,
  showArrows = true,
  showDots = true,
  autoPlay = false,
  interval = 5000
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const autoPlayTimer = useRef(null);
  const { prefersReducedMotion } = useMediaFeatures();

  const goToSlide = useCallback((index) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentIndex(index);
    
    // Reset animation flag
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  }, [isAnimating]);

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % items.length);
  }, [currentIndex, items.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentIndex - 1 + items.length) % items.length);
  }, [currentIndex, items.length, goToSlide]);

  // Handle swipe gestures
  const { handlers } = useGestures({
    onSwipe: ({ direction }) => {
      if (direction === 'left') {
        nextSlide();
      } else if (direction === 'right') {
        prevSlide();
      }
    }
  });

  // Auto play functionality
  React.useEffect(() => {
    if (autoPlay && !prefersReducedMotion) {
      autoPlayTimer.current = setInterval(nextSlide, interval);
      
      return () => {
        if (autoPlayTimer.current) {
          clearInterval(autoPlayTimer.current);
        }
      };
    }
  }, [autoPlay, interval, nextSlide, prefersReducedMotion]);

  // Pause auto play on hover
  const handleMouseEnter = () => {
    if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current);
    }
  };

  const handleMouseLeave = () => {
    if (autoPlay && !prefersReducedMotion) {
      autoPlayTimer.current = setInterval(nextSlide, interval);
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden touch-pan-y",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...handlers}
    >
      <div
        className={cn(
          "flex transition-transform duration-300 ease-in-out",
          prefersReducedMotion && "transition-none"
        )}
        style={{
          transform: `translateX(-${currentIndex * 100}%)`
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-full"
            aria-hidden={index !== currentIndex}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {showArrows && items.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2",
              "p-2 rounded-full bg-background/80 shadow-lg",
              "hover:bg-background focus-visible:bg-background",
              "transition-opacity duration-200",
              "disabled:opacity-50"
            )}
            disabled={isAnimating}
            aria-label="Previous slide"
          >
            <Icon icon="mdi:chevron-left" className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2",
              "p-2 rounded-full bg-background/80 shadow-lg",
              "hover:bg-background focus-visible:bg-background",
              "transition-opacity duration-200",
              "disabled:opacity-50"
            )}
            disabled={isAnimating}
            aria-label="Next slide"
          >
            <Icon icon="mdi:chevron-right" className="w-6 h-6" />
          </button>
        </>
      )}

      {showDots && items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                index === currentIndex
                  ? "bg-primary scale-125"
                  : "bg-primary/50 hover:bg-primary/75"
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}