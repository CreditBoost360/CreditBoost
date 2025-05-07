import React, { useState, useEffect } from 'react';

const PullToRefresh = ({ onRefresh, children }) => {
  const [startY, setStartY] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const handleTouchStart = (e) => {
    // Only trigger pull to refresh if we're at the top of the page
    if (window.scrollY === 0) {
      setStartY(e.touches[0].pageY);
      setPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!pulling) return;
    
    const currentY = e.touches[0].pageY;
    const pullDistance = currentY - startY;
    
    if (pullDistance > 0) {
      // Prevent default scrolling behavior
      e.preventDefault();
      
      // Apply resistance to the pull
      const element = document.getElementById('ptr-indicator');
      if (element) {
        element.style.transform = `translateY(${Math.min(pullDistance / 2, 100)}px)`;
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!pulling) return;
    
    setPulling(false);
    const element = document.getElementById('ptr-indicator');
    
    if (element && element.style.transform) {
      const pullDistance = parseInt(element.style.transform.match(/\d+/)[0]);
      
      if (pullDistance > 50) {
        setRefreshing(true);
        element.style.transform = 'translateY(50px)';
        
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
          element.style.transform = 'translateY(0)';
        }
      } else {
        element.style.transform = 'translateY(0)';
      }
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ overflowY: 'hidden' }}
    >
      <div
        id="ptr-indicator"
        style={{
          transition: pulling ? 'none' : 'transform 0.2s ease-out',
          position: 'relative',
          textAlign: 'center',
          height: '0'
        }}
      >
        <div style={{ height: '50px', marginTop: '-50px' }}>
          {refreshing ? 'Refreshing...' : 'Pull to refresh'}
        </div>
      </div>
      {children}
    </div>
  );
};

export default PullToRefresh;