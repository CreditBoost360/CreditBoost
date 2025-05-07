import { useCallback } from 'react';

export const useShare = () => {
  const isShareSupported = typeof navigator !== 'undefined' && !!navigator.share;

  const share = useCallback(async ({ title, text, url, files }) => {
    if (!isShareSupported) {
      throw new Error('Share API not supported');
    }

    try {
      // Construct share data based on available properties
      const shareData = {
        ...(title && { title }),
        ...(text && { text }),
        ...(url && { url }),
        ...(files && { files })
      };

      await navigator.share(shareData);
      return true;
    } catch (error) {
      if (error.name === 'AbortError') {
        // User cancelled the share
        return false;
      }
      throw error;
    }
  }, [isShareSupported]);

  const canShareFiles = useCallback(() => {
    return typeof navigator !== 'undefined' && 
           !!navigator.canShare && 
           !!navigator.share;
  }, []);

  return {
    isShareSupported,
    share,
    canShareFiles
  };
};