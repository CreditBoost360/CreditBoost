import { useState, useEffect, useCallback, useRef } from 'react';
import { useMediaFeatures } from './useMediaFeatures';
import { useNetworkStatus } from './useNetworkStatus';

export const useMediaPlayback = ({
  src,
  type = 'video',
  preload = 'metadata',
  quality = 'auto'
} = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState([]);
  const mediaRef = useRef(null);
  
  const { shouldUseLowData } = useMediaFeatures();
  const { online, effectiveType, downlink } = useNetworkStatus();

  // Determine optimal quality based on network conditions
  const getOptimalQuality = useCallback(() => {
    if (quality !== 'auto') return quality;
    if (shouldUseLowData) return 'low';
    
    if (effectiveType === '4g' && downlink > 5) return 'high';
    if (effectiveType === '4g') return 'medium';
    if (effectiveType === '3g') return 'low';
    return 'lowest';
  }, [quality, shouldUseLowData, effectiveType, downlink]);

  // Initialize media element
  const initMedia = useCallback(() => {
    if (!mediaRef.current) {
      mediaRef.current = document.createElement(type);
      mediaRef.current.preload = preload;
      
      // Set playback quality if supported
      if (type === 'video' && mediaRef.current.getVideoPlaybackQuality) {
        const quality = getOptimalQuality();
        mediaRef.current.quality = quality;
      }
    }
    return mediaRef.current;
  }, [type, preload, getOptimalQuality]);

  // Load media source
  const loadMedia = useCallback(async () => {
    if (!src || !online) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const media = initMedia();
      media.src = src;
      
      await media.load();
      
      setDuration(media.duration);
      updateBuffered();
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [src, online, initMedia]);

  // Update buffered ranges
  const updateBuffered = useCallback(() => {
    if (!mediaRef.current) return;
    
    const timeRanges = [];
    for (let i = 0; i < mediaRef.current.buffered.length; i++) {
      timeRanges.push({
        start: mediaRef.current.buffered.start(i),
        end: mediaRef.current.buffered.end(i)
      });
    }
    setBuffered(timeRanges);
  }, []);

  // Play/Pause controls
  const play = useCallback(async () => {
    try {
      if (!mediaRef.current) await loadMedia();
      await mediaRef.current?.play();
      setIsPlaying(true);
    } catch (err) {
      setError(err);
    }
  }, [loadMedia]);

  const pause = useCallback(() => {
    mediaRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const seek = useCallback((time) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Handle time updates
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleTimeUpdate = () => setCurrentTime(media.currentTime);
    const handleProgress = updateBuffered;
    const handleError = (e) => setError(e.error);
    
    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('progress', handleProgress);
    media.addEventListener('error', handleError);
    
    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('progress', handleProgress);
      media.removeEventListener('error', handleError);
    };
  }, [updateBuffered]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaRef.current) {
        mediaRef.current.pause();
        mediaRef.current.src = '';
        mediaRef.current = null;
      }
    };
  }, []);

  return {
    isPlaying,
    isLoading,
    error,
    currentTime,
    duration,
    buffered,
    play,
    pause,
    seek,
    mediaRef
  };
};