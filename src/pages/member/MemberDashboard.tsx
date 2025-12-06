import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MemberGroupCard } from '@/components/groups/MemberGroupCard';
import { DashboardSkeleton } from '@/components/shared/DashboardSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus, PiggyBank, Target, TrendingUp, AlertCircle, Activity, DollarSign } from 'lucide-react';
import { format, differenceInCalendarDays } from 'date-fns';
import { useMemberDashboard } from '@/hooks/useDashboard';
import { useState } from 'react';

export const MemberDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: dashboardData, isLoading, error } = useMemberDashboard(user?.id);
  const [showAllActivities, setShowAllActivities] = useState(false);

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

  // Transform membership data to format expected by MemberGroupCard
  const transformMembershipData = (membership: any, payments: any[]) => {
    const group = membership.groups;
    if (!group) return null;

    const now = new Date();
    const cycleStartDate = new Date(group.current_cycle_start_date);
    const cycleEndDate = new Date(cycleStartDate);
    cycleEndDate.setDate(cycleEndDate.getDate() + group.cycle_days);
    
    const daysRemaining = Math.max(0, differenceInCalendarDays(cycleEndDate, now));
    const totalCycleDays = group.cycle_days;
    const daysPassed = totalCycleDays - daysRemaining;
    const progressPercent = Math.min(100, (daysPassed / totalCycleDays) * 100);

    // Filter payments for this membership and group by currency
    const membershipPayments = payments.filter(p => p.membership_id === membership.id);
    const financialsByCurrency: Record<string, any> = {};

    membershipPayments.forEach(payment => {
      if (!financialsByCurrency[payment.currency]) {
        financialsByCurrency[payment.currency] = {
          currency: payment.currency,
          saved: 0,
          fee: 0,
          net: 0
        };
      }
      financialsByCurrency[payment.currency].saved += payment.amount;
    });

    // For now, assume no fees until cycle ends (simplified, can be enhanced later)
    Object.values(financialsByCurrency).forEach((fin: any) => {
      fin.fee = 0; // Fee calculated at cycle end by organizer
      fin.net = fin.saved - fin.fee;
    });

    const financials = Object.values(financialsByCurrency);

    return {
      id: membership.id,
      group: {
        id: group.id,
        name: group.name
      },
      cycle: {
        current: group.current_cycle,
        progressPercent,
        daysRemaining
      },
      financials: financials.length > 0 ? financials : []
    };
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
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Summary</h3>
            
            <Card className="border-l-4 border-l-green-500 dark:bg-slate-900 border-t-0 border-r-0 border-b-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">Total Contributions</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTotalSaved()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 dark:bg-slate-900 border-t-0 border-r-0 border-b-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <PiggyBank className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">Active Goals</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{dashboardData?.goals?.length || 0} goals tracking</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FEES & EXPECTED PAYMENT SECTION */}
        {(dashboardData?.previousCycleFees && Object.keys(dashboardData.previousCycleFees).length > 0) || (dashboardData?.expectedPayments && Object.keys(dashboardData.expectedPayments).length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Previous Cycle Fees */}
            {dashboardData?.previousCycleFees && Object.keys(dashboardData.previousCycleFees).length > 0 && (
              <Card className="dark:bg-slate-900 shadow-sm ring-1 ring-orange-200 dark:ring-orange-900/30 border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-orange-500" /> Previous Cycle Fees
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(dashboardData.previousCycleFees).map(([currency, fee]) => (
                    <div key={currency} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{currency}</span>
                      <span className="font-bold text-red-600 dark:text-red-400">-{(fee as number).toLocaleString()}</span>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    Fees charged from your previous cycle payout
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Expected Total Payment */}
            {dashboardData?.expectedPayments && Object.keys(dashboardData.expectedPayments).length > 0 && (
              <Card className="dark:bg-slate-900 shadow-sm ring-1 ring-blue-200 dark:ring-blue-900/30 border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" /> Expected This Cycle
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(dashboardData.expectedPayments).map(([currency, amount]) => (
                    <div key={currency} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{currency}</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{(amount as number).toLocaleString()}</span>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    Based on your daily savings rate and days in this cycle
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}

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
                      <p className="text-xs text-gray-500 dark:text-gray-400">{dashboardData?.goals?.[0]?.target_date ? `By ${new Date(dashboardData.goals[0].target_date).toLocaleDateString()}` : 'No deadline'}</p>
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {dashboardData.goals[0].current_progress.toLocaleString()} / {dashboardData.goals[0].target_amount.toLocaleString()} {dashboardData.goals[0].target_currency}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Activities */}
            {dashboardData?.payments && dashboardData.payments.length > 0 && (
              <Card className="dark:bg-slate-900 shadow-sm border-b-4 border-b-green-400">
                <CardHeader className="pb-3 flex justify-between items-center">
                  <CardTitle className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(showAllActivities ? [...dashboardData.payments].reverse() : [...dashboardData.payments].reverse().slice(0, 3)).map((payment: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Payment made ✅
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {payment.recorded_at ? format(new Date(payment.recorded_at), 'MMM d, yyyy HH:mm') : format(new Date(payment.payment_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600 dark:text-green-400 whitespace-nowrap ml-2">
                          {payment.amount.toLocaleString()} {payment.currency}
                        </p>
                      </div>
                    </div>
                  ))}
                  {!showAllActivities && dashboardData.payments.length > 3 && (
                    <Button 
                      variant="ghost" 
                      className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2"
                      onClick={() => setShowAllActivities(true)}
                    >
                      View All Activities ({dashboardData.payments.length})
                    </Button>
                  )}
                  {showAllActivities && dashboardData.payments.length > 3 && (
                    <Button 
                      variant="ghost" 
                      className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mt-2"
                      onClick={() => setShowAllActivities(false)}
                    >
                      Show Less
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
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
                {dashboardData.memberships.map((membership: any) => {
                  const transformedData = transformMembershipData(membership, dashboardData.payments);
                  if (!transformedData) return null; // Skip if transformation fails
                  return (
                    <MemberGroupCard key={membership.id} data={transformedData} />
                  );
                })}
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