import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function InstallPrompt() {
  const { 
    isInstallable,
    isInstalled,
    promptInstall,
    getInstallInstructions
  } = usePWAInstall();
  const [showInstructions, setShowInstructions] = useState(false);

  if (!isInstallable || isInstalled) return null;

  const instructions = getInstallInstructions();

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 p-4",
      "bg-background/95 backdrop-blur-sm border-t",
      "animate-in slide-in-from-bottom duration-300"
    )}>
      <div className="container mx-auto max-w-2xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                Install CreditBoost App
              </h3>
              <p className="text-sm text-muted-foreground">
                Get the best experience by installing our app on your device
              </p>
            </div>
            <button
              onClick={() => setShowInstructions(prev => !prev)}
              className="text-sm text-primary hover:underline"
            >
              {showInstructions ? 'Hide' : 'Show'} instructions
            </button>
          </div>

          {showInstructions && (
            <div className="rounded-lg bg-muted p-4">
              <p className="mb-2 font-medium">
                Installation steps for {instructions.platform}:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                {instructions.steps.map((step, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => promptInstall()}
              className={cn(
                "px-4 py-2 rounded-md",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            >
              Install Now
            </button>
            <button
              onClick={() => setShowInstructions(false)}
              className={cn(
                "px-4 py-2 rounded-md",
                "bg-secondary text-secondary-foreground",
                "hover:bg-secondary/90",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}