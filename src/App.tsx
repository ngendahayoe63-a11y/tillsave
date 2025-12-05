import { useEffect, useState, useRef } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import { useAuthStore } from '@/store/authStore';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ToastProvider } from '@/components/ui/toast';
import { PinLockScreen } from '@/components/auth/PinLockScreen'; // New Import
import { Loader2 } from 'lucide-react';

// Time in milliseconds before locking (e.g., 60000 = 1 minute)
const LOCK_TIMEOUT = 60 * 1000; 

function App() {
  const { initializeAuth, isLoading, user, isAuthenticated } = useAuthStore();
  const [isLocked, setIsLocked] = useState(false);
  const backgroundTimeRef = useRef<number | null>(null);

  // 1. Init Auth
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // 2. Handle Visibility Change (Background/Foreground)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App went to background, save time
        backgroundTimeRef.current = Date.now();
      } else {
        // App came to foreground
        if (backgroundTimeRef.current && isAuthenticated && user?.pin_hash) {
          const timeGone = Date.now() - backgroundTimeRef.current;
          
          // If gone longer than timeout, LOCK IT
          if (timeGone > LOCK_TIMEOUT) {
            setIsLocked(true);
          }
        }
        backgroundTimeRef.current = null;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
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
        {isLocked && isAuthenticated ? (
          <PinLockScreen onUnlock={() => setIsLocked(false)} />
        ) : (
          <RouterProvider router={router} />
        )}
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;