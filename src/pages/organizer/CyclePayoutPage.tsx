import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/toast';
import { useAuthStore } from '@/store/authStore';
import { payoutService, PayoutItem } from '@/services/payoutService';
import { groupsService } from '@/services/groupsService';
import { notificationService } from '@/services/notificationService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle, AlertTriangle, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';
import PayoutReportPDF from '@/components/payouts/PayoutReportPDF';
import { CycleCompleteModal } from '@/components/modals/CycleCompleteModal';
import '@/styles/print.css';

export const CyclePayoutPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user: currentUser } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCycleComplete, setShowCycleComplete] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [groupName, setGroupName] = useState('');
  const [groupData, setGroupData] = useState<any>(null);
  const [payoutItems, setPayoutItems] = useState<PayoutItem[]>([]);
  const [totals, setTotals] = useState({ saved: {}, fees: {}, net: {} });
  const [organizerDetails, setOrganizerDetails] = useState<any>(null);

  const loadData = async () => {
    if (!groupId || !currentUser) return;
    setIsLoading(true);
    try {
      const group = await groupsService.getGroupDetails(groupId);
      console.log('🔍 CyclePayoutPage - Group loaded:', { name: group.name, type: group.group_type, id: group.id });
      
      setGroupName(group.name);
      setGroupData(group);

      // Check if this is an Organizer-Only group - if so, this is wrong page!
      if (group.group_type === 'ORGANIZER_ONLY') {
        console.warn('❌ ORGANIZER_ONLY group loaded on Full Platform page! Redirecting...');
        addToast({
          type: 'warning',
          title: 'Wrong Page',
          description: 'This is an Organizer-Only group. Redirecting to the correct page...',
        });
        navigate(`/organizer/group/${groupId}/payout-cycle-organizer`, { replace: true });
        return;
      }

      // Fetch organizer details
      const orgDetails = await payoutService.getOrganizerDetails(currentUser.id);
      setOrganizerDetails(orgDetails);

      const items = await payoutService.previewCyclePayout(groupId);
      setPayoutItems(items);

      // Calculate Totals
      const tSaved: any = {};
      const tFees: any = {};
      const tNet: any = {};

      items.forEach(i => {
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

  // Auto-open print dialog when finalized and preview is shown
  useEffect(() => {
    if (isFinalized && showPreview) {
      setTimeout(() => {
        window.print();
      }, 800);
    }
  }, [isFinalized, showPreview]);


  const handleConfirmFinalize = async () => {
    if (!groupId) return;
    
    setIsSaving(true);
    setShowConfirmDialog(false);
    try {
      await payoutService.finalizePayout(groupId, payoutItems);
      setIsFinalized(true);
      
      // Notify all members that cycle has been finalized
      notificationService.subscribeToPayouts(groupId, (notification) => {
        if (notification.type === 'cycle_finalized') {
          console.log('✅ Cycle finalization notification triggered for members');
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
        description: 'Cycle closed. Now start the next cycle to continue.',
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
      await payoutService.startNextCycle(groupId);
      
      addToast({
        type: 'success',
        title: 'Next cycle started',
        description: 'Members can now contribute to the new cycle.',
      });

      // Navigate back to dashboard after a short delay to let the toast show
      setTimeout(() => {
        navigate('/organizer/dashboard', { replace: true });
      }, 1000);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to start next cycle',
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewReport = () => {
    setShowCycleComplete(false);
    setShowPreview(true);
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  // Check if there are any savings to payout
  const hasSavings = payoutItems.length > 0 && Object.keys(totals.saved).length > 0 && Object.values(totals.saved).some(amount => (amount as number) > 0);

  // Show empty state if no savings recorded
  if (!hasSavings && !isFinalized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col">
        <header className="bg-white dark:bg-slate-900 p-4 shadow-sm border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">End Cycle & Payout</h1>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-sm text-center">
            <div className="h-20 w-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              No Savings Recorded
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              You cannot end the cycle because no members have recorded any savings yet.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Members need to record at least one payment before you can finalize the cycle.
            </p>
            <Button onClick={() => navigate(-1)} className="w-full">
              Back to Group
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (isFinalized) {
    if (showPreview) {
      return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
          <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4 no-print">
            <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">Payout Report Preview</h1>
            <div className="ml-auto flex gap-2">
              <Button size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" /> Print / Save PDF
              </Button>
            </div>
          </div>
          <div className="print:p-0 p-4">
            <PayoutReportPDF
              groupName={groupName}
              cycleNumber={groupData?.current_cycle || 1}
              cycleStartDate={new Date(groupData?.current_cycle_start_date)}
              cycleEndDate={new Date()}
              generatedDate={new Date()}
              members={payoutItems.map(item => ({
                name: item.memberName,
                totalSaved: item.totalSaved,
                organizerFee: item.organizerFee,
                netPayout: item.netPayout,
                daysContributed: item.daysContributed,
                totalDays: item.daysContributed,
                currency: item.currency
              }))}
              organizerName={organizerDetails?.name || 'Unknown'}
              organizerEmail={organizerDetails?.email || 'N/A'}
              organizerPhone={organizerDetails?.phone || 'N/A'}
              organizerEarnings={Object.entries(totals.fees).map(([currency, amount]) => ({
                currency,
                amount: amount as number
              }))}
              reportId={`RPT-${Date.now()}`}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="p-8 flex flex-col items-center justify-center text-center min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-2">Cycle Closed Successfully!</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-xs">
          The payout report has been generated and all records are saved.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Printer className="mr-2 h-4 w-4" /> Preview & Print Report
          </Button>
          <Button onClick={() => navigate('/organizer')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20">
      <header className="bg-white dark:bg-slate-900 p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 no-print">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">End Cycle & Payout</h1>
      </header>

      <main className="p-4 max-w-3xl mx-auto space-y-6 pb-28">
        
        {/* Preview Button */}
        <Button 
          className="w-full no-print"
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? '📋 Hide Preview' : '👁️ Preview Professional Report'}
        </Button>

        {showPreview && (
          <div className="border-2 border-blue-300 rounded-lg p-2 sm:p-4 bg-blue-50 dark:bg-blue-950 no-print overflow-x-auto">
            <div className="mb-4 p-0 bg-white dark:bg-slate-900 rounded border border-blue-200 dark:border-blue-800 min-w-full sm:min-w-0">
              <PayoutReportPDF
                groupName={groupName}
                cycleNumber={groupData?.current_cycle || 1}
                cycleStartDate={new Date(groupData?.current_cycle_start_date)}
                cycleEndDate={new Date()}
                generatedDate={new Date()}
                members={payoutItems.map(item => ({
                  name: item.memberName,
                  totalSaved: item.totalSaved,
                  organizerFee: item.organizerFee,
                  netPayout: item.netPayout,
                  daysContributed: item.daysContributed,
                  totalDays: item.daysContributed,
                  currency: item.currency
                }))}
                organizerName={organizerDetails?.name || 'Unknown'}
                organizerEmail={organizerDetails?.email || 'N/A'}
                organizerPhone={organizerDetails?.phone || 'N/A'}
                organizerEarnings={Object.entries(totals.fees).map(([currency, amount]) => ({
                  currency,
                  amount: amount as number
                }))}
                reportId={`RPT-${Date.now()}`}
              />
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 text-center mt-2">
              Use print (Ctrl+P / Cmd+P) to save as PDF
            </p>
          </div>
        )}

        {/* Organizer Earnings Card */}
        <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30">
          <CardHeader>
            <CardTitle className="text-amber-900 dark:text-amber-300">Your Earnings (1-Day Fees)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(totals.fees).map(([currency, amount]) => (
                <div key={currency} className="flex justify-between items-center">
                  <span className="text-sm text-amber-800 dark:text-amber-200">{currency}</span>
                  <span className="text-lg font-bold text-amber-900 dark:text-amber-400">
                    {(amount as number).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-4 pt-4 border-t border-amber-200 dark:border-amber-900/30">
              💡 Tip: Each member contributes 1 day's savings as organizer fee for managing the group
            </p>
          </CardContent>
        </Card>

        {/* Warning Card */}
        <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-900/30">
          <CardContent className="p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0" />
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              All members receive their full contributions minus 1 day as organizer fee. Review amounts below carefully before finalizing.
            </p>
          </CardContent>
        </Card>

        {/* Breakdown List */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Member Payouts</h2>
          <div className="space-y-3">
            {payoutItems.map((item, idx) => (
              <Card key={idx} className="dark:bg-slate-900">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-bold">{item.memberName}</div>
                    <div className="text-xs text-gray-500">
                      Days Contributed: {item.daysContributed}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">
                      Saved: {item.totalSaved.toLocaleString()} {item.currency}
                    </div>
                    <div className="text-xs text-red-500 mb-2">
                      - Fee: {item.organizerFee.toLocaleString()} {item.currency}
                    </div>
                    <div className="text-xl font-bold text-green-700 dark:text-green-400">
                      {item.netPayout.toLocaleString()} <span className="text-xs text-gray-500">{item.currency}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </main>

      {/* Footer Action - On mobile sits above BottomNav (64px), on desktop at actual bottom */}
      <div className="fixed md:static left-0 right-0 p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 no-print z-40" style={{ bottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
        <div className="max-w-3xl mx-auto space-y-3">
          {!hasSavings && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded text-red-700 dark:text-red-300 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>At least one member must record a payment before finalizing</span>
            </div>
          )}
          <div className="flex gap-2 sm:gap-4">
            <Button variant="outline" className="flex-1 h-10 sm:h-11 text-xs sm:text-base" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button className="flex-[2] h-10 sm:h-11 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-base" onClick={() => setShowConfirmDialog(true)} disabled={isSaving || !hasSavings} title={!hasSavings ? "No savings recorded - cannot finalize empty cycle" : ""}>
              {isSaving ? <Loader2 className="animate-spin mr-1 sm:mr-2 h-4 w-4" /> : <CheckCircle className="mr-1 sm:mr-2 h-4 w-4" />}
              <span className="truncate">Finalize</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
          <Card className="w-full max-w-sm dark:bg-slate-900 max-h-[90vh] sm:max-h-none overflow-y-auto">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 dark:text-white text-base sm:text-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <span className="truncate">Confirm Finalization</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Are you sure you want to finalize this cycle? This will:
              </p>
              <ul className="text-xs sm:text-sm space-y-2 text-gray-600 dark:text-gray-300 list-disc list-inside">
                <li className="break-words">Lock all calculations permanently</li>
                <li className="break-words">Record all member payouts</li>
                <li className="break-words">Close this cycle and start a new one</li>
              </ul>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 sm:p-3 rounded border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300 break-words">
                  ⚠️ This action cannot be undone
                </p>
              </div>
              <div className="flex gap-2 sm:gap-3 pt-2">
                <Button variant="outline" className="flex-1 h-10 sm:h-11 text-xs sm:text-sm" onClick={() => setShowConfirmDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 h-10 sm:h-11 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm" onClick={() => handleConfirmFinalize()} disabled={isSaving}>
                  {isSaving && <Loader2 className="animate-spin mr-1 sm:mr-2 h-4 w-4" />}
                  <span className="truncate">Yes, Finalize</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cycle Complete Modal */}
      <CycleCompleteModal
        isOpen={showCycleComplete}
        cycleNumber={(groupData?.current_cycle || 1) + 1}
        groupName={groupName}
        onStartNextCycle={handleStartNextCycle}
        onViewReport={handleViewReport}
        isLoading={isSaving}
      />
    </div>
  );
};
