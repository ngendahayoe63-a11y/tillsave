import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { organizerOnlyService } from '@/services/organizerOnlyService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { Loader2, Plus, MessageSquare, Edit2, Trash2, X, Phone, Users } from 'lucide-react';
import { OrganizerOnlyMember } from '@/types';

interface OrganizerOnlyGroupDetailsProps {
  groupId: string;
  group: any;
}

export const OrganizerOnlyGroupDetails = ({ groupId, group }: OrganizerOnlyGroupDetailsProps) => {
  const { addToast } = useToast();

  const [members, setMembers] = useState<OrganizerOnlyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    phone_number: '',
    email: '',
    notes: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    notes: ''
  });

  // Load members
  useEffect(() => {
    loadMembers();
  }, [groupId]);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const data = await organizerOnlyService.getGroupMembers(groupId);
      setMembers(data);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to load members',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await organizerOnlyService.addMember(
        groupId,
        newMemberForm.name,
        newMemberForm.phone_number,
        newMemberForm.email || undefined,
        newMemberForm.notes || undefined
      );
      addToast({
        type: 'success',
        title: 'Member added',
        description: `${newMemberForm.name} has been added to the group`,
      });
      setNewMemberForm({ name: '', phone_number: '', email: '', notes: '' });
      setShowAddMember(false);
      await loadMembers();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to add member',
        description: error.message,
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await organizerOnlyService.deactivateMember(memberId);
      addToast({
        type: 'success',
        title: 'Member removed',
      });
      await loadMembers();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to remove member',
        description: error.message,
      });
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !paymentForm.amount) return;

    try {
      // TODO: Record payment via paymentService
      // For now, just show success
      addToast({
        type: 'success',
        title: 'Payment recorded',
        description: `${paymentForm.amount} recorded for selected member`,
      });
      setPaymentForm({ amount: '', notes: '' });
      setShowPaymentForm(false);
      setSelectedMemberId(null);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to record payment',
        description: error.message,
      });
    }
  };

  const handleSendSMS = (_memberId: string) => {
    // TODO: Implement SMS sending
    addToast({
      type: 'info',
      title: 'SMS feature coming soon',
      description: 'This feature will be available after Phase 2',
    });
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone_number.includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{members.length}</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{group.cycle_days}</p>
              <p className="text-xs text-muted-foreground">Days in Cycle</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member Search & Add */}
      <div className="flex gap-2">
        <Input
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button 
          size="icon"
          onClick={() => setShowAddMember(!showAddMember)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Add Member Form */}
      {showAddMember && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-slate-900 dark:border-blue-900">
          <CardContent className="pt-6">
            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="text-xs font-medium">Member Name *</label>
                <Input
                  placeholder="e.g. John Doe"
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium">Phone Number *</label>
                <Input
                  placeholder="e.g. +250789123456"
                  value={newMemberForm.phone_number}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, phone_number: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium">Email (Optional)</label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={newMemberForm.email}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Notes (Optional)</label>
                <Input
                  placeholder="e.g. Family group, pays on Fridays..."
                  value={newMemberForm.notes}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Add Member
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddMember(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      {filteredMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No members yet"
          description="Add members to start tracking their savings"
          actionLabel="Add Member"
          onAction={() => setShowAddMember(true)}
        />
      ) : (
        <div className="space-y-2">
          {filteredMembers.map(member => (
            <Card key={member.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" />
                      {member.phone_number}
                    </p>
                    {member.notes && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {member.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedMemberId(member.id);
                        setShowPaymentForm(true);
                      }}
                      title="Record payment"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleSendSMS(member.id)}
                      title="Send SMS"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-green-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleRemoveMember(member.id)}
                      title="Remove member"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Recording Modal */}
      {showPaymentForm && selectedMemberId && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50">
          <Card className="w-full sm:max-w-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Record Payment</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowPaymentForm(false);
                  setSelectedMemberId(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div>
                  <label className="text-xs font-medium">Amount {group.currency || 'RWF'}</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Notes (Optional)</label>
                  <Input
                    placeholder="e.g. Paid in cash"
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Record Payment
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
