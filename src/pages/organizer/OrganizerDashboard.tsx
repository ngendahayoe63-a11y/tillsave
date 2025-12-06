import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GroupCard } from '@/components/groups/GroupCard';
import { DashboardSkeleton } from '@/components/shared/DashboardSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus, Users, Wallet, TrendingUp, AlertCircle, Clock, Search, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useState } from 'react';
import { useOrganizerDashboard } from '@/hooks/useDashboard';

export const OrganizerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { data: dashboardData, isLoading, error } = useOrganizerDashboard(user?.id);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper to render currencies
  const renderCurrencyLine = (data: Record<string, number> | undefined) => {
    if (!data || Object.keys(data).length === 0) return "0";
    return Object.entries(data).map(([curr, val]) => (
      <div key={curr} className="flex items-baseline gap-1">
        <span className="text-lg font-bold">{val.toLocaleString()}</span>
        <span className="text-xs font-medium opacity-70">{curr}</span>
      </div>
    ));
  };

  const filteredGroups = (dashboardData?.groups || []).filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isLoading) return <DashboardSkeleton />;
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState 
          icon={AlertCircle}
          title="Error Loading Dashboard"
          description={error instanceof Error ? error.message : "Failed to load dashboard data"}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      
      {/* HEADER & SEARCH (Mobile/Desktop Adaptive) */}
      <div className="p-4 max-w-7xl mx-auto space-y-6">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-2">👋 Welcome back, {user?.name.split(' ')[0]}!</h1>
            <p className="text-blue-100 text-sm max-w-xl">
              It's {format(new Date(), 'MMMM do, yyyy')}. You are managing <strong>{dashboardData?.groups?.length || 0} groups</strong> with <strong>{dashboardData?.totalMembers || 0} members</strong>. 
              <span className="hidden sm:inline"> Everything looks stable today.</span>
            </p>
          </div>
        </div>

        {/* STATS GRID (1 col mobile, 2 col tablet, 4 col desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Members</p>
                  <h3 className="text-2xl font-bold mt-1 dark:text-white">{dashboardData?.totalMembers || 0}</h3>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" /> Active
                  </p>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Managed</p>
                  <div className="mt-1 space-y-1 dark:text-white">
                    {renderCurrencyLine(dashboardData?.totalManaged)}
                  </div>
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Your Earnings</p>
                  <div className="mt-1 space-y-1 dark:text-white">
                    {renderCurrencyLine(dashboardData?.totalEarnings)}
                  </div>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Active Cycles</p>
                  <h3 className="text-2xl font-bold mt-1 dark:text-white">{dashboardData?.groups?.length || 0}</h3>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">In progress</p>
                </div>
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MAIN LAYOUT: Left Content (Groups) vs Right Sidebar (Actions/Alerts) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.my_groups')}</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search groups..." 
                  className="pl-9 bg-white dark:bg-slate-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Groups Grid */}
            {filteredGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGroups.map(group => (
                  <GroupCard key={group.id} group={group} role="ORGANIZER" />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={Users}
                title="No Groups Found"
                description="Create your first savings group to get started."
                actionLabel="Create Group"
                onAction={() => window.location.href = '/organizer/create-group'}
              />
            )}
          </div>

          {/* RIGHT COLUMN (1/3 width on desktop) - Sticky on Desktop */}
          <div className="space-y-6 lg:sticky lg:top-24 h-fit">
            
            {/* Quick Actions */}
            <Card className="dark:bg-slate-900 border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/organizer/create-group">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="mr-2 h-4 w-4 text-primary" /> {t('dashboard.new_group')}
                  </Button>
                </Link>
                <Link to="/organizer/global-report">
                  <Button className="w-full justify-start" variant="outline">
                    <Activity className="mr-2 h-4 w-4 text-green-600" /> View Global Report
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            {dashboardData?.recentPayments && dashboardData.recentPayments.length > 0 && (
              <Card className="dark:bg-slate-900 border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dashboardData.recentPayments.slice(0, 5).map((payment: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                          {payment.memberships?.users?.name || 'Member'} saved
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600 dark:text-green-400 whitespace-nowrap ml-2">
                          {payment.amount.toLocaleString()} {payment.currency}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};