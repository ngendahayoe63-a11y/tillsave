import { supabase } from '@/api/supabase';
import { smsService } from './smsService';

export interface PayoutCalculation {
  memberId: string;
  memberName: string;
  memberPhone: string;
  totalAmount: number;
  currency: string;
  paymentCount: number;
  averagePayment: number;
  cycleStartDate: string;
  cycleEndDate: string;
  payoutEligible: boolean;
}

export interface PayoutHistory {
  id: string;
  cycleStart: string;
  cycleEnd: string;
  amount: number;
  currency: string;
  status: string;
  payoutDate?: string;
  memberName: string;
}

export interface MemberStatistics {
  totalSaved: number;
  totalPayouts: number;
  paymentCount: number;
  consistencyScore: number;
  lastPaymentDate?: string;
  missedCycles: number;
}

class OrganizerOnlyPayoutService {
  /**
   * Calculate payouts for all members in a group for a completed cycle
   */
  async calculateCyclePayouts(
    groupId: string,
    cycleStartDate: string,
    cycleEndDate: string,
    minimumPayments: number = 1
  ): Promise<PayoutCalculation[]> {
    try {
      // Get all active members
      const { data: members, error: membersError } = await supabase
        .from('organizer_only_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('is_active', true);

      if (membersError) throw membersError;

      const payouts: PayoutCalculation[] = [];

      for (const member of members || []) {
        // Get payments for this member in the cycle
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .eq('organizer_only_member_id', member.id)
          .eq('group_id', groupId)
          .eq('status', 'CONFIRMED')
          .gte('payment_date', cycleStartDate)
          .lte('payment_date', cycleEndDate);

        if (paymentsError) throw paymentsError;

        const paymentList = payments || [];
        const paymentCount = paymentList.length;

        if (paymentCount >= minimumPayments) {
          const totalAmount = paymentList.reduce((sum, p) => sum + p.amount, 0);
          const averagePayment = totalAmount / paymentCount;

          payouts.push({
            memberId: member.id,
            memberName: member.name,
            memberPhone: member.phone_number,
            totalAmount,
            currency: member.currency || 'RWF',
            paymentCount,
            averagePayment,
            cycleStartDate,
            cycleEndDate,
            payoutEligible: true
          });
        }
      }

      return payouts;
    } catch (err) {
      console.error('Error calculating payouts:', err);
      throw err;
    }
  }

  /**
   * Create payout records for cycle
   */
  async createPayoutsForCycle(
    groupId: string,
    cycleStartDate: string,
    cycleEndDate: string,
    payouts: PayoutCalculation[]
  ): Promise<string[]> {
    try {
      const payoutIds: string[] = [];

      for (const payout of payouts) {
        const { data, error } = await supabase
          .from('organizer_only_payouts')
          .insert({
            group_id: groupId,
            organizer_only_member_id: payout.memberId,
            cycle_start_date: cycleStartDate,
            cycle_end_date: cycleEndDate,
            total_amount: payout.totalAmount,
            currency: payout.currency,
            payment_count: payout.paymentCount,
            average_payment: payout.averagePayment,
            status: 'READY'
          })
          .select()
          .single();

        if (error) throw error;
        payoutIds.push(data.id);
      }

      return payoutIds;
    } catch (err) {
      console.error('Error creating payouts:', err);
      throw err;
    }
  }

  /**
   * Mark payout as paid
   */
  async markPayoutAsPaid(
    payoutId: string,
    paymentMethod: string = 'CASH',
    notes?: string
  ): Promise<void> {
    try {
      // Get payout details
      const { data: payout, error: getError } = await supabase
        .from('organizer_only_payouts')
        .select('*')
        .eq('id', payoutId)
        .single();

      if (getError) throw getError;

      // Update payout status
      const { error: updateError } = await supabase
        .from('organizer_only_payouts')
        .update({
          status: 'PAID',
          payout_date: new Date().toISOString(),
          payment_method: paymentMethod,
          notes
        })
        .eq('id', payoutId);

      if (updateError) throw updateError;

      // Create disbursement record
      await supabase
        .from('payout_disbursements')
        .insert({
          payout_id: payoutId,
          group_id: payout.group_id,
          organizer_only_member_id: payout.organizer_only_member_id,
          amount: payout.total_amount,
          currency: payout.currency,
          disburse_date: new Date().toISOString(),
          status: 'COMPLETED',
          notes
        });

      // Update member total payouts
      const { data: member, error: memberError } = await supabase
        .from('organizer_only_members')
        .select('total_payouts')
        .eq('id', payout.organizer_only_member_id)
        .single();

      if (memberError) throw memberError;

      const newTotal = (member.total_payouts || 0) + payout.total_amount;

      await supabase
        .from('organizer_only_members')
        .update({
          total_payouts: newTotal,
          last_payout_date: new Date().toISOString(),
          payout_status: 'PAID'
        })
        .eq('id', payout.organizer_only_member_id);

      // Send payout SMS
      const { data: fullMember } = await supabase
        .from('organizer_only_members')
        .select('*')
        .eq('id', payout.organizer_only_member_id)
        .single();

      if (fullMember?.phone_number) {
        const groupData = await supabase
          .from('groups')
          .select('name')
          .eq('id', payout.group_id)
          .single();

        const groupName = groupData.data?.name || 'TillSave';

        const message = smsService.formatPayoutSMS(
          fullMember.name,
          payout.total_amount,
          payout.currency,
          groupName
        );

        smsService.queueSMS({
          to: fullMember.phone_number,
          message,
          groupId: payout.group_id,
          memberId: payout.organizer_only_member_id,
          messageType: 'CYCLE_PAYOUT',
          metadata: { payoutId, amount: payout.total_amount }
        }).catch(err => console.error('Failed to queue payout SMS:', err));
      }
    } catch (err) {
      console.error('Error marking payout as paid:', err);
      throw err;
    }
  }

  /**
   * Get payout history for a member
   */
  async getMemberPayoutHistory(memberId: string): Promise<PayoutHistory[]> {
    try {
      const { data, error } = await supabase
        .from('organizer_only_payouts')
        .select(`
          id,
          cycle_start_date,
          cycle_end_date,
          total_amount,
          currency,
          status,
          payout_date,
          organizer_only_members(name)
        `)
        .eq('organizer_only_member_id', memberId)
        .order('cycle_start_date', { ascending: false });

      if (error) throw error;

      return (data || []).map(payout => ({
        id: payout.id,
        cycleStart: payout.cycle_start_date,
        cycleEnd: payout.cycle_end_date,
        amount: payout.total_amount,
        currency: payout.currency,
        status: payout.status,
        payoutDate: payout.payout_date,
        memberName: (payout as any).organizer_only_members?.name || ''
      }));
    } catch (err) {
      console.error('Error fetching payout history:', err);
      throw err;
    }
  }

  /**
   * Get group payout summary
   */
  async getGroupPayoutSummary(groupId: string) {
    try {
      const { data, error } = await supabase
        .from('organizer_only_payouts')
        .select('*')
        .eq('group_id', groupId);

      if (error) throw error;

      const payouts = data || [];
      const summary = {
        totalPayouts: payouts.reduce((sum, p) => sum + p.total_amount, 0),
        payoutCount: payouts.length,
        readyForPayout: payouts.filter(p => p.status === 'READY').length,
        alreadyPaid: payouts.filter(p => p.status === 'PAID').length,
        currencyBreakdown: {} as Record<string, number>
      };

      payouts.forEach(payout => {
        if (!summary.currencyBreakdown[payout.currency]) {
          summary.currencyBreakdown[payout.currency] = 0;
        }
        summary.currencyBreakdown[payout.currency] += payout.total_amount;
      });

      return summary;
    } catch (err) {
      console.error('Error fetching payout summary:', err);
      throw err;
    }
  }

  /**
   * Calculate member statistics for a period
   */
  async calculateMemberStatistics(
    groupId: string,
    memberId: string,
    periodStartDate: string,
    periodEndDate: string
  ): Promise<MemberStatistics> {
    try {
      // Get all payments for period
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('organizer_only_member_id', memberId)
        .eq('group_id', groupId)
        .gte('payment_date', periodStartDate)
        .lte('payment_date', periodEndDate);

      if (paymentsError) throw paymentsError;

      const paymentList = payments || [];
      const totalSaved = paymentList.reduce((sum, p) => sum + p.amount, 0);
      const paymentCount = paymentList.length;

      // Get payout history
      const { data: payouts, error: payoutsError } = await supabase
        .from('organizer_only_payouts')
        .select('*')
        .eq('organizer_only_member_id', memberId)
        .eq('group_id', groupId)
        .gte('cycle_start_date', periodStartDate)
        .lte('cycle_end_date', periodEndDate);

      if (payoutsError) throw payoutsError;

      const totalPayouts = (payouts || []).reduce((sum, p) => sum + p.total_amount, 0);

      // Calculate last payment date
      const lastPayment = paymentList.sort((a, b) => 
        new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
      )[0];

      // Simple consistency score (payment regularity)
      const daysDiff = Math.floor((new Date(periodEndDate).getTime() - new Date(periodStartDate).getTime()) / (1000 * 60 * 60 * 24));
      const consistencyScore = paymentCount > 0 ? Math.min(1.0, paymentCount / (daysDiff / 7)) : 0;

      return {
        totalSaved,
        totalPayouts,
        paymentCount,
        consistencyScore: parseFloat(consistencyScore.toFixed(2)),
        lastPaymentDate: lastPayment?.payment_date,
        missedCycles: 0
      };
    } catch (err) {
      console.error('Error calculating member statistics:', err);
      throw err;
    }
  }

  /**
   * Get payment trends for a member
   */
  async getMemberPaymentTrends(memberId: string, months: number = 6) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('organizer_only_member_id', memberId)
        .gte('payment_date', startDate.toISOString())
        .lte('payment_date', endDate.toISOString())
        .order('payment_date', { ascending: true });

      if (error) throw error;

      // Group payments by month
      const trends: Record<string, { amount: number; count: number }> = {};

      (data || []).forEach(payment => {
        const date = new Date(payment.payment_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!trends[monthKey]) {
          trends[monthKey] = { amount: 0, count: 0 };
        }
        trends[monthKey].amount += payment.amount;
        trends[monthKey].count += 1;
      });

      return trends;
    } catch (err) {
      console.error('Error fetching payment trends:', err);
      throw err;
    }
  }

  /**
   * Get SMS delivery analytics
   */
  async getSMSAnalytics(groupId: string) {
    try {
      const { data, error } = await supabase
        .from('sms_logs')
        .select('*')
        .eq('group_id', groupId);

      if (error) throw error;

      const logs = data || [];
      const analytics = {
        totalSent: logs.length,
        sent: logs.filter(l => l.status === 'SENT').length,
        failed: logs.filter(l => l.status === 'FAILED').length,
        pending: logs.filter(l => l.status === 'PENDING').length,
        deliveryRate: logs.length > 0 ? (logs.filter(l => l.status === 'SENT').length / logs.length * 100).toFixed(2) : '0',
        byType: {} as Record<string, number>,
        recentFailed: logs.filter(l => l.status === 'FAILED').slice(0, 5)
      };

      logs.forEach(log => {
        if (!analytics.byType[log.message_type]) {
          analytics.byType[log.message_type] = 0;
        }
        analytics.byType[log.message_type] += 1;
      });

      return analytics;
    } catch (err) {
      console.error('Error fetching SMS analytics:', err);
      throw err;
    }
  }
}

export const organizerOnlyPayoutService = new OrganizerOnlyPayoutService();
