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
        .select('id, name, status, current_cycle_start_date, cycle_days, organizer_id')
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

      // 3. Get earnings this month
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data: payouts, error: payoutsError } = await supabase
        .from('payouts')
        .select('id, group_id, organizer_fee_total_rwf, payout_date')
        .in('group_id', groupIds)
        .gte('payout_date', monthStart.toISOString());

      if (payoutsError) throw payoutsError;

      // 4. Get recent payments
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
      const { data: topPerformers, error: topError } = await supabase
        .from('payments')
        .select('memberships(users(id, name)), COUNT(*) as payment_count, SUM(amount) as total')
        .in('group_id', groupIds)
        .gte('payment_date', monthStart.toISOString())
        .order('total', { ascending: false })
        .limit(5);

      if (topError) throw topError;

      // 6. Calculate totals
      const totalMembers = memberships?.length || 0;
      const totalManaged: Record<string, number> = {};
      const totalEarnings: Record<string, number> = {};

      recentPayments?.forEach(p => {
        if (!totalManaged[p.currency]) totalManaged[p.currency] = 0;
        totalManaged[p.currency] += p.amount;
      });

      payouts?.forEach(p => {
        if (!totalEarnings['RWF']) totalEarnings['RWF'] = 0;
        totalEarnings['RWF'] += p.organizer_fee_total_rwf || 0;
      });

      return {
        groups,
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
        .select('id, name, target_amount, current_progress, target_date, currency, status')
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
