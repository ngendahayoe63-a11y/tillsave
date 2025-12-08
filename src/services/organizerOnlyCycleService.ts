import { supabase } from '@/api/supabase';

interface CycleReport {
  groupId: string;
  groupName: string;
  cycleNumber: number;
  cycleStartDate: string;
  cycleEndDate: string;
  currency: string;
  members: Array<{
    id: string;
    name: string;
    phone_number: string;
    totalSaved: number;
    paymentCount: number;
    organizerFee: number;
    netPayout: number;
    status: 'paid' | 'pending';
  }>;
  totals: {
    totalCollected: number;
    memberCount: number;
    paymentCount: number;
    totalFees?: number;
    netAmount?: number;
  };
}

export const organizerOnlyCycleService = {
  /**
   * End current cycle and mark members as paid
   */
  endCycle: async (groupId: string) => {
    let group: any = null;
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;
      group = groupData;

      // Get all members and their payments for current cycle
      const { data: members, error: membersError } = await supabase
        .from('organizer_only_members')
        .select('id, name, phone_number')
        .eq('group_id', groupId)
        .eq('is_active', true);

      if (membersError) throw membersError;

      // Check if anyone saved money - deny cycle end if no one saved
      let totalCycleSavings = 0;
      const payoutPromises = (members || []).map(async (member: any) => {
        const { data: payments } = await supabase
          .from('payments')
          .select('*')
          .eq('organizer_only_member_id', member.id)
          .eq('group_id', groupId)
          .gte('payment_date', group.current_cycle_start_date)
          .lte('payment_date', new Date().toISOString());

        const totalAmount = (payments || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        const paymentCount = payments?.length || 0;

        // Track total to validate later
        totalCycleSavings += totalAmount;

        // Create payout record if there are payments
        if (totalAmount > 0) {
          try {
            await supabase.from('organizer_only_payouts').insert({
              group_id: groupId,
              organizer_only_member_id: member.id,
              cycle_number: group.current_cycle,
              cycle_start_date: group.current_cycle_start_date,
              cycle_end_date: new Date().toISOString(),
              total_amount: totalAmount,
              payment_count: paymentCount,
              currency: group.currency || 'RWF',
              status: 'READY',
              created_at: new Date().toISOString()
            });
          } catch (err: any) {
            // Payout table may not exist yet, which is okay
            console.warn('Warning: Could not save payout record:', err.message);
          }
        }

        return {
          memberId: member.id,
          totalAmount,
          paymentCount
        };
      });

      await Promise.all(payoutPromises);

      // VALIDATION: Deny cycle end if no one saved money
      if (totalCycleSavings <= 0) {
        throw new Error('Cannot end cycle: No members have made payments in this cycle. At least one payment is required to proceed.');
      }

      // Update group to next cycle
      const nextCycleStartDate = new Date();
      const updateData: any = {
        current_cycle: (group.current_cycle || 1) + 1,
        current_cycle_start_date: nextCycleStartDate.toISOString()
      };
      
      // Only include updated_at if the column exists
      // The migration 010 adds this column, but we handle gracefully if not yet applied
      try {
        updateData.updated_at = new Date().toISOString();
      } catch {
        // Column doesn't exist yet, skip it
      }

      const { error: updateError } = await supabase
        .from('groups')
        .update(updateData)
        .eq('id', groupId);

      if (updateError) {
        // If it's specifically the updated_at column error, retry without it
        if (updateError.message?.includes('updated_at')) {
          const { error: retryError } = await supabase
            .from('groups')
            .update({
              current_cycle: (group.current_cycle || 1) + 1,
              current_cycle_start_date: nextCycleStartDate.toISOString()
            })
            .eq('id', groupId);
          
          if (retryError) throw retryError;
        } else {
          throw updateError;
        }
      }

      return {
        success: true,
        nextCycle: (group.current_cycle || 1) + 1,
        cycleStartDate: nextCycleStartDate
      };
    } catch (err: any) {
      console.error('Error ending cycle:', err);
      // If payout table doesn't exist, that's okay - cycle still ended
      if (err.message?.includes('organizer_only_payouts') || err.code === 'PGRST204') {
        console.warn('⚠️ Warning: organizer_only_payouts table may not exist yet. Cycle ended but payout records not saved.');
        return {
          success: true,
          nextCycle: (group?.current_cycle || 1) + 1,
          cycleStartDate: new Date()
        };
      }
      throw err;
    }
  },

  /**
   * Generate cycle report with all transaction details
   */
  generateCycleReport: async (groupId: string, cycleNumber?: number): Promise<CycleReport> => {
    try {
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      // Get all members
      const { data: members, error: membersError } = await supabase
        .from('organizer_only_members')
        .select('id, name, phone_number, is_active')
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      const cycle = cycleNumber || group.current_cycle;
      const cycleEndDate = new Date();

      // Get payouts for this cycle (if table exists)
      let payoutMap = new Map();
      try {
        const { data: payouts, error: payoutsError } = await supabase
          .from('organizer_only_payouts')
          .select('*')
          .eq('group_id', groupId)
          .eq('cycle_number', cycle);

        // If no error and we have payouts, build the map
        if (!payoutsError && payouts) {
          payoutMap = new Map(
            (payouts || []).map((p: any) => [p.organizer_only_member_id, p])
          );
        }
      } catch (err) {
        // Table might not exist yet, continue without it
        console.warn('Organizer payouts table not available yet');
      }

      // Build member details with fee calculations
      const memberDetails = await Promise.all(
        (members || []).map(async (member: any) => {
          const { data: payments } = await supabase
            .from('payments')
            .select('*')
            .eq('organizer_only_member_id', member.id)
            .eq('group_id', groupId)
            .gte('payment_date', group.current_cycle_start_date)
            .lte('payment_date', cycleEndDate.toISOString());

          const safePayments = payments || [];
          const totalSaved = safePayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
          const paymentCount = safePayments.length;
          
          // Calculate organizer fee: 1 day's worth of contributions = organizer fee
          // Calculate daily rate = total / number of payments (days)
          let organizerFee = 0;
          if (paymentCount > 0) {
            const dailyRate = Math.round(totalSaved / paymentCount);
            organizerFee = dailyRate; // Fee is 1 day's worth
          }
          
          const netPayout = totalSaved - organizerFee;
          const payout = payoutMap.get(member.id);

          return {
            id: member.id,
            name: member.name,
            phone_number: member.phone_number,
            totalSaved,
            paymentCount,
            organizerFee,
            netPayout,
            status: (payout?.status === 'PAID' ? 'paid' : 'pending') as 'paid' | 'pending'
          };
        })
      );

      // Calculate totals
      const totalCollected = memberDetails.reduce((sum: number, m: any) => sum + m.totalSaved, 0);
      const totalPayments = memberDetails.reduce((sum: number, m: any) => sum + m.paymentCount, 0);
      const totalFees = memberDetails.reduce((sum: number, m: any) => sum + m.organizerFee, 0);
      const netAmount = memberDetails.reduce((sum: number, m: any) => sum + m.netPayout, 0);
      const activeMemberCount = memberDetails.filter((m: any) => m.totalSaved > 0).length;

      return {
        groupId,
        groupName: group.name,
        cycleNumber: cycle,
        cycleStartDate: group.current_cycle_start_date,
        cycleEndDate: cycleEndDate.toISOString(),
        currency: group.currency || 'RWF',
        members: memberDetails,
        totals: {
          totalCollected,
          memberCount: activeMemberCount,
          paymentCount: totalPayments,
          totalFees,
          netAmount
        }
      };
    } catch (err) {
      console.error('Error generating cycle report:', err);
      throw err;
    }
  },

  /**
   * Mark member payout as paid
   */
  markPayoutAsPaid: async (payoutId: string, paymentDate: Date) => {
    try {
      const { error } = await supabase
        .from('organizer_only_payouts')
        .update({
          status: 'PAID',
          payout_date: paymentDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', payoutId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error marking payout as paid:', err);
      throw err;
    }
  }
};
