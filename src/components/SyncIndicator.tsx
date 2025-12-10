import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface SyncIndicatorProps {
  status: 'connected' | 'syncing' | 'disconnected';
}

export const SyncIndicator: React.FC<SyncIndicatorProps> = ({ status }) => {
  const statusConfig = {
    connected: {
      icon: Wifi,
      label: 'Connected',
      className: 'text-success',
    },
    syncing: {
      icon: RefreshCw,
      label: 'Syncing...',
      className: 'text-warning animate-spin',
    },
    disconnected: {
      icon: WifiOff,
      label: 'Disconnected',
      className: 'text-destructive',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
      <Icon className={`h-4 w-4 ${config.className}`} />
      <span className="text-xs font-medium text-muted-foreground">
        {config.label}
      </span>
    </div>
  );
};
