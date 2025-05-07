import { useCallback, useEffect, useState } from 'react';

export const useInteractionHandler = ({
  onPress,
  onLongPress,
  longPressDelay = 500,
  disabled = false
}) => {
  const [pressStartTime, setPressStartTime] = useState(0);
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    let timeoutId;
    if (isPressed && !disabled && !longPressTriggered && onLongPress) {
      timeoutId = setTimeout(() => {
        setLongPressTriggered(true);
        onLongPress();
      }, longPressDelay);
    }
    return () => timeoutId && clearTimeout(timeoutId);
  }, [isPressed, disabled, longPressTriggered, onLongPress, longPressDelay]);

  const handlePressStart = useCallback((e) => {
    if (disabled) return;

    // Prevent default behavior only for touch events to avoid scrolling
    if (e.type.includes('touch')) {
      e.preventDefault();
    }

    setIsPressed(true);
    setPressStartTime(Date.now());
    setLongPressTriggered(false);
  }, [disabled]);

  const handlePressEnd = useCallback((e) => {
    if (disabled) return;

    const pressDuration = Date.now() - pressStartTime;
    setIsPressed(false);

    // Only trigger press if it wasn't a long press
    if (!longPressTriggered && pressDuration < longPressDelay) {
      onPress?.(e);
    }

    setLongPressTriggered(false);
  }, [disabled, pressStartTime, longPressTriggered, longPressDelay, onPress]);

  const handlePressCancel = useCallback(() => {
    setIsPressed(false);
    setLongPressTriggered(false);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePressStart(e);
    }
  }, [disabled, handlePressStart]);

  const handleKeyUp = useCallback((e) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePressEnd(e);
    }
  }, [disabled, handlePressEnd]);

  return {
    isPressed,
    pressHandlers: {
      onMouseDown: handlePressStart,
      onMouseUp: handlePressEnd,
      onMouseLeave: handlePressCancel,
      onTouchStart: handlePressStart,
      onTouchEnd: handlePressEnd,
      onTouchCancel: handlePressCancel,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
    },
  };
};