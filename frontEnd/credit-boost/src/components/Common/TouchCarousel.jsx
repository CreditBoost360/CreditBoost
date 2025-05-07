import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useTouchGesture } from '@/hooks/useTouchGesture';
import { Icon } from '@iconify/react';

export function TouchCarousel({
  items,
  renderItem,
  className,
  gap = 16,
  showArrows = true,
  showDots = true,
  autoPlay = false,
  interval = 5000
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);

  const handleSwipe = useCallback(({ direction, distance }) => {
    if (isAnimating) return;
    
    if (direction === 'left' && currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(true);
    } else if (direction === 'right' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsAnimating(true);
    }
  }, [currentIndex, items.length, isAnimating]);

  const { isGesturing } = useTouchGesture({
    onSwipe: handleSwipe,
    preventScroll: true
  });

  const goToSlide = useCallback((index) => {
    if (isAnimating || index === currentIndex) return;
    setCurrentIndex(index);
    setIsAnimating(true);
  }, [currentIndex, isAnimating]);

  const handleTransitionEnd = () => {
    setIsAnimating(false);
  };

  // Auto play functionality
  React.useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      if (!isGesturing && !isAnimating) {
        const nextIndex = (currentIndex + 1) % items.length;
        goToSlide(nextIndex);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, currentIndex, items.length, isGesturing, isAnimating, goToSlide]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="flex transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          gap: `${gap}px`
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-full"
            style={{ marginRight: index === items.length - 1 ? 0 : `${gap}px` }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <button
            onClick={() => goToSlide(currentIndex - 1)}
            disabled={currentIndex === 0 || isAnimating}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2",
              "p-2 rounded-full bg-white/80 shadow-lg",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "hover:bg-white transition-colors",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-primary"
            )}
          >
            <Icon icon="mdi:chevron-left" className="w-6 h-6" />
          </button>
          <button
            onClick={() => goToSlide(currentIndex + 1)}
            disabled={currentIndex === items.length - 1 || isAnimating}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2",
              "p-2 rounded-full bg-white/80 shadow-lg",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "hover:bg-white transition-colors",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-primary"
            )}
          >
            <Icon icon="mdi:chevron-right" className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Navigation Dots */}
      {showDots && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-primary ring-offset-2",
                index === currentIndex
                  ? "bg-primary w-4"
                  : "bg-white/60 hover:bg-white/80"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}