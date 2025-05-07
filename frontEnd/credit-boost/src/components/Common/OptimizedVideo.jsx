import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useMediaPlayback } from '@/hooks/useMediaPlayback';
import { Icon } from '@iconify/react';

export function OptimizedVideo({
  src,
  poster,
  className,
  aspectRatio = '16/9',
  preload = 'metadata',
  controls = true,
  autoPlay = false,
  quality = 'auto'
}) {
  const containerRef = useRef(null);
  const {
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
  } = useMediaPlayback({
    src,
    type: 'video',
    preload,
    quality
  });

  // Format time in MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate buffered progress
  const getBufferedProgress = () => {
    if (buffered.length === 0) return 0;
    const currentBuffer = buffered.find(
      range => range.start <= currentTime && range.end >= currentTime
    );
    return currentBuffer ? (currentBuffer.end / duration) * 100 : 0;
  };

  // Handle video element mounting
  useEffect(() => {
    if (mediaRef.current && containerRef.current) {
      containerRef.current.appendChild(mediaRef.current);
    }
    
    return () => {
      if (mediaRef.current && mediaRef.current.parentNode) {
        mediaRef.current.parentNode.removeChild(mediaRef.current);
      }
    };
  }, [mediaRef]);

  // Auto play handling
  useEffect(() => {
    if (autoPlay) {
      play();
    }
  }, [autoPlay, play]);

  return (
    <div className={cn("relative group", className)}>
      {/* Video Container */}
      <div
        ref={containerRef}
        className={cn(
          "relative w-full bg-black",
          "rounded-lg overflow-hidden"
        )}
        style={{ aspectRatio }}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-white" />
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white p-4">
          <Icon icon="mdi:alert-circle" className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-sm text-center">
            {error.message || 'Failed to load video'}
          </p>
        </div>
      )}

      {/* Controls */}
      {controls && !error && (
        <div className={cn(
          "absolute bottom-0 left-0 right-0",
          "bg-gradient-to-t from-black/80 to-transparent",
          "p-4 opacity-0 group-hover:opacity-100 transition-opacity"
        )}>
          {/* Progress Bar */}
          <div className="relative h-1 mb-4 bg-white/20 rounded-full">
            {/* Buffered Progress */}
            <div
              className="absolute h-full bg-white/40 rounded-full"
              style={{ width: `${getBufferedProgress()}%` }}
            />
            {/* Playback Progress */}
            <div
              className="absolute h-full bg-primary rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            {/* Seek Handle */}
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className={cn(
                "absolute w-full h-full opacity-0 cursor-pointer",
                "-top-2 -bottom-2" // Larger hit area
              )}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={isPlaying ? pause : play}
              className={cn(
                "p-1.5 rounded-full",
                "bg-white/10 hover:bg-white/20",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-white/50"
              )}
            >
              <Icon
                icon={isPlaying ? "mdi:pause" : "mdi:play"}
                className="w-5 h-5 text-white"
              />
            </button>

            {/* Time Display */}
            <div className="text-sm text-white/90">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}