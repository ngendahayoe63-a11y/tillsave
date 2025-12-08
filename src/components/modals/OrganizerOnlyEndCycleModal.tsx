import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { organizerOnlyPayoutService } from '@/services/organizerOnlyPayoutService';
import { groupsService } from '@/services/groupsService';

interface OrganizerOnlyEndCycleModalProps {
  isOpen: boolean;
  groupId: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const OrganizerOnlyEndCycleModal: React.FC<OrganizerOnlyEndCycleModalProps> = ({
  isOpen,
  groupId,
  isLoading,
  onConfirm,
  onCancel,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [payoutData, setPayoutData] = useState<any[]>([]);
  const [organizerFeeTotal, setOrganizerFeeTotal] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (isOpen && showPreview) {
      loadPayoutData();
    }
  }, [isOpen, showPreview, groupId]);

  const loadPayoutData = async () => {
    setIsLoadingData(true);
    try {
      // Get group details to get cycle dates
      const groupData = await groupsService.getGroupDetails(groupId);

      const cycleStartDate = new Date(groupData.current_cycle_start_date).toISOString();
      const cycleEndDate = new Date().toISOString();

      // Calculate payouts for current cycle
      const payouts = await organizerOnlyPayoutService.calculateCyclePayouts(
        groupId,
        cycleStartDate,
        cycleEndDate,
        1 // minimum 1 payment
      );

      if (payouts && payouts.length > 0) {
        // Calculate organizer fee (1 day's worth of average payment)
        let totalFee = 0;
        const formattedPayouts = payouts.map((payout: any) => {
          const organizerFee = payout.averagePayment; // 1 day = average payment
          const netPayout = payout.totalAmount - organizerFee;
          totalFee += organizerFee;

          return {
            name: payout.memberName,
            totalSaved: payout.totalAmount,
            organizerFee: organizerFee,
            netPayout: netPayout,
            daysContributed: payout.paymentCount,
            currency: payout.currency,
          };
        });

        setPayoutData(formattedPayouts);
        setOrganizerFeeTotal(totalFee);
      } else {
        setPayoutData([]);
        setOrganizerFeeTotal(0);
      }
    } catch (error) {
      console.error('Error loading payout data:', error);
      setPayoutData([]);
      setOrganizerFeeTotal(0);
    } finally {
      setIsLoadingData(false);
    }
  };

  if (!isOpen) return null;

  const hasSavings = payoutData.length > 0 && payoutData.some(p => p.totalSaved > 0);

  if (!hasSavings && showPreview) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
        <Card className="w-full max-w-sm dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 dark:text-white text-base">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              No Savings Recorded
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              You cannot end the cycle because no members have recorded any savings yet.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Members need to record at least one payment before you can finalize the cycle.
            </p>
            <Button onClick={onCancel} className="w-full">
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 max-h-screen overflow-y-auto">
      <Card className="w-full max-w-2xl dark:bg-slate-900 my-4 sm:my-0">
        <CardHeader className="pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <CardTitle className="dark:text-white text-base sm:text-lg">End Cycle & Payout</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs sm:text-sm"
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" /> Hide Preview
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" /> Preview Report
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {isLoadingData ? (
          <CardContent className="p-4 sm:p-6 flex items-center justify-center min-h-32">
            <Loader2 className="animate-spin h-6 w-6" />
          </CardContent>
        ) : showPreview && hasSavings ? (
          <CardContent className="p-4 sm:p-6 space-y-4 max-h-96 overflow-y-auto">
            {/* Organizer Earnings */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg p-3 sm:p-4">
              <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-2">
                Your Earnings (1-Day Fees)
              </h3>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-400 mb-2">
                RWF {organizerFeeTotal.toLocaleString()}
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                💡 Tip: Each member contributes 1 day's savings as organizer fee for managing the group
              </p>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg p-3 sm:p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                All members receive their full contributions minus 1 day as organizer fee. Review amounts below carefully before finalizing.
              </p>
            </div>

            {/* Member Payouts */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Member Payouts
              </h3>
              <div className="space-y-2">
                {payoutData.map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 bg-white dark:bg-slate-800"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Days Contributed: {item.daysContributed}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Saved: {item.totalSaved.toLocaleString()} RWF
                        </div>
                        <div className="text-xs text-red-500 mb-2">
                          - Fee: {item.organizerFee.toLocaleString()} RWF
                        </div>
                        <div className="text-lg font-bold text-green-700 dark:text-green-400">
                          {item.netPayout.toLocaleString()} <span className="text-xs text-gray-500">RWF</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center py-4">
              Click "Preview Report" to see payout details before finalizing
            </p>
          </CardContent>
        )}

        {/* Footer Actions */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-3 sm:p-4 flex gap-2 sm:gap-3">
          <Button variant="outline" className="flex-1 h-10 sm:h-11 text-xs sm:text-sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="flex-1 h-10 sm:h-11 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
            onClick={onConfirm}
            disabled={isLoading || !hasSavings}
            title={!hasSavings ? "No savings recorded - cannot finalize empty cycle" : ""}
          >
            {isLoading && <Loader2 className="animate-spin mr-1 sm:mr-2 h-4 w-4" />}
            Finalize
          </Button>
        </div>
      </Card>
    </div>
  );
};
