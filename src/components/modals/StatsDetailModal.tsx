import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface StatDetail {
  groupId: string;
  groupName: string;
  value: number | string;
  currency?: string;
  cycle?: number;
  cycleStatus?: string;
  additionalInfo?: string;
}

export interface StatsDetailModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  details: StatDetail[];
  onClose: () => void;
}

export const StatsDetailModal = ({
  isOpen,
  title,
  description,
  details,
  onClose,
}: StatsDetailModalProps) => {
  if (!isOpen) return null;

  const totalValue = details.reduce((sum, detail) => {
    const val = typeof detail.value === 'number' ? detail.value : parseInt(detail.value as string) || 0;
    return sum + val;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <p className="text-sm text-gray-500 mt-2">{description}</p>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="overflow-y-auto flex-1">
          <div className="space-y-4">
            {/* Total Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Across Groups</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {totalValue.toLocaleString()}
              </p>
            </div>

            {/* Group Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500">Breakdown by Group</h3>
              {details.length === 0 ? (
                <p className="text-sm text-gray-500 py-4">No data available</p>
              ) : (
                details.map((detail, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {detail.groupName}
                        </p>
                        {detail.cycle && (
                          <p className="text-xs text-gray-500 mt-1">
                            Cycle #{detail.cycle}
                            {detail.cycleStatus && ` (${detail.cycleStatus})`}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {typeof detail.value === 'number'
                            ? detail.value.toLocaleString()
                            : detail.value}
                        </p>
                        {detail.currency && (
                          <p className="text-xs text-gray-500">{detail.currency}</p>
                        )}
                      </div>
                    </div>
                    {detail.additionalInfo && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                        {detail.additionalInfo}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>

        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};
