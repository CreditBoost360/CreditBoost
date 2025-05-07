import { useCallback, useState } from 'react';
import html2canvas from 'html2canvas';

export const useScreenCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureElement = useCallback(async (element, options = {}) => {
    if (!element || isCapturing) return null;
    
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY,
        ...options
      });

      return {
        canvas,
        dataUrl: canvas.toDataURL('image/png'),
        blob: await new Promise(resolve => {
          canvas.toBlob(resolve, 'image/png');
        })
      };
    } catch (error) {
      console.error('Screen capture failed:', error);
      throw error;
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing]);

  const captureScreen = useCallback(async () => {
    if (isCapturing) return null;
    
    try {
      // Try native screenshot API first
      if ('mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          preferCurrentTab: true,
          video: { mediaSource: 'screen' }
        });
        
        const track = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(track);
        const bitmap = await imageCapture.grabFrame();
        
        // Convert to canvas
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);
        
        // Cleanup
        track.stop();
        
        return {
          canvas,
          dataUrl: canvas.toDataURL('image/png'),
          blob: await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/png');
          })
        };
      }
      
      // Fallback to capturing viewport
      return captureElement(document.documentElement);
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        // User denied permission
        return null;
      }
      throw error;
    }
  }, [captureElement, isCapturing]);

  return {
    isCapturing,
    captureElement,
    captureScreen
  };
};