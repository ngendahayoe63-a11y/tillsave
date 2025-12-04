import { supabase } from '@/api/supabase';
import { differenceInCalendarDays, eachDayOfInterval, format, getDay, isSameDay, addDays, endOfMonth } from 'date-fns';

export const advancedAnalyticsService = {
  
  /**
   * THE CORE INTELLIGENCE FUNCTION
   */
  getMemberInsights: async (userId: string, groupId: string) => {
    // 1. Fetch Basic Data
    const { data: membership } = await supabase
      .from('memberships')
      .select('id, joined_at, group_id')
      .eq('user_id', userId)
      .eq('group_id', groupId)
      .single();

    if (!membership) return null;

    const { data: group } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    // Fetch Payments
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('membership_id', membership.id)
      .eq('status', 'CONFIRMED')
      .order('payment_date', { ascending: true }); // Oldest first for streak calc

    const safePayments = payments || [];

    // Fetch Rates (Goals)
    const { data: rates } = await supabase
      .from('member_currency_rates')
      .select('*')
      .eq('membership_id', membership.id)
      .eq('is_active', true);

    const primaryRate = rates?.[0] || { daily_rate: 0, currency: 'RWF' }; // Simplify to primary currency for MVP scoring

    // --- A. CALCULATE HEALTH SCORE (0-100) ---
    const today = new Date();
    const cycleStart = new Date(group.current_cycle_start_date);
    // Use joined_at if joined AFTER cycle start
    const effectiveStart = new Date(membership.joined_at) > cycleStart ? new Date(membership.joined_at) : cycleStart;
    
    const daysElapsed = differenceInCalendarDays(today, effectiveStart) + 1;
    const daysPaidCount = new Set(safePayments.map(p => p.payment_date)).size;
    
    // 1. Consistency (50 pts)
    const consistency = daysElapsed > 0 ? (daysPaidCount / daysElapsed) : 1;
    const scoreConsistency = Math.min(consistency * 50, 50);

    // 2. Streak (30 pts) - Simple logic: last 10 days
    // (Real implementation needs complex streak math, we'll estimate based on recent activity)
    const recentPayments = safePayments.filter(p => 
      differenceInCalendarDays(today, new Date(p.payment_date)) <= 10
    );
    const recentDaysPaid = new Set(recentPayments.map(p => p.payment_date)).size;
    const scoreStreak = (recentDaysPaid / 10) * 30;

    // 3. Volume/Goal (20 pts)
    // Did they meet the daily target amount?
    const totalSaved = safePayments.reduce((sum, p) => sum + p.amount, 0);
    const expectedSaved = daysElapsed * primaryRate.daily_rate;
    const volumeRatio = expectedSaved > 0 ? (totalSaved / expectedSaved) : 1;
    const scoreVolume = Math.min(volumeRatio * 20, 20);

    const healthScore = Math.round(scoreConsistency + scoreStreak + scoreVolume);

    // --- B. PATTERN RECOGNITION ---
    // Which day of the week do they pay most?
    const dayCounts = [0,0,0,0,0,0,0]; // Sun to Sat
    safePayments.forEach(p => {
      const dayIndex = getDay(new Date(p.payment_date));
      dayCounts[dayIndex]++;
    });
    
    const bestDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bestDay = daysOfWeek[bestDayIndex];

    // --- C. PREDICTIONS ---
    const daysRemaining = Math.max(0, group.cycle_days - differenceInCalendarDays(today, cycleStart));
    const avgDaily = daysPaidCount > 0 ? (totalSaved / daysPaidCount) : 0;
    const projectedPayout = totalSaved + (avgDaily * daysRemaining);

    // --- D. SMART ALERTS ---
    const alerts = [];
    
    if (healthScore < 50) {
      alerts.push({
        type: 'danger',
        title: 'At Risk',
        msg: 'You have missed multiple days recently. Pay today to get back on track!'
      });
    } else if (healthScore < 80) {
      alerts.push({
        type: 'warning',
        title: 'Consistency Check',
        msg: `You usually pay on ${bestDay}. Don't forget to save this week!`
      });
    } else {
      alerts.push({
        type: 'success',
        title: 'Top Performer',
        msg: 'Your savings habit is stronger than 80% of members. Keep it up!'
      });
    }

    if (daysRemaining < 5) {
      alerts.push({
        type: 'info',
        title: 'Final Push',
        msg: `${daysRemaining} days left in cycle. Finish strong!`
      });
    }

    return {
      healthScore,
      scoreBreakdown: { consistency: scoreConsistency, streak: scoreStreak, volume: scoreVolume },
      patterns: { dayCounts, bestDay },
      predictions: { projectedPayout, daysRemaining },
      alerts,
      totals: { totalSaved, daysPaidCount, currency: primaryRate.currency }
    };
  }
};