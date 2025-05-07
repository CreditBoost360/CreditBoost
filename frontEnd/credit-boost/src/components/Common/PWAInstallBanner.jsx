import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';

export function PWAInstallBanner() {
  const { isInstallable, promptToInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isDismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg safe-area-bottom">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center space-x-4">
          <Icon icon="mdi:cellphone-link" className="w-8 h-8 text-primary" />
          <div className="space-y-1">
            <h3 className="font-medium">Install CreditBoost</h3>
            <p className="text-sm text-muted-foreground">
              Add to your home screen for quick access
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="touch-feedback"
          >
            Not now
          </Button>
          <Button
            size="sm"
            onClick={promptToInstall}
            className="touch-feedback"
          >
            Install
          </Button>
        </div>
      </div>
    </div>
  );
}