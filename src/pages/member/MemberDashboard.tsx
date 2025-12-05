import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { MemberGroupCard } from '@/components/groups/MemberGroupCard';
import { DashboardSkeleton } from '@/components/shared/DashboardSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus, PiggyBank, Target, TrendingUp, AlertTriangle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useMemberDashboard } from '@/hooks/useDashboard';

export const MemberDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: dashboardData, isLoading, error } = useMemberDashboard(user?.id);

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

  // Format total saved by currency
  const formatTotalSaved = () => {
    if (!dashboardData?.totalSaved) return "0 RWF";
    const entries = Object.entries(dashboardData.totalSaved);
    if (entries.length === 0) return "0 RWF";
    return entries.map(([curr, val]) => `${(val as number).toLocaleString()} ${curr}`).join(' + ');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      
      <div className="p-4 max-w-7xl mx-auto space-y-6">
        
        {/* WELCOME & HEALTH SCORE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Greeting & Health Score (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h1 className="text-2xl font-bold mb-1 dark:text-white">👋 Hi, {user?.name.split(' ')[0]}!</h1>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Your savings habits are improving. Keep it up! 🌱</p>
              
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                {/* Health Score Visual */}
                <div className="relative">
                  <svg className="w-24 h-24 transform -rotate-90">
                    {/* Background Circle */}
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200 dark:text-slate-700" />
                    {/* Progress Circle */}
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - (dashboardData?.healthScore || 0)/100)} className="text-green-500" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xl font-bold dark:text-white">{dashboardData?.healthScore || 0}</span>
                    <span className="text-[10px] text-gray-500">SCORE</span>
                  </div>
                </div>
                
                {/* Score Details */}
                <div className="flex-1 w-full grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                    <p className="text-green-600 font-bold flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" /> Excellent
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Streak</p>
                    <p className="text-gray-900 dark:text-white font-bold">{dashboardData?.streakDays || 0} Days 🔥</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Total Saved</p>
                    <p className="text-gray-900 dark:text-white font-bold">{formatTotalSaved()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Days Paid</p>
                    <p className="text-blue-600 font-bold">{dashboardData?.daysPaid || 0} days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Smart Alerts (1/3 width) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Smart Alerts (2)</h3>
            
            <Card className="border-l-4 border-l-yellow-500 dark:bg-slate-900 border-t-0 border-r-0 border-b-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">Goal at Risk</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">You are 5,000 RWF behind schedule for School Fees.</p>
                    <Button variant="link" className="h-auto p-0 text-xs mt-2 text-yellow-600">See how to catch up →</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 dark:bg-slate-900 border-t-0 border-r-0 border-b-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">Streak Alert!</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pay today to keep your 15-day streak alive.</p>
                    <Button size="sm" className="h-7 text-xs mt-2 w-full">Pay Now</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* MAIN CONTENT: Active Goals & Groups */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Goals (Left 1/3) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold dark:text-white">Active Goals</h2>
              <Button variant="ghost" size="sm" className="h-8"><Plus className="w-4 h-4" /></Button>
            </div>
            
            <Card className="dark:bg-slate-900 border-none shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-bold text-sm dark:text-white">{dashboardData?.goals?.[0]?.name || 'No Goals'}</p>
                      <p className="text-xs text-gray-500">{dashboardData?.goals?.[0]?.target_date ? `By ${new Date(dashboardData.goals[0].target_date).toLocaleDateString()}` : 'No deadline'}</p>
                    </div>
                  </div>
                  {dashboardData?.goals?.[0] && (
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/50 px-2 py-1 rounded">
                      {Math.round((dashboardData.goals[0].current_progress / dashboardData.goals[0].target_amount) * 100)}%
                    </span>
                  )}
                </div>
                {dashboardData?.goals?.[0] && (
                  <>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden mb-2">
                      <div 
                        className="bg-purple-500 h-full" 
                        style={{ width: `${Math.min((dashboardData.goals[0].current_progress / dashboardData.goals[0].target_amount) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {dashboardData.goals[0].current_progress.toLocaleString()} / {dashboardData.goals[0].target_amount.toLocaleString()} {dashboardData.goals[0].currency}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* My Groups (Right 2/3) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold dark:text-white">{t('dashboard.my_groups')}</h2>
              {dashboardData?.memberships && dashboardData.memberships.length > 0 && (
                <Link to="/member/join-group">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" /> {t('dashboard.join_group')}
                  </Button>
                </Link>
              )}
            </div>

            {dashboardData?.memberships && dashboardData.memberships.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.memberships.map((membership: any) => (
                  <MemberGroupCard key={membership.id} data={membership} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={PiggyBank}
                title="Start Saving Together"
                description="You are not part of any group yet. Enter a code from your organizer to join."
                actionLabel={t('dashboard.join_first')}
                onAction={() => navigate('/member/join-group')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};