import React from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function SyncStatus({ 
  isSyncing, 
  hasPendingChanges, 
  pendingChangesCount,
  onForceSyncClick,
  className 
}) {
  const { online, effectiveType } = useNetworkStatus();

  return (
    <div className={cn(
      "flex items-center gap-2 text-sm",
      className
    )}>
      <div className="flex items-center gap-1.5">
        <div className={cn(
          "w-2 h-2 rounded-full",
          online ? "bg-green-500" : "bg-red-500",
          "animate-pulse"
        )} />
        <span className="text-muted-foreground">
          {online ? (
            effectiveType !== 'unknown' ? 
              `Online (${effectiveType})` : 
              'Online'
          ) : 'Offline'}
        </span>
      </div>

      {(isSyncing || hasPendingChanges) && (
        <>
          <span className="text-muted-foreground">•</span>
          <div className="flex items-center gap-1.5">
            {isSyncing ? (
              <>
                <Icon 
                  icon="mdi:sync" 
                  className="w-4 h-4 animate-spin text-primary"
                />
                <span className="text-muted-foreground">
                  Syncing...
                </span>
              </>
            ) : hasPendingChanges ? (
              <>
                <Icon 
                  icon="mdi:clock-outline" 
                  className="w-4 h-4 text-yellow-500"
                />
                <span className="text-muted-foreground">
                  {pendingChangesCount} pending {pendingChangesCount === 1 ? 'change' : 'changes'}
                </span>
                {online && (
                  <button
                    onClick={onForceSyncClick}
                    className={cn(
                      "inline-flex items-center gap-1",
                      "px-2 py-0.5 rounded-md text-xs",
                      "bg-primary/10 text-primary",
                      "hover:bg-primary/20",
                      "focus-visible:outline-none focus-visible:ring-2",
                      "focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                  >
                    <Icon icon="mdi:sync" className="w-3 h-3" />
                    Sync now
                  </button>
                )}
              </>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}