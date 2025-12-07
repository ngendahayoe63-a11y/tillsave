import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { Wifi, WifiOff } from 'lucide-react';

export const OfflineIndicator = () => {
  const isOnline = useOfflineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
      <WifiOff className="h-4 w-4 flex-shrink-0" />
      <span className="text-sm font-medium">Offline - Data will sync when online</span>
    </div>
  );
};

export const OnlineIndicator = () => {
  const isOnline = useOfflineStatus();

  if (!isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
      <Wifi className="h-4 w-4 flex-shrink-0" />
      <span className="text-sm font-medium">Online - Syncing data...</span>
    </div>
  );
};
