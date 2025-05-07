import { useState, useEffect } from 'react';

export const useProgressiveImg = (lowQualitySrc, highQualitySrc) => {
  const [src, setSrc] = useState(lowQualitySrc);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset states when sources change
    setSrc(lowQualitySrc);
    setIsLoading(true);
    setError(null);

    const img = new Image();
    img.src = highQualitySrc;

    img.onload = () => {
      setSrc(highQualitySrc);
      setIsLoading(false);
    };

    img.onerror = (err) => {
      setError(err);
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [lowQualitySrc, highQualitySrc]);

  return { src, isLoading, error };
};