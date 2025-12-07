import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useGroupsStore } from '@/store/groupsStore';
import { useToast } from '@/components/ui/toast';
import { groupsService } from '@/services/groupsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Users, Smartphone } from 'lucide-react';
import { GroupType } from '@/types';

export const CreateGroupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addGroup } = useGroupsStore();
  const { addToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cycleDays: 30,
    groupType: 'FULL_PLATFORM' as GroupType
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      const newGroup = await groupsService.createGroup(
        user.id,
        formData.name,
        formData.cycleDays,
        formData.groupType
      );
      
      addGroup(newGroup);
      addToast({
        type: 'success',
        title: 'Group created',
        description: `${formData.name} has been created successfully`,
      });
      navigate('/organizer');
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to create group',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <Button variant="ghost" className="mb-4 pl-0" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Savings Group</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Family Savings 2024"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="days">Cycle Length (Days)</Label>
              <Input 
                id="days" 
                type="number"
                value={formData.cycleDays}
                onChange={(e) => setFormData({...formData, cycleDays: parseInt(e.target.value)})}
                required
                min={1}
              />
              <p className="text-xs text-muted-foreground">Usually 30 days (1 month)</p>
            </div>

            <div className="space-y-3 border-t pt-4">
              <Label>Group Type</Label>
              <p className="text-xs text-muted-foreground">Choose how you want to manage your group</p>
              
              <div className="space-y-2">
                {/* Full Platform Option */}
                <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition"
                  style={{ borderColor: formData.groupType === 'FULL_PLATFORM' ? 'rgb(59, 130, 246)' : 'currentColor' }}>
                  <input
                    type="radio"
                    name="groupType"
                    value="FULL_PLATFORM"
                    checked={formData.groupType === 'FULL_PLATFORM'}
                    onChange={(e) => setFormData({...formData, groupType: e.target.value as GroupType})}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="font-medium">Full Platform</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Members download the app, create accounts, and track their savings themselves. Best for digital-first groups.
                    </p>
                  </div>
                </label>

                {/* Organizer-Only Option */}
                <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition"
                  style={{ borderColor: formData.groupType === 'ORGANIZER_ONLY' ? 'rgb(59, 130, 246)' : 'currentColor' }}>
                  <input
                    type="radio"
                    name="groupType"
                    value="ORGANIZER_ONLY"
                    checked={formData.groupType === 'ORGANIZER_ONLY'}
                    onChange={(e) => setFormData({...formData, groupType: e.target.value as GroupType})}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Organizer-Only (Cash-Based)</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      You record all payments manually. Members just bring cash. You send them SMS updates. Perfect for groups without smartphones.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Group
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};