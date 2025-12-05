import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupsService } from '@/services/groupsService';
import { useGroupsStore } from '@/store/groupsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, Save, Trash2, AlertTriangle } from 'lucide-react';

export const GroupSettingsPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  useGroupsStore(); // Access store for context
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalGroup, setOriginalGroup] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    cycleDays: ''
  });

  useEffect(() => {
    const loadData = async () => {
      if (!groupId) return;
      try {
        const data = await groupsService.getGroupDetails(groupId);
        setOriginalGroup(data);
        setFormData({
          name: data.name,
          cycleDays: data.cycle_days.toString()
        });
      } catch (error) {
        console.error(error);
        alert("Group not found");
        navigate('/organizer');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [groupId, navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) return;

    setIsSubmitting(true);
    try {
      await groupsService.updateGroup(
        groupId,
        formData.name,
        parseInt(formData.cycleDays)
      );
      
      alert("Group Updated Successfully!");
      navigate(`/organizer/group/${groupId}`); // Go back to details
      
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!groupId) return;
    const confirmText = prompt(`To confirm deletion, type "${originalGroup.name}" below:\n\nWARNING: This will delete ALL payments and member records for this group forever.`);
    
    if (confirmText === originalGroup.name) {
      setIsSubmitting(true);
      try {
        await groupsService.deleteGroup(groupId);
        // Clean up and go home
        navigate('/organizer');
      } catch (error: any) {
        alert("Failed to delete: " + error.message);
        setIsSubmitting(false);
      }
    } else {
        if(confirmText !== null) alert("Group name did not match. Deletion cancelled.");
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <Button variant="ghost" className="mb-4 pl-0" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Edit Group Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input 
                id="name" 
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
                onChange={(e) => setFormData({...formData, cycleDays: e.target.value})}
                required
                min={1}
              />
            </div>

            <div className="p-3 bg-gray-100 rounded text-center">
                <span className="text-gray-500 text-xs uppercase block">Join Code (Cannot Change)</span>
                <span className="font-bold text-xl tracking-widest">{originalGroup.join_code}</span>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-red-700 mb-4">
            Deleting this group will remove all data permanently. This action cannot be undone.
          </CardDescription>
          <Button 
            variant="destructive" 
            className="w-full bg-red-600 hover:bg-red-700" 
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete Group
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};