import { useCallback, useRef, useEffect } from 'react';
import { useMediaFeatures } from './useMediaFeatures';

export const useSoundFeedback = () => {
  const audioContext = useRef(null);
  const { prefersReducedData } = useMediaFeatures();

  // Initialize audio context lazily
  const getAudioContext = useCallback(() => {
    if (!audioContext.current && 'AudioContext' in window) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext.current;
  }, []);

  // Clean up audio context
  useEffect(() => {
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
        audioContext.current = null;
      }
    };
  }, []);

  const playTone = useCallback(async (type = 'success') => {
    // Skip sound if user prefers reduced data
    if (prefersReducedData) return;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      // Configure oscillator based on feedback type
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      switch (type) {
        case 'success':
          oscillator.frequency.setValueAtTime(1760, ctx.currentTime); // A6
          oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
          gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          break;
        case 'error':
          oscillator.frequency.setValueAtTime(440, ctx.currentTime); // A4
          oscillator.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15); // A3
          gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          break;
        case 'click':
          oscillator.frequency.setValueAtTime(1980, ctx.currentTime);
          gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
          break;
        default:
          return;
      }

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (error) {
      console.error('Audio feedback failed:', error);
    }
  }, [getAudioContext, prefersReducedData]);

  const vibrate = useCallback((pattern) => {
    if (!('vibrate' in navigator)) return;

    try {
      switch (pattern) {
        case 'success':
          navigator.vibrate([50]);
          break;
        case 'error':
          navigator.vibrate([100, 50, 100]);
          break;
        case 'click':
          navigator.vibrate(10);
          break;
        default:
          if (Array.isArray(pattern)) {
            navigator.vibrate(pattern);
          } else if (typeof pattern === 'number') {
            navigator.vibrate(pattern);
          }
      }
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }, []);

  const feedback = useCallback((type = 'success') => {
    playTone(type);
    vibrate(type);
  }, [playTone, vibrate]);

  return {
    playTone,
    vibrate,
    feedback
  };
};