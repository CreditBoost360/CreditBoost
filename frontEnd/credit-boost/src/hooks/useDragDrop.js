import { useState, useCallback, useRef } from 'react';

export const useDragDrop = ({ onDrop, validate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const touchTimeout = useRef(null);
  const dragCounter = useRef(0);

  const handleDrop = useCallback(async (files) => {
    if (!files?.length) return;
    
    try {
      if (validate) {
        await validate(files[0]);
      }
      onDrop?.(files);
    } catch (error) {
      console.error('File validation failed:', error);
      // You might want to show an error toast here
    }
  }, [onDrop, validate]);

  const onDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items?.length) {
      setIsDragging(true);
    }
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDropEvent = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = Array.from(e.dataTransfer.files);
    handleDrop(files);
  }, [handleDrop]);

  // Touch event handlers
  const onTouchStart = useCallback((e) => {
    touchTimeout.current = setTimeout(() => {
      setIsTouchDragging(true);
    }, 500); // Wait 500ms to distinguish from taps
  }, []);

  const onTouchMove = useCallback((e) => {
    if (touchTimeout.current) {
      clearTimeout(touchTimeout.current);
      touchTimeout.current = null;
    }
    if (isTouchDragging) {
      e.preventDefault(); // Prevent scrolling while dragging
    }
  }, [isTouchDragging]);

  const onTouchEnd = useCallback((e) => {
    if (touchTimeout.current) {
      clearTimeout(touchTimeout.current);
      touchTimeout.current = null;
    }
    setIsTouchDragging(false);
  }, []);

  // Handle file input change
  const onFileInputChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    handleDrop(files);
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  }, [handleDrop]);

  return {
    isDragging: isDragging || isTouchDragging,
    dragHandlers: {
      onDragEnter,
      onDragLeave,
      onDragOver,
      onDrop: onDropEvent,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onChange: onFileInputChange,
    }
  };
};