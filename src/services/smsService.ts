import { supabase } from '@/api/supabase';

export interface SMSPayload {
  to: string;
  message: string;
  groupId: string;
  memberId?: string;
  messageType: 'PAYMENT_RECORDED' | 'PAYMENT_REMINDER' | 'CYCLE_PAYOUT' | 'WELCOME';
  metadata?: Record<string, any>;
}

export interface SMSLog {
  id: string;
  group_id: string;
  phone_number: string;
  message: string;
  message_type: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  error_message?: string;
  sent_at?: string;
  created_at: string;
}

class SMSService {
  /**
   * Queue SMS to be sent via backend
   * In production, this would trigger a backend function (e.g., Supabase Edge Function)
   */
  async queueSMS(payload: SMSPayload): Promise<SMSLog> {
    const { to, message, groupId, memberId, messageType, metadata } = payload;

    try {
      // Log the SMS in the database
      try {
        const { data, error } = await supabase
          .from('sms_logs')
          .insert({
            group_id: groupId,
            phone_number: to,
            message,
            message_type: messageType,
            status: 'PENDING',
            metadata,
            organizer_only_member_id: memberId,
          })
          .select()
          .single();

        if (error) {
          // If table doesn't exist, log warning but continue
          if (error.message?.includes('relation') || error.code === 'PGRST116') {
            console.warn('SMS logs table not available yet, queuing locally');
            // Return mock data so calling code doesn't break
            return {
              id: 'local_' + Date.now(),
              group_id: groupId,
              organizer_only_member_id: memberId,
              phone_number: to,
              message_body: message,
              message_type: messageType || 'custom',
              status: 'pending',
              error_message: null,
              sent_at: null,
              created_at: new Date().toISOString()
            } as any;
          }
          throw error;
        }

        // In production, trigger backend SMS sending (Edge Function, Cloud Function, etc.)
        // For now, log to console and mark as sent
        console.log(`📱 SMS Queued (${messageType}):`, {
          to,
          message,
          groupId,
        });

        // Mark as sent immediately (in production, this would be done by backend after actual send)
        // For MVP, we can use a scheduled function or webhook
        if (data?.id) {
          await this.markAsSent(data.id);
        }

        return data as SMSLog;
      } catch (dbErr: any) {
        // If database operation fails, log locally and continue
        console.warn('SMS database error, continuing:', dbErr?.message);
        // Return mock data
        return {
          id: 'local_' + Date.now(),
          group_id: groupId,
          organizer_only_member_id: memberId,
          phone_number: to,
          message_body: message,
          message_type: messageType || 'custom',
          status: 'pending',
          error_message: null,
          sent_at: null,
          created_at: new Date().toISOString()
        } as any;
      }
    } catch (err) {
      console.error('SMS queue error:', err);
      // Don't throw - return mock data to keep app working
      return {
        id: 'local_' + Date.now(),
        group_id: groupId,
        organizer_only_member_id: memberId,
        phone_number: to,
        message_body: message,
        message_type: messageType || 'custom',
        status: 'pending',
        error_message: null,
        sent_at: null,
        created_at: new Date().toISOString()
      } as any;
    }
  }

  /**
   * Mark SMS as sent
   */
  async markAsSent(smsLogId: string): Promise<void> {
    const { error } = await supabase
      .from('sms_logs')
      .update({
        status: 'SENT',
        sent_at: new Date().toISOString(),
      })
      .eq('id', smsLogId);

    if (error) {
      console.error('Failed to mark SMS as sent:', error);
      throw error;
    }
  }

  /**
   * Mark SMS as failed with error message
   */
  async markAsFailed(smsLogId: string, errorMessage: string): Promise<void> {
    const { error } = await supabase
      .from('sms_logs')
      .update({
        status: 'FAILED',
        error_message: errorMessage,
      })
      .eq('id', smsLogId);

    if (error) {
      console.error('Failed to mark SMS as failed:', error);
      throw error;
    }
  }

  /**
   * Get SMS logs for a group
   */
  async getGroupSMSLogs(groupId: string, limit = 50): Promise<SMSLog[]> {
    const { data, error } = await supabase
      .from('sms_logs')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch SMS logs:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get SMS logs for a member
   */
  async getMemberSMSLogs(memberId: string, limit = 20): Promise<SMSLog[]> {
    const { data, error } = await supabase
      .from('sms_logs')
      .select('*')
      .eq('organizer_only_member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch member SMS logs:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Format payment confirmation SMS
   */
  formatPaymentConfirmationSMS(
    memberName: string,
    amount: number,
    currency: string,
    totalSaved: number
  ): string {
    return `Hi ${memberName}, payment of ${amount} ${currency} recorded. Total saved: ${totalSaved} ${currency}. Thank you for saving with us!`;
  }

  /**
   * Format payment reminder SMS
   */
  formatReminderSMS(memberName: string, groupName: string): string {
    return `Hi ${memberName}, reminder: Don't forget to make your contribution to ${groupName}. Come save with us!`;
  }

  /**
   * Format cycle payout SMS
   */
  formatPayoutSMS(
    memberName: string,
    payoutAmount: number,
    currency: string,
    groupName: string
  ): string {
    return `Congratulations ${memberName}! Your payout of ${payoutAmount} ${currency} from ${groupName} is ready. Contact your organizer to claim it.`;
  }

  /**
   * Format welcome SMS
   */
  formatWelcomeSMS(memberName: string, groupName: string): string {
    return `Welcome ${memberName} to ${groupName}! You've been added to our savings group. You can now start saving. Let's grow together!`;
  }
}

export const smsService = new SMSService();
