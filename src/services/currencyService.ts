import { supabase } from '@/api/supabase';

export const currencyService = {
  /**
   * Get the Membership ID for a specific User and Group
   * We need this because rates are linked to Membership, not just User
   */
  getMembershipId: async (userId: string, groupId: string) => {
    const { data, error } = await supabase
      .from('memberships')
      .select('id')
      .eq('user_id', userId)
      .eq('group_id', groupId)
      .single();

    if (error) throw error;
    return data.id;
  },

  /**
   * Fetch existing rates for a membership
   */
  getMemberRates: async (membershipId: string) => {
    const { data, error } = await supabase
      .from('member_currency_rates')
      .select('*')
      .eq('membership_id', membershipId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  },

  /**
   * Save or Update currency rates
   * We use 'upsert' to handle both new and updated rates
   */
  saveRates: async (membershipId: string, rates: { currency: string; daily_rate: number }[]) => {
    // Prepare data for upsert
    // Note: We assume start_date is TODAY for simplicity in this MVP
    // In a real app, we might handle versioning of rates over time
    const updates = rates.map(r => ({
      membership_id: membershipId,
      currency: r.currency,
      daily_rate: r.daily_rate,
      is_active: true,
      start_date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    }));

    const { data, error } = await supabase
      .from('member_currency_rates')
      .upsert(updates, { onConflict: 'membership_id,currency,start_date' })
      .select();

    if (error) throw error;
    return data;
  }
};