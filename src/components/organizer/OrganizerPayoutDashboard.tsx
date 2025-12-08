import { useEffect, useState } from 'react';
import { organizerOnlyPayoutService } from '@/services/organizerOnlyPayoutService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';

interface OrganizerPayoutDashboardProps {
  groupId: string;
}

export const OrganizerPayoutDashboard = ({ groupId }: OrganizerPayoutDashboardProps) => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPayoutData();
  }, [groupId]);

  const loadPayoutData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizerOnlyPayoutService.getGroupPayoutSummary(groupId);
      setSummary(data);
    } catch (err) {
      console.error('Error loading payout summary:', err);
      setError('Failed to load payout information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-400">Error</h3>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No payout data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
          💰 Payout Summary
        </h2>
        <p className="text-sm text-muted-foreground">Payout status for current cycle</p>
      </div>

      {/* Main Stats - 3 Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Payouts */}
        <Card className="border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Total Payouts
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                  {(summary.totalPayouts || 0).toLocaleString()} RWF
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Ready for Payout */}
        <Card className="border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Ready for Payout
                </p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-2">
                  {summary.readyForPayout || 0}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  {summary.totalMembers ? Math.round((summary.readyForPayout / summary.totalMembers) * 100) : 0}% of members
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Already Paid */}
        <Card className="border-green-200 dark:border-green-900 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">
                  Already Paid
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-2">
                  {summary.alreadyPaid || 0}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  {summary.totalMembers ? Math.round((summary.alreadyPaid / summary.totalMembers) * 100) : 0}% of members
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown by Currency */}
      {summary.byCurrency && Object.keys(summary.byCurrency).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Breakdown by Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(summary.byCurrency).map(([currency, data]: [string, any]) => (
                <div key={currency}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {currency}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {(data.amount || 0).toLocaleString()} {currency}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (data.memberCount / summary.totalMembers) * 100) || 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.memberCount || 0} member(s)
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
