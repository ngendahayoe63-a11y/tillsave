import { supabase } from '@/api/supabase';

/**
 * Get member's current active rates for all currencies
 */
const getMemberCurrentRates = async (memberId: string): Promise<Record<string, number>> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: rates, error } = await supabase
      .from('member_currency_rates')
      .select('currency, daily_rate, start_date, end_date')
      .eq('membership_id', memberId)
      .eq('is_active', true)
      .or(`end_date.is.null,end_date.gte.${today}`);

    if (error) throw error;
    
    // Transform to currency -> rate object
    const rateMap: Record<string, number> = {};
    rates?.forEach((r: any) => {
      rateMap[r.currency] = r.daily_rate;
    });
    
    return rateMap;
  } catch (error) {
    console.error('Error fetching member rates:', error);
    throw error;
  }
};

/**
 * Service for fetching detailed member currency rates and contribution data
 */
export const memberContributionService = {
  /**
   * Get member's current active rates for all currencies
   */
  getMemberCurrentRates,

  /**
   * Get member's expected contribution per day based on rates
   */
  getMemberExpectedContribution: async (memberId: string): Promise<Record<string, number>> => {
    try {
      const rates = await getMemberCurrentRates(memberId);
      return rates || {};
    } catch (error) {
      console.error('Error calculating expected contribution:', error);
      throw error;
    }
  },

  /**
   * Get member's payment history with actual vs expected
   */
  getMemberContributionAnalytics: async (memberId: string, monthsBack = 3) => {
    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

      // Get all payments
      const { data: payments, error: payError } = await supabase
        .from('payments')
        .select('amount, currency, payment_date')
        .eq('membership_id', memberId)
        .gte('payment_date', startDate.toISOString().split('T')[0])
        .order('payment_date', { ascending: false });

      if (payError) throw payError;

      // Get all rate history
      const { data: rateHistory, error: rateError } = await supabase
        .from('member_currency_rates')
        .select('currency, daily_rate, start_date, end_date')
        .eq('membership_id', memberId)
        .gte('start_date', startDate.toISOString().split('T')[0]);

      if (rateError) throw rateError;

      // Calculate summary by currency
      const summary: Record<string, {
        actualPaid: number;
        daysWithPayment: number;
        currencies: string[];
      }> = {};

      payments?.forEach(p => {
        if (!summary[p.currency]) {
          summary[p.currency] = {
            actualPaid: 0,
            daysWithPayment: 0,
            currencies: []
          };
        }
        summary[p.currency].actualPaid += p.amount;
      });

      // Count unique payment days per currency
      const paymentsByDay: Record<string, Set<string>> = {};
      payments?.forEach(p => {
        if (!paymentsByDay[p.currency]) paymentsByDay[p.currency] = new Set();
        paymentsByDay[p.currency].add(p.payment_date);
      });

      Object.keys(paymentsByDay).forEach(currency => {
        if (summary[currency]) {
          summary[currency].daysWithPayment = paymentsByDay[currency].size;
        }
      });

      return {
        payments,
        rateHistory,
        summary
      };
    } catch (error) {
      console.error('Error fetching contribution analytics:', error);
      throw error;
    }
  },

  /**
   * Get all rate changes for a member (historical tracking)
   */
  getMemberRateHistory: async (memberId: string) => {
    try {
      const { data: history, error } = await supabase
        .from('member_currency_rates')
        .select('*')
        .eq('membership_id', memberId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return history || [];
    } catch (error) {
      console.error('Error fetching rate history:', error);
      throw error;
    }
  },

  /**
   * Get member's expected savings based on rates
   */
  calculateExpectedSavings: async (memberId: string): Promise<{
    rates: Record<string, number>;
    totalDailyExpected: number;
    expectedMonthly: number;
  }> => {
    try {
      const ratesData = await getMemberCurrentRates(memberId);
      const rates = ratesData || {};
      
      // Return total expected daily contribution
      const totalDaily = Object.values(rates).reduce((sum: number, rate: any) => sum + (rate as number), 0);
      
      return {
        rates,
        totalDailyExpected: totalDaily,
        expectedMonthly: totalDaily * 30 // Approximate
      };
    } catch (error) {
      console.error('Error calculating expected savings:', error);
      throw error;
    }
  }
};
