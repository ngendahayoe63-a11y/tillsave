import { useEffect, useState } from 'react';
import { organizerOnlyService } from '@/services/organizerOnlyService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, TrendingUp, Zap, Loader2 } from 'lucide-react';

interface PaymentAnalyticsProps {
  groupId: string;
}

export const PaymentAnalytics = ({ groupId }: PaymentAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [groupId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get members to count payments
      const memberData = await organizerOnlyService.getGroupMembers(groupId);
      
      // Count total records for demonstration
      const totalPayments = 0; // Will be calculated from member summary data
      
      setAnalytics({
        totalPayments,
        members: memberData
      });
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics');
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

  if (!analytics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
          📊 Payment Analytics
        </h2>
        <p className="text-sm text-muted-foreground">Payment trends and member performance</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Active Members
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                  {analytics.members.length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-900 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">
                  Status
                </p>
                <p className="text-xl font-bold text-green-900 dark:text-green-100 mt-2">
                  Ready
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List for Analytics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Member Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No members yet</p>
            ) : (
              analytics.members.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.phone_number}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
