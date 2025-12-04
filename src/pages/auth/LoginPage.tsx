import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input'; // Import new component
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setLoading, isLoading, setError, error, setSession, setUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const authResponse = await authService.signInWithEmail(formData.email, formData.password);

      if (!authResponse || !authResponse.user) throw new Error("Login failed");
      
      setSession(authResponse.session);

      const userProfile = await authService.getUserProfile(authResponse.user.id);
      
      if (!userProfile) {
         throw new Error("Profile not found in database.");
      }

      setUser(userProfile);
      
      if (userProfile.pin_hash === 'PENDING') {
        navigate('/auth/setup-pin');
      } else {
        navigate(userProfile.role === 'ORGANIZER' ? '/organizer' : '/member');
      }
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIX: Added bg-background (adapts to dark mode) and min-h-screen
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-md border-border bg-card text-card-foreground shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary">TillSave</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {t('auth.manage_groups')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Link 
                  to="/auth/forgot-password" 
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              {/* FIX: Use PasswordInput */}
              <PasswordInput 
                id="password" 
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                className="bg-background"
              />
            </div>
            
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('auth.login')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {t('auth.no_account')}{' '}
            <Link to="/auth/register" className="text-primary hover:underline font-semibold">
              {t('auth.register_here')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};