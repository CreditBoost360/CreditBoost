import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useMediaFeatures } from '@/hooks/useMediaFeatures';

export function ContextMenu({ 
  children,
  items,
  disabled = false,
  className 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);
  const longPressTimeout = useRef(null);
  const { prefersReducedMotion } = useMediaFeatures();

  const handleContextMenu = (e) => {
    if (disabled) return;
    
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    showMenu(e.clientX, e.clientY, rect);
  };

  const handleTouchStart = (e) => {
    if (disabled) return;

    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    
    longPressTimeout.current = setTimeout(() => {
      e.preventDefault();
      showMenu(touch.clientX, touch.clientY, rect);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }
  };

  const showMenu = (x, y, containerRect) => {
    // Calculate position, keeping menu within viewport
    const menuWidth = 200; // Approximate menu width
    const menuHeight = items.length * 40; // Approximate menu height
    
    let menuX = x;
    let menuY = y;

    // Adjust horizontal position
    if (x + menuWidth > window.innerWidth) {
      menuX = window.innerWidth - menuWidth - 8;
    }

    // Adjust vertical position
    if (y + menuHeight > window.innerHeight) {
      menuY = window.innerHeight - menuHeight - 8;
    }

    setPosition({ x: menuX, y: menuY });
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
        className={cn("touch-callout-none", className)}
      >
        {children}
      </div>
      {isOpen && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: position.y,
            left: position.x,
            zIndex: 50
          }}
          className={cn(
            "bg-popover text-popover-foreground rounded-md shadow-lg p-1 min-w-[8rem]",
            "animate-in fade-in-0 zoom-in-95",
            prefersReducedMotion && "animate-none"
          )}
        >
          <div className="flex flex-col space-y-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  closeMenu();
                  item.onClick?.();
                }}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-sm",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:outline-none focus-visible:bg-accent focus-visible:text-accent-foreground",
                  "disabled:opacity-50 disabled:pointer-events-none",
                  item.destructive && "text-destructive hover:text-destructive-foreground"
                )}
                disabled={item.disabled}
              >
                {item.icon && (
                  <item.icon className="mr-2 h-4 w-4" />
                )}
                {item.label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}