import React, { useState, useEffect, useRef } from 'react';

const VirtualList = ({ 
  items, 
  height, 
  itemHeight, 
  renderItem, 
  overscan = 3 
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const containerRef = useRef(null);
  const totalHeight = items.length * itemHeight;
  
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const newStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
        setStartIndex(newStartIndex);
      }
    };

    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [itemHeight, overscan]);

  const visibleCount = Math.ceil(height / itemHeight) + 2 * overscan;
  const visibleItems = items.slice(startIndex, startIndex + visibleCount);
  
  return (
    <div
      ref={containerRef}
      className="scroll-view overflow-auto"
      style={{ height, willChange: 'transform' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ 
          position: 'absolute', 
          top: startIndex * itemHeight,
          left: 0,
          right: 0,
        }}>
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              className="virtual-list-item"
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualList;