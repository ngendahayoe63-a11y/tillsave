import { supabase } from '@/api/supabase';

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
  /**
   * Get organizer details for report (name, email, phone)
   */
  getOrganizerDetails: async (organizerId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, phone')
      .eq('id', organizerId)
      .single();
    
    if (error) throw error;
    return data;
  },

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
    try {
      // Get group info
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('current_cycle_start_date, current_cycle')
        .eq('id', groupId)
        .single();
      
      if (groupError) {
        console.error('Group fetch error:', groupError);
        throw new Error("Group not found");
      }
      if (!group) throw new Error("Group not found");
      
      // Parse the start date - it's stored in ISO format
      const start = new Date(group.current_cycle_start_date);
      
      // Get just the date part in YYYY-MM-DD format (in local timezone to avoid timezone issues)
      // Instead of using toISOString() which converts to UTC, extract the date string properly
      const startYear = start.getFullYear();
      const startMonth = String(start.getMonth() + 1).padStart(2, '0');
      const startDate = String(start.getDate()).padStart(2, '0');
      const startDateStr = `${startYear}-${startMonth}-${startDate}`;
      
      const now = new Date();
      const endYear = now.getFullYear();
      const endMonth = String(now.getMonth() + 1).padStart(2, '0');
      const endDate = String(now.getDate()).padStart(2, '0');
      const endDateStr = `${endYear}-${endMonth}-${endDate}`;
      
      console.log(`📊 Payout Preview - Cycle ${group.current_cycle}`);
      console.log(`   Fetching payments from ${startDateStr} to ${endDateStr} for group ${groupId}`);
      console.log(`   Start Date (from DB): ${group.current_cycle_start_date}`);
      
      // Get members with user details using correct alias
      const { data: members, error: membersError } = await supabase
        .from('memberships')
        .select(`
          id,
          user_id,
          users:user_id (id, name)
        `)
        .eq('group_id', groupId)
        .eq('status', 'ACTIVE');
      
      if (membersError) {
        console.error('Members fetch error:', membersError);
        throw membersError;
      }
      
      console.log(`Found ${members?.length || 0} active members`);
      
      if (!members || members.length === 0) return [];
      
      const payoutItems: PayoutItem[] = [];
      
      for (const member of members) {
        // Get payments for this member in the current cycle
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('amount, currency, payment_date')
          .eq('membership_id', member.id)
          .gte('payment_date', startDateStr)
          .lte('payment_date', endDateStr);
        
        if (paymentsError) {
          console.error('Payments fetch error:', paymentsError);
          continue;
        }
        
        const safePayments = payments || [];
        
        // Log detailed payment info for debugging
        if (safePayments.length > 0) {
          console.log(`   ${(member.users as any)?.name}: ${safePayments.length} payment(s) found`);
          safePayments.forEach(p => {
            console.log(`      - ${p.payment_date}: ${p.amount} ${p.currency}`);
          });
        } else {
          console.log(`   ${(member.users as any)?.name}: No payments found`);
        }
        
        if (safePayments.length === 0) continue;
        
        // Group payments by currency
        const currencyGroups: Record<string, number> = {};
        safePayments.forEach(p => {
          if (!currencyGroups[p.currency]) currencyGroups[p.currency] = 0;
          currencyGroups[p.currency] += p.amount;
        });
        
        // Get daily rates for fee calculation - fetch all rates, not just active
        const { data: rates, error: ratesError } = await supabase
          .from('member_currency_rates')
          .select('currency, daily_rate, is_active, end_date')
          .eq('membership_id', member.id)
          .order('start_date', { ascending: false });
        
        if (ratesError) {
          console.error('Rates fetch error for member', member.id, ratesError);
        } else {
          console.log(`Member ${(member.users as any)?.name} has ${rates?.length || 0} rates:`, rates);
        }
        
        // Access user info correctly from the users alias
        const userInfo = (member.users as any);
        const userName = userInfo?.name || 'Unknown';
        
        // Create payout item for each currency
        for (const [currency, total] of Object.entries(currencyGroups)) {
          const currencyPayments = safePayments.filter(p => p.currency === currency);
          // Use payment count (each payment = 1 day of contribution), not unique dates
          const days = currencyPayments.length;
          
          // Try to get daily rate from database first
          let dailyRate = 0;
          const rateObj = rates?.find(r => r.currency === currency);
          if (rateObj) {
            dailyRate = rateObj.daily_rate;
          } else {
            // If no rate in database, calculate from actual payments: average per day
            dailyRate = days > 0 ? Math.round((total as number) / days) : 0;
            console.log(`Calculated daily rate for ${userName} (${currency}): ${total} / ${days} days = ${dailyRate}`);
          }
          
          const organizerFee = dailyRate; // 1 day's contribution = organizer fee
          
          console.log(`Payout for ${userName} - Currency: ${currency}, Total: ${total}, Days: ${days}, Rate: ${dailyRate}, Fee: ${organizerFee}`);
          
          payoutItems.push({
            membershipId: member.id,
            memberName: userName,
            currency,
            totalSaved: total as number,
            organizerFee: organizerFee,
            netPayout: (total as number) - organizerFee,
            daysContributed: days
          });
        }
      }
      
      console.log(`✅ Payout preview complete: ${payoutItems.length} members with data to payout`);
      return payoutItems;
    } catch (error) {
      console.error('❌ previewCyclePayout error:', error);
      throw error;
    }
  },

  finalizePayout: async (groupId: string, items: PayoutItem[]) => {
    console.log('Finalizing payout with items:', items);
    
    const totalFeeRWF = items.filter(i => i.currency === 'RWF').reduce((sum, i) => sum + i.organizerFee, 0);
    console.log('Total organizer fee (RWF):', totalFeeRWF);
    
    const { data: group } = await supabase.from('groups').select('current_cycle').eq('id', groupId).single();
    const currentCycle = group?.current_cycle || 1;
    
    const payoutData = {
      group_id: groupId,
      cycle_number: currentCycle,
      payout_date: new Date().toISOString(),
      organizer_fee_total_rwf: totalFeeRWF,
      total_distributed_count: items.length,
      status: 'CALCULATED'
    };
    
    console.log('Payout data to insert:', payoutData);
    
    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .insert(payoutData)
      .select()
      .single();
    
    if (payoutError) {
      console.error('Payout insert error:', payoutError);
      throw payoutError;
    }
    
    console.log('Payout created:', payout);
    
    const dbItems = items.map(item => ({
      payout_id: payout.id,
      membership_id: item.membershipId,
      currency: item.currency,
      days_contributed: item.daysContributed,
      gross_amount: item.totalSaved,
      organizer_fee: item.organizerFee,
      net_amount: item.netPayout,
      disbursement_status: 'PENDING'
    }));
    
    const { error: itemsError } = await supabase.from('payout_items').insert(dbItems);
    if (itemsError) {
      console.error('Payout items insert error:', itemsError);
      throw itemsError;
    }
    
    // CRITICAL: Set current_cycle_start_date to tomorrow (not today) to ensure
    // the new cycle doesn't include any data from the finalized cycle.
    // This prevents showing old cycle data when previewing the next cycle.
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set to midnight
    
    const { error: updateError } = await supabase
      .from('groups')
      .update({
        current_cycle: currentCycle + 1,
        current_cycle_start_date: tomorrow.toISOString()
      })
      .eq('id', groupId);
    
    if (updateError) {
      console.error('Group update error:', updateError);
      throw updateError;
    }
    
    console.log('Payout finalized successfully');
    return payout;
  },

  /**
   * START NEXT CYCLE: Confirm the next cycle is ready (finalizePayout already incremented it)
   * NOTE: finalizePayout() already handles incrementing the cycle and setting the date.
   * This function now only logs confirmation for the user.
   */
  startNextCycle: async (groupId: string) => {
    // Get current cycle info (should be already incremented by finalizePayout)
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('current_cycle, cycle_number, current_cycle_start_date')
      .eq('id', groupId)
      .single();
    
    if (groupError) throw groupError;
    
    const currentCycle = group?.cycle_number || group?.current_cycle || 1;
    
    console.log(`✅ Next Cycle Ready`);
    console.log(`   Cycle Number: ${currentCycle}`);
    console.log(`   Start Date: ${group?.current_cycle_start_date}`);
    console.log(`   Status: ACTIVE`);
    
    return { cycleNumber: currentCycle, startDate: group?.current_cycle_start_date };
  }
};