import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface CycleCompleteModalProps {
  isOpen: boolean;
  cycleNumber: number;
  groupName: string;
  onStartNextCycle: () => void;
  onViewReport: () => void;
  isLoading?: boolean;
}

export function CycleCompleteModal({
  isOpen,
  cycleNumber,
  groupName,
  onStartNextCycle,
  onViewReport,
  isLoading = false
}: CycleCompleteModalProps) {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#16a34a', '#2563eb', '#facc15']
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-xl">
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 dark:bg-green-950 rounded-full p-4">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2">
          ✅ Payout Finalized!
        </h2>

        {/* Details */}
        <div className="space-y-4 mb-6">
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Group:</span>
                  <span className="font-bold">{groupName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cycle Completed:</span>
                  <span className="font-bold">#{cycleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Next Cycle:</span>
                  <span className="font-bold">#{cycleNumber + 1}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <CardContent className="pt-4">
              <p className="text-sm text-green-700 dark:text-green-300">
                Members can now start contributing to <strong>Cycle #{cycleNumber + 1}</strong>. Click "Start Next Cycle" to begin accepting new payments.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
            onClick={onStartNextCycle}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Starting...
              </span>
            ) : (
              <>
                Start Cycle #{cycleNumber + 1}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={onViewReport}
            disabled={isLoading}
          >
            View Payout Report
          </Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          You can view past cycles anytime in Group History
        </p>
      </div>
    </div>
  );
}
