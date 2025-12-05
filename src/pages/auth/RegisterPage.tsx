import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import translation hook
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'; // Import switcher

export const RegisterPage = () => {
  const { t } = useTranslation(); // Initialize translation
  const navigate = useNavigate();
  const { setLoading, isLoading, setError, error, setSession, setUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MEMBER'
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Sign Up with Supabase
      const authResponse = await authService.signUpWithEmail(formData.email, formData.password);
      
      if (!authResponse || !authResponse.user) {
        throw new Error("Registration failed: No user returned");
      }

      setSession(authResponse.session);

      // 2. Create Profile in DB
      const newUser = await authService.createUserProfile({
        id: authResponse.user.id,
        email: formData.email,
        phone: undefined, 
        name: formData.name,
        role: formData.role as any,
        pin_hash: 'PENDING',
        status: 'ACTIVE',
        preferred_currency: 'RWF',
        preferred_language: 'en'
      });
      
      setUser(newUser);
      
      // 3. Navigate to PIN Setup
      navigate('/auth/setup-pin');
      
    } catch (err: any) {
      console.error("Registration Error:", err);
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative">
      {/* Language Switcher Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary">{t('auth.create_account')}</CardTitle>
          <CardDescription className="text-center">
            {t('auth.manage_groups')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('auth.name')}</Label>
              <Input 
                id="name" 
                placeholder="e.g. Jean Pierre"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">{t('auth.role_label')}</Label>
              <Select 
                value={formData.role} 
                onValueChange={(val) => setFormData({...formData, role: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">{t('auth.role_member')}</SelectItem>
                  <SelectItem value="ORGANIZER">{t('auth.role_organizer')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('auth.create_account')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            {t('auth.already_have_account')}{' '}
            <Link to="/auth/login" className="text-primary hover:underline font-semibold">
              {t('auth.login')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};