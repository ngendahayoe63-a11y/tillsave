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
  memberRates?: Record<string, Record<string, number>>;
  expectedPayments?: Record<string, number>;
  previousCycleFees?: Record<string, number>;
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

      // 4. Get all payments for total calculation - ONLY current cycle (not archived)
      const { data: allPaymentsForTotal, error: allPaymentsError } = await supabase
        .from('payments')
        .select('id, amount, currency, group_id')
        .in('group_id', groupIds)
        .eq('archived', false);

      if (allPaymentsError) throw allPaymentsError;

      // 4b. Get recent payments for display - ONLY current cycle
      const { data: recentPayments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          id, amount, currency, payment_date,
          memberships(user_id, users(name))
        `)
        .in('group_id', groupIds)
        .eq('archived', false)
        .order('payment_date', { ascending: false }) // Newest payments first (reverse chronological)
        .limit(10);

      if (paymentsError) throw paymentsError;

      // 5. Get top performers - ONLY current cycle
      const { data: allPayments, error: topError } = await supabase
        .from('payments')
        .select('id, amount, currency, payment_date, memberships(user_id, users(id, name))')
        .in('group_id', groupIds)
        .eq('archived', false)
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

      // Calculate ESTIMATED earnings from CURRENT CYCLE (not from completed payouts)
      // Earnings = organizer fee per member per group
      // For each group, count active members and calculate their daily contribution as fee
      if (groups.length > 0) {
        groups.forEach((group: any) => {
          const groupMembers = memberships?.filter(m => m.group_id === group.id) || [];
          const memberCount = groupMembers.length;
          
          // Get group payments to calculate estimated organizer fee
          // Organizer fee = 1 day's contribution per member
          // So we need to estimate based on average or get from group configuration
          // For now, calculate from actual payments - the organizer fee is the average of member payments
          const groupPayments = allPaymentsForTotal?.filter(p => p.group_id === group.id) || [];
          
          if (groupPayments.length > 0 && memberCount > 0) {
            // Group payments by currency
            const paymentByCurrency: Record<string, number[]> = {};
            groupPayments.forEach(p => {
              if (!paymentByCurrency[p.currency]) paymentByCurrency[p.currency] = [];
              paymentByCurrency[p.currency].push(p.amount);
            });
            
            // Calculate average per currency
            Object.entries(paymentByCurrency).forEach(([currency, amounts]) => {
              const average = amounts.reduce((a, b) => a + b, 0) / amounts.length;
              const estimatedFee = average; // Organizer gets 1 day's worth per member
              if (!totalEarnings[currency]) totalEarnings[currency] = 0;
              totalEarnings[currency] += estimatedFee * memberCount;
            });
          }
        });
      }
      
      console.log('Total earnings calculated (estimated from current cycle):', totalEarnings);

      // 7. Get payments with group_id to calculate per-group totals - ONLY current cycle
      const { data: allPaymentsWithGroup, error: allPaymentsGroupError } = await supabase
        .from('payments')
        .select('id, amount, currency, group_id')
        .in('group_id', groupIds)
        .eq('archived', false);

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
          groups(id, name, organizer_id, current_cycle_start_date, cycle_days, current_cycle)
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
          healthScore: 0,
          memberRates: {},
          expectedPayments: {},
          previousCycleFees: {}
        };
      }

      const membershipIds = memberships.map(m => m.id);
      const now = new Date();

      // 2. Get current cycle payments - ONLY non-archived (current cycle) payments
      // Filter by earliest cycle start date across all memberships
      const cycleDates = memberships
        .map((m: any) => m.groups?.current_cycle_start_date)
        .filter(Boolean);
      
      const earliestCycleStart = cycleDates.length > 0 
        ? new Date(Math.min(...cycleDates.map(d => new Date(d).getTime())))
        : new Date(now.getFullYear(), now.getMonth(), 1);

      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('id, amount, currency, payment_date, membership_id, recorded_at')
        .in('membership_id', membershipIds)
        .eq('archived', false) // Only show current cycle payments
        .gte('payment_date', earliestCycleStart.toISOString())
        .order('payment_date', { ascending: false }); // Newest payments first (reverse chronological)

      if (paymentsError) throw paymentsError;

      // 3. Get member's active goals
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('id, name, target_amount, current_progress, target_date, target_currency, status')
        .eq('user_id', userId)
        .eq('status', 'ACTIVE');

      if (goalsError) throw goalsError;

      // 4. Get member currency rates for expected payment calculation
      const { data: rates, error: ratesError } = await supabase
        .from('member_currency_rates')
        .select('id, membership_id, currency, daily_rate, is_active')
        .in('membership_id', membershipIds)
        .eq('is_active', true);

      if (ratesError) throw ratesError;

      // 5. Get previous cycle payouts to show fees charged
      const { data: previousPayouts, error: payoutsError } = await supabase
        .from('payout_items')
        .select('id, membership_id, currency, organizer_fee')
        .in('membership_id', membershipIds)
        .order('disbursed_at', { ascending: false })
        .limit(membershipIds.length * 2); // Get last few payouts per member

      if (payoutsError) throw payoutsError;

      // 6. Calculate totals
      const totalSaved: Record<string, number> = {};
      payments?.forEach(p => {
        if (!totalSaved[p.currency]) totalSaved[p.currency] = 0;
        totalSaved[p.currency] += p.amount;
      });

      // 7. Calculate days paid this month
      const uniqueDays = new Set(
        payments?.map(p => new Date(p.payment_date).toDateString()) || []
      );
      const daysPaid = uniqueDays.size;

      // 8. Calculate streak (consecutive days)
      const streakDays = calculateStreak(payments || []);

      // 9. Calculate health score
      const healthScore = calculateHealthScore(daysPaid, totalSaved, goals || []);

      // 10. Calculate expected payments based on current rates and cycle progress
      const expectedPayments: Record<string, number> = {};
      memberships.forEach((membership: any) => {
        const group = membership.groups;
        if (group) {
          const cycleStartDate = new Date(group.current_cycle_start_date);
          const daysInCurrentCycle = Math.ceil((now.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

          const memberRates = rates?.filter(r => r.membership_id === membership.id) || [];
          memberRates.forEach((rate: any) => {
            const expectedAmount = rate.daily_rate * daysInCurrentCycle;
            if (!expectedPayments[rate.currency]) expectedPayments[rate.currency] = 0;
            expectedPayments[rate.currency] += expectedAmount;
          });
        }
      });

      // 11. Get the most recent fees from previous cycle
      const previousCycleFees: Record<string, number> = {};
      previousPayouts?.forEach((payout: any) => {
        if (!previousCycleFees[payout.currency]) previousCycleFees[payout.currency] = 0;
        previousCycleFees[payout.currency] += payout.organizer_fee || 0;
      });

      // 12. Build member rates map for reference
      const memberRates: Record<string, Record<string, number>> = {};
      memberships.forEach((membership: any) => {
        memberRates[membership.id] = {};
        const memberRatesList = rates?.filter(r => r.membership_id === membership.id) || [];
        memberRatesList.forEach((rate: any) => {
          memberRates[membership.id][rate.currency] = rate.daily_rate;
        });
      });

      return {
        memberships,
        payments: payments || [],
        goals: goals || [],
        totalSaved,
        daysPaid,
        streakDays,
        healthScore,
        memberRates,
        expectedPayments,
        previousCycleFees
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
  },

  /**
   * Get cycle history for a member in a specific group
   */
  getMemberCycleHistory: async (userId: string, groupId: string) => {
    try {
      // Get all payouts for the group
      const { data: payouts, error: payoutsError } = await supabase
        .from('payouts')
        .select(`
          id, 
          cycle_number, 
          payout_date,
          payout_items(*)
        `)
        .eq('group_id', groupId)
        .order('cycle_number', { ascending: false });

      if (payoutsError) throw payoutsError;

      // Get member's payments for this group
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          id, 
          amount, 
          currency, 
          payment_date,
          membership_id,
          memberships(user_id)
        `)
        .eq('memberships.user_id', userId)
        .eq('group_id', groupId);

      if (paymentsError) throw paymentsError;

      // Match payments to payouts by date range
      const cycleHistory = payouts?.map((payout: any) => {
        const payoutItems = payout.payout_items || [];
        const memberItem = payoutItems.find((item: any) => item.user_id === userId);

        // Get payments that contributed to this cycle
        const contributedAmount: Record<string, number> = {};
        (payments || []).forEach((p: any) => {
          if (new Date(p.payment_date) <= new Date(payout.payout_date)) {
            if (!contributedAmount[p.currency]) contributedAmount[p.currency] = 0;
            contributedAmount[p.currency] += p.amount;
          }
        });

        return {
          id: payout.id,
          cycle_number: payout.cycle_number,
          payout_date: payout.payout_date,
          totalSaved: contributedAmount,
          commissionEarned: memberItem?.commission_earned_by_member || {},
          amountReceived: memberItem ? { [memberItem.currency || 'RWF']: memberItem.net_payout || 0 } : {}
        };
      }) || [];

      return cycleHistory;
    } catch (error) {
      console.error('Error fetching member cycle history:', error);
      return [];
    }
  },

  /**
   * Get cycle history for an organizer's group
   */
  getOrganizerCycleHistory: async (groupId: string) => {
    try {
      const { data: payouts, error: payoutsError } = await supabase
        .from('payouts')
        .select(`
          id, 
          cycle_number, 
          payout_date,
          organizer_fee_total_rwf,
          payout_items(*)
        `)
        .eq('group_id', groupId)
        .order('cycle_number', { ascending: false });

      if (payoutsError) throw payoutsError;

      // Get member count for this group
      const { data: memberships, error: membershipsError } = await supabase
        .from('memberships')
        .select('id, group_id')
        .eq('group_id', groupId)
        .eq('status', 'ACTIVE');

      if (membershipsError) throw membershipsError;

      const cycleHistory = payouts?.map((payout: any) => {
        const payoutItems = payout.payout_items || [];
        const totalCollected: Record<string, number> = {};
        let totalEarnings: Record<string, number> = {};

        payoutItems.forEach((item: any) => {
          if (!totalCollected[item.currency]) totalCollected[item.currency] = 0;
          totalCollected[item.currency] += item.total_saved || 0;

          if (!totalEarnings[item.currency]) totalEarnings[item.currency] = 0;
          totalEarnings[item.currency] += item.organizer_fee || 0;
        });

        return {
          id: payout.id,
          cycle_number: payout.cycle_number,
          payout_date: payout.payout_date,
          totalSaved: totalCollected,
          commissionEarned: totalEarnings,
          membersCount: memberships?.length || 0
        };
      }) || [];

      return cycleHistory;
    } catch (error) {
      console.error('Error fetching organizer cycle history:', error);
      return [];
    }
  },

  /**
   * Get member consistency metrics (cycles paid in vs total cycles)
   */
  getMemberConsistency: async (userId: string, groupId: string) => {
    try {
      // Get all payouts for the group
      const { data: payouts, error: payoutsError } = await supabase
        .from('payouts')
        .select('id, cycle_number, payout_date, payout_items(*)')
        .eq('group_id', groupId);

      if (payoutsError) throw payoutsError;

      const totalCycles = payouts?.length || 0;

      // Count how many cycles member contributed to
      let cyclesPaidIn = 0;
      payouts?.forEach((payout: any) => {
        const payoutItems = payout.payout_items || [];
        const memberItem = payoutItems.find((item: any) => item.user_id === userId);
        if (memberItem) cyclesPaidIn++;
      });

      return {
        cyclesPaidIn,
        totalCycles,
        consistencyPercent: totalCycles > 0 ? Math.round((cyclesPaidIn / totalCycles) * 100) : 0
      };
    } catch (error) {
      console.error('Error fetching member consistency:', error);
      return { cyclesPaidIn: 0, totalCycles: 0, consistencyPercent: 0 };
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

/**
 * Get managed funds breakdown by group for organizer
 */
export const getOrganizerManagedFundsBreakdown = async (organizerId: string) => {
  try {
    const { data: groups } = await supabase
      .from('groups')
      .select('id, name, current_cycle')
      .eq('organizer_id', organizerId)
      .eq('status', 'ACTIVE');

    if (!groups) return [];

    const breakdown = await Promise.all(
      groups.map(async (group: any) => {
        const { data: payments } = await supabase
          .from('payments')
          .select('amount, currency')
          .eq('group_id', group.id)
          .eq('archived', false);

        const total = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
        const currency = payments?.[0]?.currency || 'RWF';

        return {
          groupId: group.id,
          groupName: group.name,
          value: total,
          currency: currency,
          cycle: group.current_cycle,
          additionalInfo: `Cycle ${group.current_cycle} | ${total.toLocaleString()} in managed funds`,
        };
      })
    );

    return breakdown;
  } catch (error) {
    console.error('Error getting managed funds breakdown:', error);
    return [];
  }
};

/**
 * Get organizer earnings breakdown by group
 */
export const getOrganizerEarningsBreakdown = async (organizerId: string) => {
  try {
    const { data: groups } = await supabase
      .from('groups')
      .select('id, name, current_cycle, group_type')
      .eq('organizer_id', organizerId)
      .eq('status', 'ACTIVE');

    if (!groups) return [];

    const breakdown = await Promise.all(
      groups.map(async (group: any) => {
        let totalEarnings = 0;
        let currency = 'RWF';
        let lastCycle = group.current_cycle;

        if (group.group_type === 'ORGANIZER_ONLY') {
          // For Organizer-Only groups, get earnings from organizer_only_payouts
          const { data: payouts } = await supabase
            .from('organizer_only_payouts')
            .select('total_amount, payment_count, status')
            .eq('group_id', group.id)
            .order('cycle_number', { ascending: false });

          if (payouts && payouts.length > 0) {
            // Calculate organizer fee (1 day worth) from latest cycle
            const latestPayout = payouts[0];
            const dailyRate = latestPayout.total_amount / (latestPayout.payment_count || 1);
            totalEarnings = dailyRate;
            currency = 'RWF';
          }
        } else {
          // For Full Platform groups, get earnings from payout_items
          const { data: payouts } = await supabase
            .from('payout_items')
            .select('organizer_fee, currency, payouts(cycle_number)')
            .in('payout_id', 
              (await supabase
                .from('payouts')
                .select('id')
                .eq('group_id', group.id)).data?.map((p: any) => p.id) || []
            );

          totalEarnings = payouts?.reduce((sum, item: any) => sum + (item.organizer_fee || 0), 0) || 0;
          currency = payouts?.[0]?.currency || 'RWF';
          lastCycle = payouts?.[0]?.payouts?.[0]?.cycle_number || group.current_cycle;
        }

        return {
          groupId: group.id,
          groupName: group.name,
          value: totalEarnings,
          currency: currency,
          cycle: lastCycle,
          additionalInfo: `Earned ${totalEarnings.toLocaleString()} ${currency} as organizer fee`,
        };
      })
    );

    return breakdown;
  } catch (error) {
    console.error('Error getting earnings breakdown:', error);
    return [];
  }
};

/**
 * Get member count breakdown by group
 */
export const getOrganizerMembersBreakdown = async (organizerId: string) => {
  try {
    const { data: groups } = await supabase
      .from('groups')
      .select('id, name, current_cycle')
      .eq('organizer_id', organizerId)
      .eq('status', 'ACTIVE');

    if (!groups) return [];

    const breakdown = await Promise.all(
      groups.map(async (group: any) => {
        const { data: members } = await supabase
          .from('memberships')
          .select('id')
          .eq('group_id', group.id)
          .eq('status', 'ACTIVE');

        return {
          groupId: group.id,
          groupName: group.name,
          value: members?.length || 0,
          cycle: group.current_cycle,
          additionalInfo: `${members?.length || 0} active members in this group`,
        };
      })
    );

    return breakdown;
  } catch (error) {
    console.error('Error getting members breakdown:', error);
    return [];
  }
};

/**
 * Get active cycles breakdown by group
 */
export const getOrganizerCyclesBreakdown = async (organizerId: string) => {
  try {
    const { data: groups } = await supabase
      .from('groups')
      .select('id, name, current_cycle, current_cycle_start_date, cycle_days, status')
      .eq('organizer_id', organizerId)
      .eq('status', 'ACTIVE');

    if (!groups) return [];

    const breakdown = groups.map((group: any) => {
      const startDate = new Date(group.current_cycle_start_date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + group.cycle_days);
      const now = new Date();
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        groupId: group.id,
        groupName: group.name,
        value: group.current_cycle,
        cycle: group.current_cycle,
        cycleStatus: daysRemaining > 0 ? 'In Progress' : 'Completed',
        additionalInfo: `Cycle ${group.current_cycle} | ${daysRemaining} days remaining`,
      };
    });

    return breakdown;
  } catch (error) {
    console.error('Error getting cycles breakdown:', error);
    return [];
  }
};

