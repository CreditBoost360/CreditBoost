import { useCallback, useRef, useState } from 'react';

export const useGestures = ({
  onSwipe,
  onPinch,
  onRotate,
  threshold = 50,
  velocityThreshold = 0.3,
  rotationThreshold = 15,
  pinchThreshold = 0.2
} = {}) => {
  const touchRef = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    initialDistance: 0,
    initialAngle: 0
  });
  const [gesture, setGesture] = useState(null);

  const calculateVelocity = (distance, time) => {
    return Math.abs(distance) / time;
  };

  const getDistance = (touches) => {
    return Math.hypot(
      touches[1].clientX - touches[0].clientX,
      touches[1].clientY - touches[0].clientY
    );
  };

  const getAngle = (touches) => {
    return Math.atan2(
      touches[1].clientY - touches[0].clientY,
      touches[1].clientX - touches[0].clientX
    ) * 180 / Math.PI;
  };

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      // Single touch - potential swipe
      touchRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        startTime: Date.now(),
        type: 'swipe'
      };
    } else if (e.touches.length === 2) {
      // Multi-touch - potential pinch/rotate
      touchRef.current = {
        initialDistance: getDistance(e.touches),
        initialAngle: getAngle(e.touches),
        startTime: Date.now(),
        type: 'transform'
      };
    }
    setGesture(null);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchRef.current.startTime) return;

    if (touchRef.current.type === 'swipe' && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - touchRef.current.startX;
      const deltaY = e.touches[0].clientY - touchRef.current.startY;
      const time = (Date.now() - touchRef.current.startTime) / 1000; // Convert to seconds
      
      if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
        const velocity = calculateVelocity(Math.max(Math.abs(deltaX), Math.abs(deltaY)), time);
        
        if (velocity > velocityThreshold) {
          const direction = Math.abs(deltaX) > Math.abs(deltaY)
            ? deltaX > 0 ? 'right' : 'left'
            : deltaY > 0 ? 'down' : 'up';
          
          setGesture({ type: 'swipe', direction, velocity });
          onSwipe?.({ direction, velocity, deltaX, deltaY });
        }
      }
    } else if (touchRef.current.type === 'transform' && e.touches.length === 2) {
      const currentDistance = getDistance(e.touches);
      const currentAngle = getAngle(e.touches);
      
      const scale = currentDistance / touchRef.current.initialDistance;
      const rotation = currentAngle - touchRef.current.initialAngle;
      
      if (Math.abs(1 - scale) > pinchThreshold) {
        setGesture({ type: 'pinch', scale });
        onPinch?.({ scale });
      }
      
      if (Math.abs(rotation) > rotationThreshold) {
        setGesture({ type: 'rotate', rotation });
        onRotate?.({ rotation });
      }
    }
  }, [threshold, velocityThreshold, rotationThreshold, pinchThreshold, onSwipe, onPinch, onRotate]);

  const handleTouchEnd = useCallback(() => {
    touchRef.current = {};
    setGesture(null);
  }, []);

  return {
    gesture,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd
    }
  };
};