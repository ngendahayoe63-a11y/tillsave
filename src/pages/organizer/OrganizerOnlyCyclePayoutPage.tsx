import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/toast';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/api/supabase';
import { groupsService } from '@/services/groupsService';
import { organizerOnlyPayoutService } from '@/services/organizerOnlyPayoutService';
import { notificationService } from '@/services/notificationService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, DollarSign, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CycleCompleteModal } from '@/components/modals/CycleCompleteModal';
import '@/styles/print.css';

export const OrganizerOnlyCyclePayoutPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user: currentUser } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCycleComplete, setShowCycleComplete] = useState(false);
  
  const [groupName, setGroupName] = useState('');
  const [groupData, setGroupData] = useState<any>(null);
  const [payoutItems, setPayoutItems] = useState<any[]>([]);
  const [totals, setTotals] = useState<any>({ saved: {}, fees: {}, net: {} });

  const loadData = async () => {
    if (!groupId || !currentUser) return;
    setIsLoading(true);
    try {
      const group = await groupsService.getGroupDetails(groupId);
      setGroupName(group.name);
      setGroupData(group);

      // Get cycle dates
      const cycleStart = new Date(group.current_cycle_start_date);
      const cycleEnd = new Date(cycleStart);
      cycleEnd.setDate(cycleEnd.getDate() + group.cycle_days);

      // Calculate payouts for Organizer-Only group
      const payouts = await organizerOnlyPayoutService.calculateCyclePayouts(
        groupId,
        cycleStart.toISOString().split('T')[0],
        cycleEnd.toISOString().split('T')[0]
      );

      // Transform payouts to match UI format
      const items = payouts.map(payout => ({
        memberId: payout.memberId,
        memberName: payout.memberName,
        memberPhone: payout.memberPhone,
        totalSaved: payout.totalAmount,
        organizerFee: payout.averagePayment,
        netPayout: payout.totalAmount - payout.averagePayment,
        currency: payout.currency,
        paymentCount: payout.paymentCount,
        averagePayment: payout.averagePayment
      }));

      setPayoutItems(items);

      // Calculate totals
      const tSaved: any = {};
      const tFees: any = {};
      const tNet: any = {};

      items.forEach((i: any) => {
        if(!tSaved[i.currency]) { tSaved[i.currency]=0; tFees[i.currency]=0; tNet[i.currency]=0; }
        tSaved[i.currency] += i.totalSaved;
        tFees[i.currency] += i.organizerFee;
        tNet[i.currency] += i.netPayout;
      });
      setTotals({ saved: tSaved, fees: tFees, net: tNet });

    } catch (error) {
      console.error(error);
      addToast({
        type: 'error',
        title: 'Error loading payout data',
        description: 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [groupId, currentUser]);

  const handleConfirmFinalize = async () => {
    if (!groupId || !groupData) return;
    
    setIsSaving(true);
    setShowConfirmDialog(false);
    try {
      // Get cycle dates
      const cycleStart = new Date(groupData.current_cycle_start_date);
      const cycleEnd = new Date(cycleStart);
      cycleEnd.setDate(cycleEnd.getDate() + groupData.cycle_days);

      // Create payout records
      const payoutData: any[] = payoutItems.map(item => ({
        memberId: item.memberId,
        memberName: item.memberName,
        memberPhone: item.memberPhone,
        totalAmount: item.totalSaved,
        currency: item.currency,
        paymentCount: item.paymentCount,
        averagePayment: item.organizerFee,
        cycleStartDate: cycleStart.toISOString().split('T')[0],
        cycleEndDate: cycleEnd.toISOString().split('T')[0],
        payoutEligible: true
      }));

      await organizerOnlyPayoutService.createPayoutsForCycle(
        groupId,
        cycleStart.toISOString().split('T')[0],
        cycleEnd.toISOString().split('T')[0],
        payoutData
      );

      // Increment cycle
      const newCycleStart = new Date(cycleEnd);
      newCycleStart.setDate(newCycleStart.getDate() + 1);

      const { error: updateError } = await supabase
        .from('groups')
        .update({
          current_cycle: groupData.current_cycle + 1,
          current_cycle_start_date: newCycleStart.toISOString()
        })
        .eq('id', groupId);

      if (updateError) throw updateError;

      setIsFinalized(true);
      
      // Notify members
      notificationService.subscribeToPayouts(groupId, (notification) => {
        if (notification.type === 'cycle_finalized') {
          console.log('✅ Cycle finalization notification triggered');
        }
      });
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#16a34a', '#2563eb', '#facc15']
      });

      addToast({
        type: 'success',
        title: 'Payout finalized',
        description: 'Cycle closed. Starting next cycle.',
      });

      // Show cycle complete modal
      setTimeout(() => {
        setShowCycleComplete(true);
      }, 500);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to finalize',
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartNextCycle = async () => {
    if (!groupId) return;
    
    setIsSaving(true);
    try {
      // Cycle already started by finalizePayout, just navigate
      navigate('/organizer');
      addToast({
        type: 'success',
        title: 'Next cycle started',
        description: 'You can now start recording payments for the new cycle.',
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasSavings = payoutItems.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {groupName} - End Cycle
          </h1>
          <div className="w-12" /> {/* Spacer for alignment */}
        </div>

        {/* Main Content */}
        {!isFinalized ? (
          <>
            {/* Empty State */}
            {!hasSavings && (
              <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-amber-900 dark:text-amber-100">No savings recorded</h3>
                      <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                        No members have made payments this cycle. You can still finalize the cycle if you wish.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payout Summary */}
            {hasSavings && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Payout Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payoutItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{item.memberName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.paymentCount} payments</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {item.totalSaved.toLocaleString()} {item.currency}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            (Fee: {item.organizerFee.toLocaleString()})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Totals */}
            <Card className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/30">
              <CardHeader>
                <CardTitle className="text-green-900 dark:text-green-100">Totals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(totals.saved).map(([currency, amount]: [string, any]) => (
                    <div key={currency} className="space-y-3">
                      <div>
                        <p className="text-sm text-green-800 dark:text-green-300">Total Saved</p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                          {amount.toLocaleString()} {currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-orange-800 dark:text-orange-300">Your Fee (1 day avg)</p>
                        <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                          {(totals.fees[currency] || 0).toLocaleString()} {currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-800 dark:text-blue-300">Members Get</p>
                        <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                          {(totals.net[currency] || 0).toLocaleString()} {currency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <Button
                variant="outline"
                onClick={() => navigate(`/organizer/group/${groupId}`)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setShowConfirmDialog(true)}
                className="flex-1 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DollarSign className="mr-2 h-4 w-4" />}
                Finalize Cycle
              </Button>
            </div>
          </>
        ) : null}

        {/* Confirm Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Confirm Cycle Finalization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Are you sure you want to finalize this cycle? This will:
                </p>
                <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400 ml-4">
                  <li>✓ Mark all payments as complete</li>
                  <li>✓ Record payout amounts for each member</li>
                  <li>✓ Start a new cycle automatically</li>
                </ul>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmFinalize}
                    disabled={isSaving}
                    className="flex-1 bg-slate-900 text-white hover:bg-slate-800"
                  >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Finalize
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cycle Complete Modal */}
        {showCycleComplete && (
          <CycleCompleteModal
            isOpen={showCycleComplete}
            cycleNumber={groupData?.current_cycle || 1}
            groupName={groupName}
            onStartNextCycle={handleStartNextCycle}
            onViewReport={() => navigate(`/organizer/group/${groupId}/report`)}
            isLoading={isSaving}
          />
        )}
      </div>
    </div>
  );
};
