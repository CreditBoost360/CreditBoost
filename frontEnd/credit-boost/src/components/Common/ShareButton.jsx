import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useShare } from '@/hooks/useShare';

export function ShareButton({ title, text, url, className }) {
  const { isShareSupported, share } = useShare();
  const [isSharing, setIsSharing] = useState(false);

  const handleNativeShare = async () => {
    if (!isShareSupported) return;
    
    setIsSharing(true);
    try {
      await share({ title, text, url });
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  // If native sharing is supported, render a simple button
  if (isShareSupported) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNativeShare}
        disabled={isSharing}
        className={className}
      >
        <Icon 
          icon={isSharing ? "mdi:loading" : "mdi:share"} 
          className={`w-5 h-5 ${isSharing ? 'animate-spin' : ''}`}
        />
      </Button>
    );
  }

  // Fallback for browsers without native sharing
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className}
        >
          <Icon icon="mdi:share" className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`)}>
          <Icon icon="mdi:twitter" className="w-4 h-4 mr-2" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)}>
          <Icon icon="mdi:facebook" className="w-4 h-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`)}>
          <Icon icon="mdi:linkedin" className="w-4 h-4 mr-2" />
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          navigator.clipboard.writeText(url);
          // You might want to show a toast here
        }}>
          <Icon icon="mdi:content-copy" className="w-4 h-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}