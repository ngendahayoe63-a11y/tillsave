import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardSkeleton } from '@/components/shared/DashboardSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ArrowLeft, BarChart3, Users, TrendingUp, Wallet, PiggyBank, AlertCircle, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useOrganizerDashboard } from '@/hooks/useDashboard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const GlobalReportPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: dashboardData, isLoading, error } = useOrganizerDashboard(user?.id);

  if (isLoading) return <DashboardSkeleton />;
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState 
          icon={AlertCircle}
          title="Error Loading Report"
          description={error instanceof Error ? error.message : "Failed to load report data"}
        />
      </div>
    );
  }

  // Format currency data for display (helper for future use)
  // const renderCurrencyList = (data: Record<string, number> | undefined) => {
  //   if (!data || Object.keys(data).length === 0) return <p className="text-sm opacity-70">0</p>;
  //   return Object.entries(data).map(([curr, val]) => (
  //     <div key={curr} className="flex justify-between items-baseline">
  //       <span className="text-xs opacity-70">{curr}</span>
  //       <span className="font-bold">{(val as number).toLocaleString()}</span>
  //     </div>
  //   ));
  // };

  // Sample chart data (would come from aggregated payments in real implementation)
  const paymentTrendData = [
    { date: 'Mon', payments: 24, members: 12 },
    { date: 'Tue', payments: 13, members: 15 },
    { date: 'Wed', payments: 31, members: 18 },
    { date: 'Thu', payments: 18, members: 14 },
    { date: 'Fri', payments: 28, members: 22 },
    { date: 'Sat', payments: 35, members: 25 },
    { date: 'Sun', payments: 22, members: 19 },
  ];

  const groupPerformanceData = (dashboardData?.groups || []).map((g: any) => ({
    name: g.name,
    members: g.memberships?.length || 0,
    savings: (Object.values(g.totalManaged || {})[0] as number) || 0,
  })).slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/organizer')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold dark:text-white">Global Report</h1>
            <p className="text-sm text-gray-500">All-time view • {format(new Date(), 'MMMM yyyy')}</p>
          </div>
          <Button size="sm" variant="outline" className="ml-auto gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 max-w-7xl mx-auto space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Groups */}
          <Card className="border-l-4 border-l-blue-500 dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Total Groups</p>
                  <h3 className="text-2xl font-bold mt-1 dark:text-white">{dashboardData?.groups?.length || 0}</h3>
                  <p className="text-xs text-blue-600 mt-1">Active groups</p>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Members */}
          <Card className="border-l-4 border-l-purple-500 dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Total Members</p>
                  <h3 className="text-2xl font-bold mt-1 dark:text-white">{dashboardData?.totalMembers || 0}</h3>
                  <p className="text-xs text-purple-600 mt-1">Across all groups</p>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Managed */}
          <Card className="border-l-4 border-l-green-500 dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Total Managed</p>
                  <div className="mt-1 space-y-1 max-w-xs text-sm">
                    {dashboardData?.totalManaged ? (
                      Object.entries(dashboardData.totalManaged).map(([curr, val]) => (
                        <div key={curr} className="flex justify-between">
                          <span className="opacity-70">{curr}:</span>
                          <span className="font-bold">{(val as number).toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs opacity-70">0</span>
                    )}
                  </div>
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <PiggyBank className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Earnings */}
          <Card className="border-l-4 border-l-orange-500 dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Your Earnings</p>
                  <div className="mt-1 space-y-1 max-w-xs text-sm">
                    {dashboardData?.totalEarnings ? (
                      Object.entries(dashboardData.totalEarnings).map(([curr, val]) => (
                        <div key={curr} className="flex justify-between">
                          <span className="opacity-70">{curr}:</span>
                          <span className="font-bold">{(val as number).toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs opacity-70">0</span>
                    )}
                  </div>
                </div>
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Wallet className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Payment Trend Chart */}
          <Card className="dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Payment Trend (This Week)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={paymentTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="payments" stroke="#3b82f6" name="Payments" />
                  <Line type="monotone" dataKey="members" stroke="#10b981" name="Active Members" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Group Performance Chart */}
          {groupPerformanceData.length > 0 && (
            <Card className="dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Top Groups by Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={groupPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="members" fill="#3b82f6" name="Members" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detailed Table */}
        <Card className="dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base">Groups Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b dark:border-gray-700">
                  <tr>
                    <th className="text-left py-2 px-2 font-semibold text-gray-600 dark:text-gray-400">Group Name</th>
                    <th className="text-center py-2 px-2 font-semibold text-gray-600 dark:text-gray-400">Members</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-600 dark:text-gray-400">Total Managed</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-600 dark:text-gray-400">Cycle Days</th>
                    <th className="text-center py-2 px-2 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {(dashboardData?.groups || []).map((group: any) => (
                    <tr key={group.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer" onClick={() => navigate(`/organizer/group/${group.id}`)}>
                      <td className="py-3 px-2 font-medium dark:text-gray-200">{group.name}</td>
                      <td className="text-center py-3 px-2 dark:text-gray-300">{group.memberships?.length || 0}</td>
                      <td className="text-right py-3 px-2 dark:text-gray-300">
                        {group.totalManaged ? (
                          <div className="text-xs space-y-1">
                            {Object.entries(group.totalManaged).map(([curr, val]) => (
                              <div key={curr}>{(val as number).toLocaleString()} {curr}</div>
                            ))}
                          </div>
                        ) : (
                          '0'
                        )}
                      </td>
                      <td className="text-right py-3 px-2 dark:text-gray-300">{group.cycle_days || '-'}</td>
                      <td className="text-center py-3 px-2">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                          group.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {group.status || 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(dashboardData?.recentPayments || []).slice(0, 5).map((payment: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0 dark:border-gray-700">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium dark:text-white truncate">{payment.member_name || 'Member'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Paid to {payment.group_name || 'group'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold dark:text-white">{payment.amount?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{payment.currency || 'RWF'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
