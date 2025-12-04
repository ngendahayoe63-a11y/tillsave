import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useGroupsStore } from '@/store/groupsStore';
import { groupsService } from '@/services/groupsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';

export const CreateGroupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addGroup } = useGroupsStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cycleDays: 30
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      const newGroup = await groupsService.createGroup(
        user.id,
        formData.name,
        formData.cycleDays
      );
      
      addGroup(newGroup);
      navigate('/organizer');
    } catch (error: any) {
      alert(error.message);
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