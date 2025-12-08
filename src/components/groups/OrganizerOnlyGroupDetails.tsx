import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { useAuthStore } from '@/store/authStore';
import { organizerOnlyService } from '@/services/organizerOnlyService';
import { organizerOnlyCycleService } from '@/services/organizerOnlyCycleService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { Loader2, Plus, MessageSquare, Edit2, Trash2, X, Phone, Users, Eye, RotateCcw, FileText } from 'lucide-react';
import { OrganizerOnlyMember } from '@/types';
import { OrganizerPayoutDashboard } from '@/components/organizer/OrganizerPayoutDashboard';
import { MemberStatisticsCard } from '@/components/organizer/MemberStatisticsCard';
import { PaymentAnalytics } from '@/components/organizer/PaymentAnalytics';
import { OrganizerOnlyReport } from '@/components/organizer/OrganizerOnlyReport';
import { OrganizerOnlyEndCycleModal } from '@/components/modals/OrganizerOnlyEndCycleModal';

interface OrganizerOnlyGroupDetailsProps {
  groupId: string;
  group: any;
}

export const OrganizerOnlyGroupDetails = ({ groupId, group: initialGroup }: OrganizerOnlyGroupDetailsProps) => {
  const { addToast } = useToast();
  const { user } = useAuthStore();

  const [group, setGroup] = useState<any>(initialGroup);
  const [members, setMembers] = useState<OrganizerOnlyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showMemberSummary, setShowMemberSummary] = useState(false);
  const [memberSummary, setMemberSummary] = useState<any>(null);
  
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

  const [showReport, setShowReport] = useState(false);
  const [isCycleLoading, setIsCycleLoading] = useState(false);
  const [showEndCycleConfirm, setShowEndCycleConfirm] = useState(false);

  // Load members
  useEffect(() => {
    loadMembers();
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      const { groupsService } = await import('@/services/groupsService');
      const data = await groupsService.getGroupDetails(groupId);
      setGroup(data);
    } catch (err) {
      console.error('Error loading group:', err);
    }
  };

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
    if (!selectedMemberId || !paymentForm.amount || !user) return;

    try {
      const amount = parseFloat(paymentForm.amount);
      if (isNaN(amount) || amount <= 0) {
        addToast({
          type: 'error',
          title: 'Invalid amount',
          description: 'Please enter a valid amount',
        });
        return;
      }

      // Record payment for organizer-only member
      await organizerOnlyService.recordPayment(
        selectedMemberId,
        group.id,
        amount,
        group.currency || 'RWF',
        user.id,
        new Date(),
        paymentForm.notes || undefined
      );

      addToast({
        type: 'success',
        title: 'Payment recorded',
        description: `${amount} ${group.currency || 'RWF'} recorded successfully`,
      });
      
      setPaymentForm({ amount: '', notes: '' });
      setShowPaymentForm(false);
      setSelectedMemberId(null);
      
      // Reload members to show updated data
      await loadMembers();
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

  const handleViewSummary = async (memberId: string) => {
    try {
      const summary = await organizerOnlyService.getMemberSummary(groupId, memberId, group);
      setMemberSummary(summary);
      setShowMemberSummary(true);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to load summary',
        description: error.message,
      });
    }
  };

  const handleEndCycle = async () => {
    setShowEndCycleConfirm(true);
  };

  const handleConfirmEndCycle = async () => {
    try {
      setIsCycleLoading(true);
      await organizerOnlyCycleService.endCycle(groupId);
      
      // Reload group data to get new cycle number and dates
      await loadGroupData();
      
      // Reload members to show new cycle data
      await loadMembers();
      
      addToast({
        type: 'success',
        title: 'Cycle ended successfully',
        description: 'A new cycle has started. View the report for details.',
      });
      // Hide the confirmation dialog and show report
      setShowEndCycleConfirm(false);
      setShowReport(true);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to end cycle',
        description: error.message,
      });
    } finally {
      setIsCycleLoading(false);
    }
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
    <div className="space-y-6">
      {/* Payout Dashboard */}
      <OrganizerPayoutDashboard groupId={groupId} />

      {/* Payment Analytics */}
      <PaymentAnalytics groupId={groupId} />

      {/* Members Section */}
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
        <Button
          size="icon"
          variant="outline"
          onClick={() => setShowReport(true)}
          title="View cycle report"
          className="bg-purple-50 hover:bg-purple-100 border-purple-200"
        >
          <FileText className="h-4 w-4 text-purple-600" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={handleEndCycle}
          disabled={isCycleLoading}
          title="End cycle and pay members"
          className="bg-green-50 hover:bg-green-100 border-green-200"
        >
          {isCycleLoading ? (
            <Loader2 className="h-4 w-4 text-green-600 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4 text-green-600" />
          )}
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
                    {/* Member Statistics */}
                    <div className="mt-3">
                      <MemberStatisticsCard 
                        groupId={groupId}
                        memberId={member.id}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleViewSummary(member.id)}
                      title="View summary"
                    >
                      <Eye className="h-3.5 w-3.5 text-purple-600" />
                    </Button>
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

      {/* Member Summary Modal */}
      {showMemberSummary && memberSummary && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50">
          <Card className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-3 sticky top-0 bg-white dark:bg-slate-900">
              <CardTitle className="text-lg">Member Summary</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowMemberSummary(false);
                  setMemberSummary(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Member Name & Phone */}
              <div className="border-b pb-4">
                <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  {memberSummary.member.name}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4" />
                  {memberSummary.member.phone_number}
                </p>
                {memberSummary.member.email && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {memberSummary.member.email}
                  </p>
                )}
              </div>

              {/* Totals by Currency */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">AMOUNTS</p>
                {Object.entries(memberSummary.totalSaved).map(([currency, total]) => (
                  <div key={currency} className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total Saved ({currency}):
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {(total as number).toLocaleString()} {currency}
                    </span>
                  </div>
                ))}
              </div>

              {/* Payment Details */}
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3">PAYMENT HISTORY</p>
                {memberSummary.payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No payments yet</p>
                ) : (
                  <div className="space-y-2">
                    {memberSummary.payments.map((payment: any) => (
                      <div key={payment.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                        <span className="text-gray-600 dark:text-gray-400">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </span>
                        <span className="font-medium">
                          {payment.amount.toLocaleString()} {payment.currency}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Count */}
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">PAYMENT COUNT</p>
                {Object.entries(memberSummary.paymentCount).map(([currency, count]) => (
                  <p key={currency} className="text-sm text-gray-600 dark:text-gray-400">
                    {String(count)} payment(s) in {currency}
                  </p>
                ))}
              </div>

              {/* Close Button */}
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => {
                  setShowMemberSummary(false);
                  setMemberSummary(null);
                }}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <OrganizerOnlyReport
          groupId={groupId}
          groupName={group.name}
          onClose={() => setShowReport(false)}
          onMembersUpdated={loadMembers}
        />
      )}

      {/* End Cycle Modal with Preview */}
      <OrganizerOnlyEndCycleModal
        isOpen={showEndCycleConfirm}
        groupId={groupId}
        isLoading={isCycleLoading}
        onConfirm={handleConfirmEndCycle}
        onCancel={() => setShowEndCycleConfirm(false)}
      />
      </div>
    </div>
  );
};
