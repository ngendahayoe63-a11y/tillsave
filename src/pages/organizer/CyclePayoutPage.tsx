import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/toast';
import { payoutService, PayoutItem } from '@/services/payoutService';
import { groupsService } from '@/services/groupsService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle, AlertTriangle, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';
import PayoutReportPDF from '@/components/payouts/PayoutReportPDF';
import '@/styles/print.css';

export const CyclePayoutPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [groupName, setGroupName] = useState('');
  const [groupData, setGroupData] = useState<any>(null);
  const [payoutItems, setPayoutItems] = useState<PayoutItem[]>([]);
  const [totals, setTotals] = useState({ saved: {}, fees: {}, net: {} });

  useEffect(() => {
    const loadData = async () => {
      if (!groupId) return;
      try {
        const group = await groupsService.getGroupDetails(groupId);
        setGroupName(group.name);
        setGroupData(group);

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
    loadData();
  }, [groupId]);

  const handleFinalize = async () => {
    if (!groupId) return;
    
    setIsSaving(true);
    try {
      await payoutService.finalizePayout(groupId, payoutItems);
      setIsFinalized(true);
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#16a34a', '#2563eb', '#facc15']
      });

      addToast({
        type: 'success',
        title: 'Payout finalized',
        description: 'Cycle closed and all records saved successfully',
      });

      // Auto-print PDF
      setTimeout(() => {
        window.print();
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

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

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
            organizerName={groupData?.organizer_name || 'Unknown'}
            organizerPhone={groupData?.organizer_phone || 'N/A'}
            organizerEarnings={Object.entries(totals.fees).map(([currency, amount]) => ({
              currency,
              amount: amount as number
            }))}
            reportId={`RPT-${Date.now()}`}
          />
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
      <header className="bg-white dark:bg-slate-900 p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800">
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
          <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50 dark:bg-blue-950 no-print">
            <div className="mb-4 p-4 bg-white dark:bg-slate-900 rounded border border-blue-200 dark:border-blue-800">
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
                organizerName={groupData?.organizer_name || 'Unknown'}
                organizerPhone={groupData?.organizer_phone || 'N/A'}
                organizerEarnings={Object.entries(totals.fees).map(([currency, amount]) => ({
                  currency,
                  amount: amount as number
                }))}
                reportId={`RPT-${Date.now()}`}
              />
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
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

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 safe-area no-print">
        <div className="max-w-3xl mx-auto flex gap-2 sm:gap-4">
          <Button variant="outline" className="flex-1 h-10 sm:h-11 text-xs sm:text-base" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button className="flex-[2] h-10 sm:h-11 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-base" onClick={() => setShowConfirmDialog(true)} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin mr-1 sm:mr-2 h-4 w-4" /> : <CheckCircle className="mr-1 sm:mr-2 h-4 w-4" />}
            <span className="truncate">Finalize</span>
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                Confirm Finalization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to finalize this cycle? This will:
              </p>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300 list-disc list-inside">
                <li>Lock all calculations permanently</li>
                <li>Record all member payouts</li>
                <li>Close this cycle and start a new one</li>
              </ul>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  ⚠️ This action cannot be undone
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowConfirmDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => {
                  setShowConfirmDialog(false);
                  handleFinalize();
                }}>
                  Yes, Finalize
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
