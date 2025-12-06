import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { PayoutItem } from '@/services/payoutService';

interface PayoutConfirmationModalProps {
  isOpen: boolean;
  payoutItems: PayoutItem[];
  totals: { saved: Record<string, number>; fees: Record<string, number>; net: Record<string, number> };
  onConfirm: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function PayoutConfirmationModal({
  isOpen,
  payoutItems,
  totals,
  onConfirm,
  onCancel,
  isSaving = false
}: PayoutConfirmationModalProps) {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white dark:bg-slate-900 w-full rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <AlertTriangle className="h-6 w-6 text-orange-500 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold">Review Before Finalizing</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              This action cannot be undone. Please verify all amounts are correct.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="space-y-4 mb-6">
          {/* Total Saved */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                Total Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(totals.saved).map(([curr, amount]) => (
                  <div key={`saved-${curr}`} className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">{curr}:</span>
                    <span className="font-bold">{amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Organizer Fees */}
          <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                Your Fees (Organizer)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(totals.fees).map(([curr, amount]) => (
                  <div key={`fees-${curr}`} className="flex justify-between">
                    <span className="text-orange-700 dark:text-orange-300">{curr}:</span>
                    <span className="font-bold text-orange-700 dark:text-orange-300">
                      {amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Members Net Payout */}
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-green-800 dark:text-green-200">
                Members Receive (Net)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(totals.net).map(([curr, amount]) => (
                  <div key={`net-${curr}`} className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">{curr}:</span>
                    <span className="font-bold text-green-700 dark:text-green-300">
                      {amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Member Count */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3 mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              <strong>{payoutItems.length}</strong> members will receive payouts
            </span>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3 mb-6">
          <p className="text-sm text-red-700 dark:text-red-300 font-semibold">
            ⚠️ This cannot be undone yet. If you made a mistake, contact support.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={onConfirm}
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Finalizing...
              </span>
            ) : (
              '✓ Confirm & Finalize'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
