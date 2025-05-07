import { useEffect, useCallback, useRef } from 'react';
import { useVirtualKeyboard } from './useVirtualKeyboard';

export const useInputKeyboard = ({ inputRef, onSubmit }) => {
  const lastInputHeight = useRef(0);
  const { isKeyboardVisible, keyboardHeight } = useVirtualKeyboard();

  // Adjust scroll when keyboard appears
  useEffect(() => {
    if (!inputRef?.current || !isKeyboardVisible) return;

    const input = inputRef.current;
    const inputRect = input.getBoundingClientRect();
    const isInputObscured = inputRect.bottom > window.innerHeight - keyboardHeight;

    if (isInputObscured) {
      const scrollNeeded = inputRect.bottom - (window.innerHeight - keyboardHeight) + 16;
      window.scrollTo({
        top: window.scrollY + scrollNeeded,
        behavior: 'smooth'
      });
    }
  }, [isKeyboardVisible, keyboardHeight, inputRef]);

  // Handle form submission on mobile keyboard "done" or "go"
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (onSubmit) {
        e.preventDefault();
        onSubmit();
      }
    }
  }, [onSubmit]);

  // Handle input resizing on mobile
  useEffect(() => {
    const handleResize = () => {
      if (!inputRef?.current) return;
      
      const input = inputRef.current;
      const currentHeight = input.offsetHeight;
      
      if (currentHeight !== lastInputHeight.current) {
        lastInputHeight.current = currentHeight;
        input.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [inputRef]);

  return {
    handleKeyDown,
    isKeyboardVisible,
    keyboardHeight
  };
};