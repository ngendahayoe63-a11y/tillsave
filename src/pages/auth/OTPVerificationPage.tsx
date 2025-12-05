import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { phone, mode, tempProfile } = location.state || {};
  
  const { setLoading, isLoading, setError, error, setUser, setSession } = useAuthStore();
  const [otp, setOtp] = useState('');

  // Redirect if state is missing
  useEffect(() => {
    if (!phone) navigate('/auth/login');
  }, [phone, navigate]);

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Verify OTP with Supabase (for MVP, use signInWithEmail as placeholder)
      const { session, user: authUser } = await authService.signInWithEmail(phone, otp);
      
      if (!session || !authUser) throw new Error("Verification failed");

      setSession(session);

      // 2. Handle Registration vs Login Logic
      if (mode === 'REGISTER') {
        // Create the user profile in our DB
        // NOTE: We set a default PIN hash here for now, user will set real PIN in next screen
        const newUser = await authService.createUserProfile({
          id: authUser.id,
          phone: phone,
          name: tempProfile.name,
          role: tempProfile.role,
          pin_hash: 'PENDING', // Flag to force PIN setup
          status: 'ACTIVE',
          preferred_currency: 'RWF',
          preferred_language: 'en'
        });
        
        setUser(newUser);
        navigate('/auth/setup-pin'); // Go to PIN setup
        
      } else {
        // Login: Fetch existing profile
        const userProfile = await authService.getUserProfile(authUser.id);
        
        if (!userProfile) {
           throw new Error("Profile not found. Please contact support.");
        }

        setUser(userProfile);
        
        // Check if PIN is pending setup (edge case)
        if (userProfile.pin_hash === 'PENDING') {
          navigate('/auth/setup-pin');
        } else {
          // Success! Go to dashboard
          navigate(userProfile.role === 'ORGANIZER' ? '/organizer' : '/member');
        }
      }
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Verify Phone</CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit code sent to {phone}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">One-Time Password (OTP)</Label>
              <Input 
                id="otp" 
                className="text-center text-2xl tracking-widest"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
              />
            </div>
            
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading || otp.length < 6}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Verify & Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};