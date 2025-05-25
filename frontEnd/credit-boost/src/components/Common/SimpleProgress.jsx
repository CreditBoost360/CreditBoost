import React from 'react';

/**
 * Simple Progress Bar Component
 * A lightweight progress bar for use in various components
 */
const SimpleProgress = ({ value = 0, className = "", ...props }) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full ${className}`} {...props}>
      <div 
        className="h-full bg-primary rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      ></div>
    </div>
  );
};

export default SimpleProgress;