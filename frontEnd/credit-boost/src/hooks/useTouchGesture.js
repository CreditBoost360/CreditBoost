import { useState, useEffect, useCallback, useRef } from 'react';

export const useTouchGesture = ({
  onSwipe,
  onPinch,
  onRotate,
  onLongPress,
  onDoubleTap,
  longPressDelay = 500,
  doubleTapDelay = 300,
  minSwipeDistance = 50,
  preventScroll = false
} = {}) => {
  const [gesture, setGesture] = useState(null);
  const touchRef = useRef({
    startTime: 0,
    startX: 0,
    startY: 0,
    lastTap: 0,
    lastDistance: 0,
    lastAngle: 0
  });
  const timeoutRef = useRef(null);

  // Calculate distance between two touch points
  const getDistance = useCallback((touch1, touch2) => {
    return Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
  }, []);

  // Calculate angle between two touch points
  const getAngle = useCallback((touch1, touch2) => {
    return (Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    ) * 180) / Math.PI;
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    if (preventScroll) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    const now = Date.now();

    touchRef.current = {
      ...touchRef.current,
      startTime: now,
      startX: touch.clientX,
      startY: touch.clientY
    };

    // Handle double tap
    if (onDoubleTap) {
      const timeSinceLastTap = now - touchRef.current.lastTap;
      if (timeSinceLastTap < doubleTapDelay) {
        onDoubleTap(e);
        touchRef.current.lastTap = 0; // Reset to prevent triple tap
      } else {
        touchRef.current.lastTap = now;
      }
    }

    // Handle long press
    if (onLongPress) {
      timeoutRef.current = setTimeout(() => {
        onLongPress(e);
      }, longPressDelay);
    }

    // Handle multi-touch gestures
    if (e.touches.length === 2) {
      const dist = getDistance(e.touches[0], e.touches[1]);
      const angle = getAngle(e.touches[0], e.touches[1]);
      touchRef.current.lastDistance = dist;
      touchRef.current.lastAngle = angle;
    }

    setGesture('start');
  }, [preventScroll, onDoubleTap, onLongPress, doubleTapDelay, longPressDelay, getDistance, getAngle]);

  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    if (preventScroll) {
      e.preventDefault();
    }

    // Clear long press timeout on move
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (e.touches.length === 1 && onSwipe) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchRef.current.startX;
      const deltaY = touch.clientY - touchRef.current.startY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance >= minSwipeDistance) {
        const direction = Math.abs(deltaX) > Math.abs(deltaY)
          ? deltaX > 0 ? 'right' : 'left'
          : deltaY > 0 ? 'down' : 'up';

        onSwipe({ direction, distance, deltaX, deltaY });
      }
    } else if (e.touches.length === 2) {
      // Handle pinch
      if (onPinch) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / touchRef.current.lastDistance;
        onPinch({ scale, currentDistance });
        touchRef.current.lastDistance = currentDistance;
      }

      // Handle rotation
      if (onRotate) {
        const currentAngle = getAngle(e.touches[0], e.touches[1]);
        const rotation = currentAngle - touchRef.current.lastAngle;
        onRotate({ rotation, currentAngle });
        touchRef.current.lastAngle = currentAngle;
      }
    }

    setGesture('move');
  }, [preventScroll, onSwipe, onPinch, onRotate, minSwipeDistance, getDistance, getAngle]);

  // Handle touch end
  const handleTouchEnd = useCallback((e) => {
    if (preventScroll) {
      e.preventDefault();
    }

    // Clear long press timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setGesture('end');
  }, [preventScroll]);

  // Set up event listeners
  useEffect(() => {
    const options = { passive: !preventScroll };

    document.addEventListener('touchstart', handleTouchStart, options);
    document.addEventListener('touchmove', handleTouchMove, options);
    document.addEventListener('touchend', handleTouchEnd, options);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventScroll]);

  return {
    gesture,
    isGesturing: gesture === 'move'
  };
};