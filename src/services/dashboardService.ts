import { supabase } from '@/api/supabase';

export interface OrganizerDashboardData {
  groups: any[];
  totalMembers: number;
  totalManaged: Record<string, number>;
  totalEarnings: Record<string, number>;
  recentPayments: any[];
  topPerformers: any[];
  alerts: any[];
}

export interface MemberDashboardData {
  memberships: any[];
  payments: any[];
  goals: any[];
  totalSaved: Record<string, number>;
  daysPaid: number;
  streakDays: number;
  healthScore: number;
}

export const dashboardService = {
  /**
   * Get complete organizer dashboard data
   */
  getOrganizerDashboard: async (organizerId: string): Promise<OrganizerDashboardData | null> => {
    try {
      // 1. Get all organizer's active groups
      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('id, name, status, current_cycle_start_date, cycle_days, organizer_id, join_code, current_cycle')
        .eq('organizer_id', organizerId)
        .eq('status', 'ACTIVE');

      if (groupsError || !groups) throw groupsError;
      if (groups.length === 0) {
        return {
          groups: [],
          totalMembers: 0,
          totalManaged: {},
          totalEarnings: {},
          recentPayments: [],
          topPerformers: [],
          alerts: []
        };
      }

      const groupIds = groups.map(g => g.id);

      // 2. Get member count and details
      const { data: memberships, error: membershipsError } = await supabase
        .from('memberships')
        .select(`
          id, 
          group_id, 
          user_id, 
          status,
          users:user_id (id, name)
        `)
        .in('group_id', groupIds)
        .eq('status', 'ACTIVE');

      if (membershipsError) throw membershipsError;

      // 3. Get earnings this month (organizer fees from actual payout records)
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data: payouts, error: payoutsError } = await supabase
        .from('payouts')
        .select(`
          id, 
          group_id, 
          organizer_fee_total_rwf, 
          payout_date,
          payout_items(organizer_fee, currency)
        `)
        .in('group_id', groupIds)
        .gte('payout_date', monthStart.toISOString());

      if (payoutsError) throw payoutsError;
      
      console.log('Fetched payouts:', payouts);

      // 4. Get all payments for total calculation
      const { data: allPaymentsForTotal, error: allPaymentsError } = await supabase
        .from('payments')
        .select('id, amount, currency')
        .in('group_id', groupIds);

      if (allPaymentsError) throw allPaymentsError;

      // 4b. Get recent payments for display
      const { data: recentPayments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          id, amount, currency, payment_date,
          memberships(user_id, users(name))
        `)
        .in('group_id', groupIds)
        .order('payment_date', { ascending: false })
        .limit(10);

      if (paymentsError) throw paymentsError;

      // 5. Get top performers
      const { data: allPayments, error: topError } = await supabase
        .from('payments')
        .select('id, amount, currency, payment_date, memberships(user_id, users(id, name))')
        .in('group_id', groupIds)
        .gte('payment_date', monthStart.toISOString());

      if (topError) throw topError;

      // Calculate top performers from payments
      const performerMap: Record<string, { user: any; count: number; total: number }> = {};
      allPayments?.forEach((payment: any) => {
        const userId = payment.memberships?.user_id;
        const userName = payment.memberships?.users?.name;
        if (userId) {
          if (!performerMap[userId]) {
            performerMap[userId] = { user: { id: userId, name: userName }, count: 0, total: 0 };
          }
          performerMap[userId].count += 1;
          performerMap[userId].total += payment.amount || 0;
        }
      });

      const topPerformers = Object.values(performerMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
        .map(p => ({ users: p.user, payment_count: p.count, total: p.total }));

      // 6. Calculate totals (including earnings by currency from payout items)
      const totalMembers = memberships?.length || 0;
      const totalManaged: Record<string, number> = {};
      const totalEarnings: Record<string, number> = {};

      allPaymentsForTotal?.forEach(p => {
        if (!totalManaged[p.currency]) totalManaged[p.currency] = 0;
        totalManaged[p.currency] += p.amount;
      });

      // Calculate earnings from actual payout_items (supports all currencies)
      payouts?.forEach(p => {
        const payoutItems = (p.payout_items as any[]) || [];
        payoutItems.forEach(item => {
          if (!totalEarnings[item.currency]) totalEarnings[item.currency] = 0;
          totalEarnings[item.currency] += item.organizer_fee || 0;
        });
      });
      
      console.log('Total earnings calculated:', totalEarnings);

      // 7. Get payments with group_id to calculate per-group totals
      const { data: allPaymentsWithGroup, error: allPaymentsGroupError } = await supabase
        .from('payments')
        .select('id, amount, currency, group_id')
        .in('group_id', groupIds);

      if (allPaymentsGroupError) throw allPaymentsGroupError;

      // 8. Enhance groups with member counts and totals per group
      const enhancedGroups = groups.map((group: any) => {
        const groupMembers = memberships?.filter(m => m.group_id === group.id) || [];
        const groupPayments = allPaymentsWithGroup?.filter(p => p.group_id === group.id) || [];
        
        const groupTotals: Record<string, number> = {};
        groupPayments.forEach(p => {
          if (!groupTotals[p.currency]) groupTotals[p.currency] = 0;
          groupTotals[p.currency] += p.amount;
        });

        return {
          ...group,
          memberships: groupMembers,
          totalManaged: groupTotals
        };
      });

      return {
        groups: enhancedGroups,
        totalMembers,
        totalManaged,
        totalEarnings,
        recentPayments: recentPayments || [],
        topPerformers: topPerformers || [],
        alerts: []
      };
    } catch (error) {
      console.error('Error loading organizer dashboard:', error);
      throw error;
    }
  },

  /**
   * Get complete member dashboard data
   */
  getMemberDashboard: async (userId: string): Promise<MemberDashboardData | null> => {
    try {
      // 1. Get member's active memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from('memberships')
        .select(`
          id, 
          group_id, 
          user_id, 
          status,
          joined_at,
          groups(id, name, organizer_id, current_cycle_start_date, cycle_days)
        `)
        .eq('user_id', userId)
        .eq('status', 'ACTIVE');

      if (membershipsError) throw membershipsError;
      if (!memberships || memberships.length === 0) {
        return {
          memberships: [],
          payments: [],
          goals: [],
          totalSaved: {},
          daysPaid: 0,
          streakDays: 0,
          healthScore: 0
        };
      }

      const membershipIds = memberships.map(m => m.id);

      // 2. Get this month's payments
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('id, amount, currency, payment_date, membership_id')
        .in('membership_id', membershipIds)
        .gte('payment_date', monthStart.toISOString())
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      // 3. Get member's active goals
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('id, name, target_amount, current_progress, target_date, target_currency, status')
        .eq('user_id', userId)
        .eq('status', 'ACTIVE');

      if (goalsError) throw goalsError;

      // 4. Calculate totals
      const totalSaved: Record<string, number> = {};
      payments?.forEach(p => {
        if (!totalSaved[p.currency]) totalSaved[p.currency] = 0;
        totalSaved[p.currency] += p.amount;
      });

      // 5. Calculate days paid this month
      const uniqueDays = new Set(
        payments?.map(p => new Date(p.payment_date).toDateString()) || []
      );
      const daysPaid = uniqueDays.size;

      // 6. Calculate streak (consecutive days)
      const streakDays = calculateStreak(payments || []);

      // 7. Calculate health score
      const healthScore = calculateHealthScore(daysPaid, totalSaved, goals || []);

      return {
        memberships,
        payments: payments || [],
        goals: goals || [],
        totalSaved,
        daysPaid,
        streakDays,
        healthScore
      };
    } catch (error) {
      console.error('Error loading member dashboard:', error);
      throw error;
    }
  },

  /**
   * Get group details with member stats
   */
  getGroupDashboard: async (groupId: string) => {
    try {
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      const { data: memberships, error: membershipsError } = await supabase
        .from('memberships')
        .select('id, user_id, status')
        .eq('group_id', groupId)
        .eq('status', 'ACTIVE');

      if (membershipsError) throw membershipsError;

      return { group, memberships };
    } catch (error) {
      console.error('Error loading group dashboard:', error);
      throw error;
    }
  },

  /**
   * Get recent activities for organizer dashboard
   */
  getOrganizerRecentActivities: async (organizerId: string, limit: number = 10) => {
    try {
      // Get organizer's groups
      const { data: groups } = await supabase
        .from('groups')
        .select('id')
        .eq('organizer_id', organizerId);

      if (!groups || groups.length === 0) return [];

      const groupIds = groups.map(g => g.id);

      // Get recent payments from all groups
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          id, amount, currency, payment_date,
          memberships(user_id, users(name))
        `)
        .in('group_id', groupIds)
        .order('payment_date', { ascending: false })
        .limit(limit);

      if (paymentsError) throw paymentsError;

      return (payments || []).map(p => ({
        id: p.id,
        type: 'payment' as const,
        title: `${(p.memberships as any)?.users?.name || 'Member'} saved`,
        description: `${p.amount.toLocaleString()} ${p.currency}`,
        timestamp: p.payment_date,
        icon: '💳'
      }));
    } catch (error) {
      console.error('Error loading organizer activities:', error);
      return [];
    }
  },

  /**
   * Get recent activities for member dashboard
   */
  getMemberRecentActivities: async (userId: string, limit: number = 10) => {
    try {
      // Get member's memberships
      const { data: memberships } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'ACTIVE');

      if (!memberships || memberships.length === 0) return [];

      const membershipIds = memberships.map(m => m.id);

      // Get recent payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('id, amount, currency, payment_date')
        .in('membership_id', membershipIds)
        .order('payment_date', { ascending: false })
        .limit(limit);

      if (paymentsError) throw paymentsError;

      return (payments || []).map(p => ({
        id: p.id,
        type: 'payment' as const,
        title: 'Payment made',
        description: `${p.amount.toLocaleString()} ${p.currency}`,
        timestamp: p.payment_date,
        icon: '✅'
      }));
    } catch (error) {
      console.error('Error loading member activities:', error);
      return [];
    }
  }
};

/**
 * Calculate streak (consecutive days with payments)
 */
function calculateStreak(payments: any[]): number {
  if (payments.length === 0) return 0;

  const dates = payments
    .map(p => new Date(p.payment_date).getTime())
    .sort((a, b) => b - a); // Most recent first

  let streak = 1;
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = 0; i < dates.length - 1; i++) {
    const diff = dates[i] - dates[i + 1];
    if (diff <= dayMs && diff > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate health score (0-100)
 */
function calculateHealthScore(
  daysPaid: number,
  totalSaved: Record<string, number>,
  goals: any[]
): number {
  let score = 0;

  // Payment consistency (40 points)
  const paymentScore = Math.min(daysPaid * 1.33, 40); // Max 30 days = 40 points
  score += paymentScore;

  // Total savings (30 points)
  const totalAmount = Object.values(totalSaved).reduce((sum, val) => sum + val, 0);
  const savingsScore = Math.min((totalAmount / 100000) * 30, 30);
  score += savingsScore;

  // Goal progress (20 points)
  if (goals.length > 0) {
    const avgProgress = goals.reduce((sum, goal) => {
      const progress = (goal.current_amount / goal.target_amount) * 100;
      return sum + Math.min(progress, 100);
    }, 0) / goals.length;
    score += (avgProgress / 100) * 20;
  } else {
    score += 20;
  }

  // Streak bonus (10 points)
  const streakScore = Math.min((daysPaid / 30) * 10, 10);
  score += streakScore;

  return Math.round(score);
}
