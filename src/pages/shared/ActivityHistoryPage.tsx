import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/api/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DashboardSkeleton } from '@/components/shared/DashboardSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  ArrowLeft,
  AlertCircle,
  Search,
  Copy,
  Clock,
  User,
  Building,
  DollarSign,
  CheckCircle,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface ActivityRecord {
  id: string;
  type: 'payment' | 'payout' | 'contribution';
  amount: number;
  currency: string;
  status: string;
  memberName: string;
  groupName: string;
  timestamp: string;
  recordedAt?: string;
  paymentDate?: string;
  description: string;
  groupId: string;
  memberId: string;
  details: {
    membershipId?: string;
    membershipStatus?: string;
    payoutId?: string;
    organizerFee?: number;
  };
}

export const ActivityHistoryPage = () => {
  const { user } = useAuthStore();
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCurrency, setFilterCurrency] = useState('all');
  const [userRole, setUserRole] = useState<'organizer' | 'member'>('member');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadActivityHistory();
  }, [user?.id]);

  const loadActivityHistory = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const allActivities: ActivityRecord[] = [];

      // Determine user role by checking if they have groups they organized
      const { data: orgGroups } = await supabase
        .from('groups')
        .select('id')
        .eq('organizer_id', user.id)
        .limit(1);

      const isOrganizer = orgGroups && orgGroups.length > 0;
      setUserRole(isOrganizer ? 'organizer' : 'member');

      if (isOrganizer) {
        // Load organizer activity - all payments in their groups
        const { data: groups } = await supabase
          .from('groups')
          .select('id, name')
          .eq('organizer_id', user.id)
          .eq('status', 'ACTIVE');

        if (groups && groups.length > 0) {
          const groupIds = groups.map(g => g.id);

          // Get all memberships in organizer's groups
          const { data: memberships } = await supabase
            .from('memberships')
            .select('id, group_id, user_id, status, groups(name)')
            .in('group_id', groupIds)
            .eq('status', 'ACTIVE');

          if (memberships && memberships.length > 0) {
            const membershipIds = memberships.map(m => m.id);

            // Get all payments for those memberships
            const { data: payments } = await supabase
              .from('payments')
              .select(`
                id,
                amount,
                currency,
                payment_date,
                recorded_at,
                status,
                membership_id,
                memberships(
                  id,
                  status,
                  user_id,
                  group_id,
                  users(name)
                )
              `)
              .in('membership_id', membershipIds)
              .order('payment_date', { ascending: false });

            payments?.forEach((p: any) => {
              if (p.memberships?.users?.name) {
                const membership = memberships.find(m => m.id === p.membership_id);
                const groupsData = membership?.groups as any;
                const groupName = Array.isArray(groupsData) 
                  ? groupsData[0]?.name 
                  : groupsData?.name;

                allActivities.push({
                  id: p.id,
                  type: 'payment',
                  amount: p.amount,
                  currency: p.currency,
                  status: p.status || 'completed',
                  memberName: p.memberships.users.name,
                  groupName: groupName || 'Unknown',
                  timestamp: p.recorded_at || p.payment_date,
                  paymentDate: p.payment_date,
                  recordedAt: p.recorded_at,
                  description: `Payment received from ${p.memberships.users.name} in ${groupName || 'Unknown'}`,
                  groupId: p.memberships.group_id,
                  memberId: p.memberships.user_id,
                  details: {
                    membershipId: p.memberships.id,
                    membershipStatus: p.memberships.status,
                  },
                });
              }
            });
          }

          // Get payouts
          const { data: payouts } = await supabase
            .from('payouts')
            .select(`
              id,
              group_id,
              organizer_fee_total_rwf,
              payout_date,
              groups(name),
              payout_items(
                membership_id,
                amount,
                currency,
                organizer_fee,
                memberships(users(name))
              )
            `)
            .in('group_id', groupIds)
            .order('payout_date', { ascending: false });

          payouts?.forEach((p: any) => {
            if (p.payout_items) {
              p.payout_items.forEach((item: any) => {
                allActivities.push({
                  id: `payout-${p.id}-${item.membership_id}`,
                  type: 'payout',
                  amount: item.amount,
                  currency: item.currency,
                  status: 'completed',
                  memberName: item.memberships?.users?.name || 'Unknown',
                  groupName: p.groups?.name || 'Unknown',
                  timestamp: p.payout_date,
                  description: `Payout to ${item.memberships?.users?.name || 'Unknown'} from ${p.groups?.name || 'Unknown'}`,
                  groupId: p.group_id,
                  memberId: item.membership_id,
                  details: {
                    payoutId: p.id,
                    organizerFee: item.organizer_fee,
                  },
                });
              });
            }
          });
        }
      } else {
        // Load member activity - their payments
        const { data: memberships } = await supabase
          .from('memberships')
          .select('id, group_id, groups(name)')
          .eq('user_id', user.id)
          .eq('status', 'ACTIVE');

        if (memberships && memberships.length > 0) {
          const membershipIds = memberships.map(m => m.id);

          const { data: payments } = await supabase
            .from('payments')
            .select(`
              id,
              amount,
              currency,
              payment_date,
              recorded_at,
              status,
              membership_id,
              memberships(
                id,
                group_id
              )
            `)
            .in('membership_id', membershipIds)
            .order('payment_date', { ascending: false });

          payments?.forEach((p: any) => {
            const membership = memberships.find(m => m.id === p.membership_id);
            const groupData = Array.isArray(membership?.groups) ? membership?.groups[0] : membership?.groups;
            const groupName = groupData?.name || 'Unknown';
            
            allActivities.push({
              id: p.id,
              type: 'payment',
              amount: p.amount,
              currency: p.currency,
              status: p.status || 'completed',
              memberName: user.name,
              groupName: groupName,
              timestamp: p.recorded_at || p.payment_date,
              paymentDate: p.payment_date,
              recordedAt: p.recorded_at,
              description: `Payment made to ${groupName}`,
              groupId: membership?.group_id || '',
              memberId: user.id,
              details: {
                membershipId: p.membership_id,
              },
            });
          });
        }
      }

      // Sort by timestamp descending
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(allActivities);
    } catch (err) {
      console.error('Error loading activity history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load activity history');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.amount.toString().includes(searchTerm);
    
    const matchesType = filterType === 'all' || activity.type === filterType;
    const matchesCurrency = filterCurrency === 'all' || activity.currency === filterCurrency;

    return matchesSearch && matchesType && matchesCurrency;
  });

  // Get unique currencies for filter
  const currencies = Array.from(new Set(activities.map(a => a.currency))).sort();

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link to={userRole === 'organizer' ? '/organizer' : '/member'}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold dark:text-white">Activity History</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {userRole === 'organizer' 
                  ? 'All payments and payouts across your groups' 
                  : 'Your payment history across all groups'}
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by member, group, or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md text-sm dark:bg-slate-800 dark:text-white"
              >
                <option value="all">All Activity Types</option>
                <option value="payment">Payments</option>
                <option value="payout">Payouts</option>
              </select>

              <select
                value={filterCurrency}
                onChange={(e) => setFilterCurrency(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md text-sm dark:bg-slate-800 dark:text-white"
              >
                <option value="all">All Currencies</option>
                {currencies.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>

              <div className="ml-auto text-sm text-gray-600 dark:text-gray-400 py-2">
                {filteredActivities.length} of {activities.length} records
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 mb-6">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="text-red-700 dark:text-red-400">{error}</span>
            </CardContent>
          </Card>
        )}

        {filteredActivities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No Activity Found"
            description="No transactions match your search criteria"
          />
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <Card
                key={activity.id}
                className="dark:bg-slate-900 hover:shadow-md transition-shadow cursor-pointer border-l-4"
                style={{
                  borderLeftColor: activity.type === 'payment' ? '#10b981' : '#3b82f6'
                }}
              >
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {activity.type === 'payment' ? '📥 Payment Received' : '💰 Payout Sent'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                              Member
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.memberName}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                              Group
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.groupName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase">
                            Amount
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                          {activity.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                          {activity.currency}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                              Date
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {format(new Date(activity.timestamp), 'MMM d, yyyy')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {format(new Date(activity.timestamp), 'HH:mm:ss')}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="h-4 w-4 text-gray-500" />
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                              Status
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                            <p className="text-sm capitalize text-gray-900 dark:text-white">
                              {activity.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Details Section */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                    <details className="group">
                      <summary className="cursor-pointer flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                        <span className="group-open:rotate-180 transition-transform">▼</span>
                        Technical Details
                      </summary>

                      <div className="mt-4 space-y-3 bg-gray-100 dark:bg-slate-800 p-4 rounded-lg">
                        <div>
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                            Record ID
                          </p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-white dark:bg-slate-700 p-2 rounded flex-1 overflow-auto text-gray-900 dark:text-gray-300">
                              {activity.id}
                            </code>
                            <button
                              onClick={() => copyToClipboard(activity.id, activity.id)}
                              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition"
                              title="Copy ID"
                            >
                              <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </button>
                          </div>
                          {copiedId === activity.id && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Copied!</p>
                          )}
                        </div>

                        {activity.details.membershipId && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                              Membership ID
                            </p>
                            <code className="text-xs bg-white dark:bg-slate-700 p-2 rounded block text-gray-900 dark:text-gray-300">
                              {activity.details.membershipId}
                            </code>
                          </div>
                        )}

                        {activity.details.membershipStatus && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                              Membership Status
                            </p>
                            <code className="text-xs bg-white dark:bg-slate-700 p-2 rounded block text-gray-900 dark:text-gray-300">
                              {activity.details.membershipStatus}
                            </code>
                          </div>
                        )}

                        {activity.paymentDate && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                              Payment Date (Database)
                            </p>
                            <code className="text-xs bg-white dark:bg-slate-700 p-2 rounded block text-gray-900 dark:text-gray-300">
                              {activity.paymentDate}
                            </code>
                          </div>
                        )}

                        {activity.recordedAt && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                              Recorded At (Database)
                            </p>
                            <code className="text-xs bg-white dark:bg-slate-700 p-2 rounded block text-gray-900 dark:text-gray-300">
                              {activity.recordedAt}
                            </code>
                          </div>
                        )}

                        {activity.details.organizerFee && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                              Organizer Fee
                            </p>
                            <code className="text-xs bg-white dark:bg-slate-700 p-2 rounded block text-gray-900 dark:text-gray-300">
                              {activity.details.organizerFee}
                            </code>
                          </div>
                        )}

                        {activity.type === 'payment' && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            <p className="mb-2">🔍 Use this Record ID to:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Identify duplicates (same ID = same transaction)</li>
                              <li>Check database integrity</li>
                              <li>Reference in support tickets</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityHistoryPage;
