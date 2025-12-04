import { supabase } from '@/api/supabase';
import { currencyService } from './currencyService';
import { eachDayOfInterval, format, startOfMonth, endOfMonth, isAfter, isSameDay, differenceInCalendarDays, addDays } from 'date-fns';

export const analyticsService = {
  // ... (Keep getGlobalOrganizerStats and getGroupAnalytics as they are)
  getGlobalOrganizerStats: async (organizerId: string) => {
    // (Paste previous code here or keep existing)
    // To save space in this response, assume previous organizer logic exists here
    // If you need the full file again, let me know.
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    const { data: groups } = await supabase.from('groups').select('id').eq('organizer_id', organizerId).eq('status', 'ACTIVE');
    if (!groups || groups.length === 0) return null;
    const groupIds = groups.map(g => g.id);
    const { count: memberCount } = await supabase.from('memberships').select('id', { count: 'exact', head: true }).in('group_id', groupIds).eq('status', 'ACTIVE');
    const { data: payments } = await supabase.from('payments').select('amount, currency, membership_id').in('group_id', groupIds).gte('payment_date', start.toISOString()).lte('payment_date', end.toISOString());
    const { data: rates } = await supabase.from('member_currency_rates').select('*').eq('is_active', true);
    const totalManaged: Record<string, number> = {};
    const totalEarnings: Record<string, number> = {};
    payments?.forEach(p => { if (!totalManaged[p.currency]) totalManaged[p.currency] = 0; totalManaged[p.currency] += p.amount; });
    const activeMemberIds = new Set(payments?.map(p => p.membership_id));
    activeMemberIds.forEach(memId => {
      const memRates = rates?.filter(r => r.membership_id === memId) || [];
      memRates.forEach(rate => { if (!totalEarnings[rate.currency]) totalEarnings[rate.currency] = 0; totalEarnings[rate.currency] += rate.daily_rate; });
    });
    return { totalGroups: groups.length, totalMembers: memberCount || 0, totalManaged, totalEarnings };
  },

  getGroupAnalytics: async (groupId: string, cycleStart: Date, cycleEnd: Date) => {
     // (Keep previous implementation)
     // ...
     return { totalSavings: {}, organizerEarnings: {}, completionRate: 0, missedPayments: 0, chartData: [], memberCount: 0 };
  },

  getMemberAnalytics: async (membershipId: string, monthStart: Date) => {
     // (Keep previous implementation)
     return { calendarData: [], daysPaidCount: 0, totalThisMonth: 0 };
  },

  // --- NEW: MEMBER PORTFOLIO SUMMARY ---
  getMemberPortfolio: async (userId: string) => {
    // 1. Get all active memberships with group details
    const { data: memberships } = await supabase
      .from('memberships')
      .select(`
        id,
        group_id,
        groups:group_id (
          id,
          name,
          join_code,
          cycle_days,
          current_cycle,
          current_cycle_start_date
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'ACTIVE');

    if (!memberships) return [];

    // 2. Process each group to get specific stats
    const portfolio = await Promise.all(memberships.map(async (m: any) => {
      const group = m.groups;
      
      // Calculate Cycle Dates
      const startDate = new Date(group.current_cycle_start_date);
      const endDate = addDays(startDate, group.cycle_days);
      const today = new Date();
      
      // Calculate Days Remaining
      const daysPassed = differenceInCalendarDays(today, startDate);
      const daysRemaining = Math.max(0, group.cycle_days - daysPassed);
      const progressPercent = Math.min(100, Math.max(0, (daysPassed / group.cycle_days) * 100));

      // Get Payments for this cycle
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, currency')
        .eq('membership_id', m.id)
        .gte('payment_date', startDate.toISOString())
        .lte('payment_date', endDate.toISOString());

      // Get Rates to calc Fee
      const rates = await currencyService.getMemberRates(m.id);

      // Summarize Money
      const summary: any[] = [];
      const paymentGroups: Record<string, number> = {};
      
      payments?.forEach((p: any) => {
        if (!paymentGroups[p.currency]) paymentGroups[p.currency] = 0;
        paymentGroups[p.currency] += p.amount;
      });

      Object.entries(paymentGroups).forEach(([curr, total]) => {
        // Find rate for this currency
        const rateObj = rates.find((r: any) => r.currency === curr);
        const dailyRate = rateObj ? rateObj.daily_rate : 0;
        
        // Fee Logic: 1 Day's rate
        // Only apply fee if they have saved at least something
        const fee = total > 0 ? dailyRate : 0;
        
        summary.push({
          currency: curr,
          saved: total,
          fee: fee,
          net: total - fee
        });
      });

      return {
        group,
        membershipId: m.id,
        cycle: {
          current: group.current_cycle,
          daysTotal: group.cycle_days,
          daysRemaining,
          progressPercent
        },
        financials: summary
      };
    }));

    return portfolio;
  }
};