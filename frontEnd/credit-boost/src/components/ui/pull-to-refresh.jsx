import React, { useState, useEffect } from 'react';
import { Progress } from './progress';

const PullToRefresh = ({ onRefresh, children }) => {
  const [startY, setStartY] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let touchStartY = 0;
    
    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY;
        setStartY(touchStartY);
        setPulling(true);
      }
    };

    const handleTouchMove = (e) => {
      if (pulling) {
        const touch = e.touches[0];
        const pullDistance = touch.clientY - startY;
        if (pullDistance > 0) {
          e.preventDefault();
          const newProgress = Math.min((pullDistance / 80) * 100, 100);
          setProgress(newProgress);
        }
      }
    };

    const handleTouchEnd = async () => {
      if (progress >= 100) {
        await onRefresh();
      }
      setPulling(false);
      setProgress(0);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, pulling, progress, startY]);

  return (
    <div className="relative">
      {pulling && (
        <Progress 
          value={progress} 
          className="absolute top-0 left-0 right-0 z-50" 
        />
      )}
      {children}
    </div>
  );
};

export default PullToRefresh;