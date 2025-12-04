import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/api/supabase';
import { hashPin } from '@/lib/crypto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export const SetupPINPage = () => {
  const navigate = useNavigate();
  const { user, setUser, setLoading, isLoading, setError, error } = useAuthStore();
  
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Protect this route: User must be authenticated to set a PIN
  React.useEffect(() => {
    if (!user) navigate('/auth/login');
  }, [user, navigate]);

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    setLoading(true);

    try {
      if (!user?.id) throw new Error("User session invalid");

      // 1. Hash the PIN
      const hashedPin = await hashPin(pin);

      // 2. Update user profile in Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          pin_hash: hashedPin,
          status: 'ACTIVE' // Activate account fully
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 3. Update local state
      const updatedUser = { ...user, pin_hash: hashedPin, status: 'ACTIVE' as const };
      setUser(updatedUser);

      // 4. Redirect to appropriate dashboard
      navigate(user.role === 'ORGANIZER' ? '/organizer' : '/member');
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Secure Your Account</CardTitle>
          <CardDescription className="text-center">
            Create a 4-digit PIN for quick access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSavePin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">Create PIN</Label>
              <Input 
                id="pin" 
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="****"
                className="text-center text-xl tracking-widest"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPin">Confirm PIN</Label>
              <Input 
                id="confirmPin" 
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="****"
                className="text-center text-xl tracking-widest"
              />
            </div>
            
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading || pin.length !== 4}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save PIN & Start
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};