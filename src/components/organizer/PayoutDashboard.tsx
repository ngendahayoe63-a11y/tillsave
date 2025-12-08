import { useEffect, useState } from 'react';
import { organizerOnlyPayoutService } from '@/services/organizerOnlyPayoutService';
import { formatCurrency } from '@/utils/currency';
import { TrendingUp, DollarSign, Users, BarChart3, AlertCircle } from 'lucide-react';

interface PayoutDashboardProps {
  groupId: string;
}

export default function PayoutDashboard({ groupId }: PayoutDashboardProps) {
  const [summary, setSummary] = useState<any>(null);
  const [smsAnalytics, setSmsAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [groupId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [payoutSum, smsData] = await Promise.all([
        organizerOnlyPayoutService.getGroupPayoutSummary(groupId),
        organizerOnlyPayoutService.getSMSAnalytics(groupId)
      ]);
      setSummary(payoutSum);
      setSmsAnalytics(smsData);
    } catch (err) {
      console.error('Error loading payout data:', err);
      setError('Failed to load payout information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading payout data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Error</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-8 text-gray-500">
        No payout data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Payouts */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payouts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(summary.totalPayouts, 'RWF')}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* Ready for Payout */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ready for Payout</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {summary.readyForPayout}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-amber-500" />
          </div>
        </div>

        {/* Already Paid */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Already Paid</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {summary.alreadyPaid}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* SMS Delivery Rate */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">SMS Delivery</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {smsAnalytics?.deliveryRate}%
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Currency Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Payouts by Currency
        </h3>
        <div className="space-y-3">
          {Object.entries(summary.currencyBreakdown).map(([currency, amount]) => (
            <div key={currency} className="flex items-center justify-between">
              <span className="text-gray-700">{currency}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${(
                        ((amount as number) / summary.totalPayouts) *
                        100
                      ).toFixed(0)}%`
                    }}
                  />
                </div>
                <span className="font-semibold text-gray-900 min-w-fit">
                  {formatCurrency(amount as number, currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SMS Analytics */}
      {smsAnalytics && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            SMS Communication Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Sent</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {smsAnalytics.totalSent}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {smsAnalytics.sent}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-xl font-bold text-red-600 mt-1">
                {smsAnalytics.failed}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-bold text-amber-600 mt-1">
                {smsAnalytics.pending}
              </p>
            </div>
          </div>

          {/* SMS by Type */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Messages by Type</h4>
            <div className="space-y-2">
              {Object.entries(smsAnalytics.byType).map(([type, count]: [string, any]) => (
                <div
                  key={type}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-600 capitalize">
                    {type.replace(/_/g, ' ')}
                  </span>
                  <span className="font-semibold text-gray-900">{count as number}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Failed Messages */}
          {smsAnalytics.recentFailed?.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Recent Failed Messages
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {smsAnalytics.recentFailed.map((log: any) => (
                  <div
                    key={log.id}
                    className="text-sm bg-red-50 p-2 rounded border border-red-200"
                  >
                    <p className="text-red-900 font-medium">
                      {log.phone_number}
                    </p>
                    <p className="text-red-700 text-xs mt-1">
                      {log.error_message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
