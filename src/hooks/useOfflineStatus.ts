import { useEffect, useState } from 'react';

export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    // Set up online/offline listeners
    const handleOnline = () => {
      console.log('🌐 Internet connection restored');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('📴 Internet connection lost - app is now offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
