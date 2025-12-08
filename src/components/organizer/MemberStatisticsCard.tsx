import { useEffect, useState } from 'react';
import { organizerOnlyPayoutService } from '@/services/organizerOnlyPayoutService';
import { Star, TrendingDown, Calendar, Check, AlertCircle, Loader2 } from 'lucide-react';

interface MemberStatisticsCardProps {
  groupId: string;
  memberId: string;
}

export const MemberStatisticsCard = ({ 
  groupId, 
  memberId
}: MemberStatisticsCardProps) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMemberStats();
  }, [groupId, memberId]);

  const loadMemberStats = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get current cycle period (last 30 days as default)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const data = await organizerOnlyPayoutService.calculateMemberStatistics(
        groupId,
        memberId,
        startDate,
        endDate
      );
      setStats(data);
    } catch (err) {
      console.error('Error loading member statistics:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const renderConsistencyStars = (score: number) => {
    const filled = Math.round(score * 5);
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < filled
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex gap-2 items-center text-xs text-red-600 dark:text-red-400">
        <AlertCircle className="h-3 w-3 flex-shrink-0" />
        <span>{error || 'No data'}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Consistency Score */}
      <div className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-xs font-medium text-amber-900 dark:text-amber-200">Consistency</p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {Math.round((stats.consistencyScore || 0) * 100)}%
            </p>
          </div>
        </div>
        {renderConsistencyStars(stats.consistencyScore || 0)}
      </div>

      {/* Missed Cycles */}
      {(stats.missedCycles || 0) > 0 && (
        <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-xs font-medium text-red-900 dark:text-red-200">Missed Cycles</p>
              <p className="text-xs text-red-700 dark:text-red-300">
                {stats.missedCycles} cycle(s)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Count */}
      <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-xs font-medium text-blue-900 dark:text-blue-200">Payment Count</p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {stats.paymentCount || 0} payment(s)
            </p>
          </div>
        </div>
      </div>

      {/* Last Payment Date */}
      {stats.lastPaymentDate && (
        <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-xs font-medium text-green-900 dark:text-green-200">Last Payment</p>
              <p className="text-xs text-green-700 dark:text-green-300">
                {new Date(stats.lastPaymentDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
