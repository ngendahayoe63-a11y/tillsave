import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/toast';
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
  const { addToast } = useToast();
  useGroupsStore(); // Access store for context
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
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
        addToast({
          type: 'error',
          title: 'Group not found',
          description: 'The group you are trying to edit does not exist',
        });
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
      
      addToast({
        type: 'success',
        title: 'Group updated',
        description: 'Group settings have been saved',
      });
      navigate(`/organizer/group/${groupId}`); // Go back to details
      
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to update',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!groupId || deleteConfirmText !== originalGroup.name) {
      addToast({
        type: 'error',
        title: 'Confirmation failed',
        description: 'Group name did not match. Deletion cancelled.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await groupsService.deleteGroup(groupId);
      addToast({
        type: 'success',
        title: 'Group deleted',
        description: 'The group and all its records have been deleted',
      });
      // Clean up and go home
      navigate('/organizer');
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to delete',
        description: error.message,
      });
      setIsSubmitting(false);
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
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-red-700 dark:text-red-300 mb-4">
            Deleting this group will remove all data permanently. This action cannot be undone.
          </CardDescription>
          <Button 
            variant="destructive" 
            className="w-full bg-red-600 hover:bg-red-700" 
            onClick={() => setShowDeleteDialog(true)}
            disabled={isSubmitting}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete Group
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Delete Group?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This will permanently delete <strong>{originalGroup.name}</strong> and all its:
              </p>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300 list-disc list-inside">
                <li>Member records</li>
                <li>Payment history</li>
                <li>Cycle data</li>
                <li>All associated information</li>
              </ul>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-800 dark:text-red-300 mb-2">
                  Type the group name to confirm:
                </p>
                <Input 
                  placeholder={originalGroup.name}
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="dark:bg-slate-800 dark:border-gray-700"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmText('');
                }}>
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white" 
                  onClick={() => {
                    handleDelete();
                    setShowDeleteDialog(false);
                  }}
                  disabled={deleteConfirmText !== originalGroup.name || isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Delete Permanently
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};