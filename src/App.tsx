import { useEffect, useState, useRef } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import { useAuthStore } from '@/store/authStore';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ToastProvider } from '@/components/ui/toast';
import { OfflineIndicator } from '@/components/shared/OfflineIndicator';
import { PinLockScreen } from '@/components/auth/PinLockScreen';
import { Loader2 } from 'lucide-react';

const LOCK_TIMEOUT = 60 * 1000;
const PIN_LOCK_KEY = 'tillsave-pin-locked';

function App() {
  const { initializeAuth, isLoading, user, isAuthenticated } = useAuthStore();
  const [isLocked, setIsLocked] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const backgroundTimeRef = useRef<number | null>(null);

  // 1. Init Auth on mount (runs once)
  useEffect(() => {
    const init = async () => {
      await initializeAuth();
      setInitialized(true);
    };
    init();
  }, []);

  // 2. Check PIN lock status after auth initialization
  useEffect(() => {
    if (!initialized || isLoading) return;

    // Only check PIN lock once after auth is loaded
    if (isAuthenticated && user?.pin_hash) {
      const wasLocked = sessionStorage.getItem(PIN_LOCK_KEY) === 'true';
      if (wasLocked) {
        setIsLocked(true);
        sessionStorage.removeItem(PIN_LOCK_KEY);
      }
    }
  }, [initialized, isLoading]);

  // 3. Handle Visibility Change (Background/Foreground)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App went to background
        backgroundTimeRef.current = Date.now();
        if (isAuthenticated && user?.pin_hash) {
          sessionStorage.setItem(PIN_LOCK_KEY, 'true');
        }
      } else {
        // App came to foreground
        if (backgroundTimeRef.current && isAuthenticated && user?.pin_hash) {
          const timeGone = Date.now() - backgroundTimeRef.current;
          if (timeGone > LOCK_TIMEOUT) {
            setIsLocked(true);
          }
        }
        backgroundTimeRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-primary">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="tillsave-theme">
      <ToastProvider>
        <OfflineIndicator />
        {isLocked && isAuthenticated ? (
          <PinLockScreen onUnlock={() => {
            setIsLocked(false);
            sessionStorage.removeItem(PIN_LOCK_KEY);
          }} />
        ) : (
          <RouterProvider router={router} />
        )}
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;