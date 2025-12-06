import { supabase } from '@/api/supabase';
import { analyticsService } from './analyticsService';

export interface PayoutItem {
  membershipId: string;
  memberName: string;
  currency: string;
  totalSaved: number;
  organizerFee: number;
  netPayout: number;
  daysContributed: number;
}

export const payoutService = {
  // ... (Keep previewCyclePayout and finalizePayout exactly as they were)
  
  // --- PASTE THIS BELOW THE EXISTING FUNCTIONS ---

  /**
   * 3. HISTORY: Get list of past closed cycles
   */
  getPastCycles: async (groupId: string) => {
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('group_id', groupId)
      .order('cycle_number', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * 4. HISTORY: Get details of a specific past cycle
   */
  getPastPayoutDetails: async (payoutId: string) => {
    // 1. Get Payout Info
    const { data: payout, error: pError } = await supabase
      .from('payouts')
      .select('*')
      .eq('id', payoutId)
      .single();

    if (pError) throw pError;

    // 2. Get Items with User Names
    // We join payout_items -> memberships -> users
    const { data: items, error: iError } = await supabase
      .from('payout_items')
      .select(`
        currency,
        gross_amount,
        organizer_fee,
        net_amount,
        days_contributed,
        memberships (
          users ( name )
        )
      `)
      .eq('payout_id', payoutId);

    if (iError) throw iError;

    // 3. Format to match our UI expectations
    const formattedItems = items.map((i: any) => ({
      memberName: i.memberships?.users?.name || 'Unknown',
      currency: i.currency,
      totalSaved: i.gross_amount,
      organizerFee: i.organizer_fee,
      netPayout: i.net_amount,
      daysContributed: i.days_contributed
    }));

    return { payout, items: formattedItems };
  },

  // ... (Paste back the previous previewCyclePayout and finalizePayout functions here to keep file complete)
  // For brevity in this message, I assume you kept the top part of the file.
  // If you need the FULL file again, let me know.
  previewCyclePayout: async (groupId: string) => {
    const { data: group } = await supabase.from('groups').select('current_cycle_start_date, cycle_days').eq('id', groupId).single();
    if (!group) throw new Error("Group not found");
    const start = new Date(group.current_cycle_start_date);
    const end = new Date();
    const analytics = await analyticsService.getGroupAnalytics(groupId);
    if (!analytics) throw new Error("Could not calculate analytics");
    const { data: members } = await supabase.from('memberships').select('id, users:user_id(name)').eq('group_id', groupId).eq('status', 'ACTIVE');
    if (!members) return [];
    const payoutItems: PayoutItem[] = [];
    for (const member of members) {
      const { data: payments } = await supabase.from('payments').select('amount, currency, payment_date').eq('membership_id', member.id).gte('payment_date', start.toISOString()).lte('payment_date', end.toISOString());
      const safePayments = payments || [];
      if (safePayments.length === 0) continue;
      const currencyGroups: Record<string, number> = {};
      safePayments.forEach(p => { if (!currencyGroups[p.currency]) currencyGroups[p.currency] = 0; currencyGroups[p.currency] += p.amount; });
      const { data: rates } = await supabase.from('member_currency_rates').select('*').eq('membership_id', member.id).eq('is_active', true);
      for (const [currency, total] of Object.entries(currencyGroups)) {
        const rateObj = rates?.find(r => r.currency === currency);
        const dailyRate = rateObj ? rateObj.daily_rate : 0;
        const days = new Set(safePayments.filter(p => p.currency === currency).map(p => p.payment_date)).size;
        const fee = dailyRate; 
        const userName = (member.users as any)?.name || 'Unknown';
        payoutItems.push({ membershipId: member.id, memberName: userName, currency, totalSaved: total, organizerFee: fee, netPayout: total - fee, daysContributed: days });
      }
    }
    return payoutItems;
  },

  finalizePayout: async (groupId: string, items: PayoutItem[]) => {
    const totalFeeRWF = items.filter(i => i.currency === 'RWF').reduce((sum, i) => sum + i.organizerFee, 0);
    const { data: group } = await supabase.from('groups').select('current_cycle').eq('id', groupId).single();
    const currentCycle = group?.current_cycle || 1;
    const { data: payout, error: payoutError } = await supabase.from('payouts').insert({ group_id: groupId, cycle_number: currentCycle, payout_date: new Date().toISOString(), organizer_fee_total_rwf: totalFeeRWF, total_distributed_count: items.length, status: 'CALCULATED' }).select().single();
    if (payoutError) throw payoutError;
    const dbItems = items.map(item => ({ payout_id: payout.id, membership_id: item.membershipId, currency: item.currency, days_contributed: item.daysContributed, gross_amount: item.totalSaved, organizer_fee: item.organizerFee, net_amount: item.netPayout, disbursement_status: 'PENDING' }));
    const { error: itemsError } = await supabase.from('payout_items').insert(dbItems);
    if (itemsError) throw itemsError;
    const { error: updateError } = await supabase.from('groups').update({ current_cycle: currentCycle + 1, current_cycle_start_date: new Date().toISOString() }).eq('id', groupId);
    if (updateError) throw updateError;
    return payout;
  }
};