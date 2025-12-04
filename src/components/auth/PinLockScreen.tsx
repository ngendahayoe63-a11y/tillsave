import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { verifyPin } from '@/lib/crypto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, LogOut } from 'lucide-react';

export const PinLockScreen = ({ onUnlock }: { onUnlock: () => void }) => {
  const { user, logout } = useAuthStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.pin_hash) return; // Should not happen if locked

    setIsLoading(true);
    try {
      const isValid = await verifyPin(pin, user.pin_hash);
      if (isValid) {
        onUnlock();
      } else {
        setError('Incorrect PIN');
        setPin('');
      }
    } catch (err) {
      setError('Error verifying PIN');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
          <p className="text-muted-foreground mt-2">Enter your PIN to unlock TillSave</p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-6">
          <div className="space-y-2">
            <Input 
              type="password" 
              placeholder="Enter 4-digit PIN" 
              className="text-center text-2xl tracking-[1em] h-14" 
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading || pin.length < 4}>
            Unlock
          </Button>
        </form>

        <Button variant="link" className="text-muted-foreground" onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" /> Log out and switch account
        </Button>
      </div>
    </div>
  );
};