import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useToast } from '@/components/ui/toast';
import { profileService } from '@/services/profileService';
import { authService } from '@/services/authService'; // Import Auth Service
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Settings, Shield, Moon, Sun, Monitor, LogOut, Loader2, Lock, Check } from 'lucide-react';

export const ProfilePage = () => {
  const { user, setUser, logout } = useAuthStore();
  const { setTheme, theme } = useTheme();
  const { addToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPinLoading, setIsPinLoading] = useState(false);

  // Edit Profile State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  });

  // Change PIN State
  const [pinData, setPinData] = useState({ pin: '', confirm: '' });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      await profileService.updateProfile(user.id, {
        name: formData.name,
        bio: formData.bio,
        phone: formData.phone
      });
      setUser({ ...user, ...formData });
      addToast({
        type: 'success',
        title: 'Profile updated',
        description: 'Your profile has been saved successfully',
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Update failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (pinData.pin.length !== 4) {
      addToast({
        type: 'warning',
        title: 'Invalid PIN',
        description: 'PIN must be exactly 4 digits',
      });
      return;
    }
    if (pinData.pin !== pinData.confirm) {
      addToast({
        type: 'error',
        title: 'PINs do not match',
        description: 'Please enter the same PIN in both fields',
      });
      return;
    }

    setIsPinLoading(true);
    try {
      await authService.updatePin(user.id, pinData.pin);
      addToast({
        type: 'success',
        title: 'PIN updated',
        description: 'Your security PIN has been changed successfully',
      });
      setPinData({ pin: '', confirm: '' }); // Reset form
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to update PIN',
        description: error.message,
      });
    } finally {
      setIsPinLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      {/* 1. Header & Identity Section */}
      <div className="relative mb-8 pt-8 px-4 text-center">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-b-3xl opacity-10 -z-10" />
        
        <div className="flex justify-center mb-4">
          <AvatarUpload 
            url={user?.avatar_url} 
            name={user?.name || 'User'} 
            size="xl" 
          />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user?.name}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">@{user?.email?.split('@')[0] || 'username'}</p>
        
        <div className="flex justify-center gap-2">
          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-3 py-1 rounded-full font-semibold uppercase">
            {user?.role}
          </span>
        </div>
      </div>

      {/* 2. Tabbed Settings Interface */}
      <Tabs defaultValue="general" className="w-full">
        <div className="px-4 mb-4 overflow-x-auto">
          <TabsList className="w-full justify-start sm:justify-center">
            <TabsTrigger value="general" className="flex gap-2"><User className="w-4 h-4" /> General</TabsTrigger>
            <TabsTrigger value="preferences" className="flex gap-2"><Settings className="w-4 h-4" /> Preferences</TabsTrigger>
            <TabsTrigger value="security" className="flex gap-2"><Shield className="w-4 h-4" /> Security</TabsTrigger>
          </TabsList>
        </div>

        {/* --- GENERAL TAB --- */}
        <TabsContent value="general" className="px-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your public display information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input 
                    id="bio" 
                    placeholder="Short description about yourself"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={formData.email} disabled className="bg-gray-50" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- PREFERENCES TAB --- */}
        <TabsContent value="preferences" className="px-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance & Language</CardTitle>
              <CardDescription>Customize how TillSave looks and speaks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Language</Label>
                  <p className="text-sm text-gray-500">Select your preferred language</p>
                </div>
                <LanguageSwitcher />
              </div>

              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-transparent bg-gray-100 dark:bg-slate-800'}`}
                  >
                    <Sun className="h-6 w-6 mb-2" />
                    <span className="text-xs font-medium">Light</span>
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-transparent bg-gray-100 dark:bg-slate-800'}`}
                  >
                    <Moon className="h-6 w-6 mb-2" />
                    <span className="text-xs font-medium">Dark</span>
                  </button>
                  <button 
                    onClick={() => setTheme('system')}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-transparent bg-gray-100 dark:bg-slate-800'}`}
                  >
                    <Monitor className="h-6 w-6 mb-2" />
                    <span className="text-xs font-medium">System</span>
                  </button>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* --- SECURITY TAB (UPDATED) --- */}
        <TabsContent value="security" className="px-4 space-y-4">
          
          {/* Change PIN Section */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Access PIN</CardTitle>
              <CardDescription>Update the 4-digit code used to unlock the app.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePin} className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="grid gap-2 flex-1 w-full">
                  <Label htmlFor="new-pin">New PIN</Label>
                  <Input 
                    id="new-pin" 
                    type="password" 
                    maxLength={4} 
                    placeholder="****"
                    className="tracking-widest text-center"
                    value={pinData.pin}
                    onChange={(e) => setPinData({ ...pinData, pin: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
                <div className="grid gap-2 flex-1 w-full">
                  <Label htmlFor="confirm-pin">Confirm PIN</Label>
                  <Input 
                    id="confirm-pin" 
                    type="password" 
                    maxLength={4} 
                    placeholder="****"
                    className="tracking-widest text-center"
                    value={pinData.confirm}
                    onChange={(e) => setPinData({ ...pinData, confirm: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
                <Button type="submit" disabled={isPinLoading} className="w-full sm:w-auto">
                  {isPinLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                  Update PIN
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start" onClick={() => addToast({
                type: 'info',
                title: 'Password reset',
                description: 'A password reset link will be sent to your email address',
              })}>
                <Lock className="mr-2 h-4 w-4" /> Change Password
              </Button>
              
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" /> Log Out All Devices
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};