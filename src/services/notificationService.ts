import { supabase } from '@/api/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface PaymentNotification {
  type: 'payment_recorded' | 'cycle_finalized' | 'member_joined';
  membershipId?: string;
  groupId: string;
  amount?: number;
  currency?: string;
  memberName?: string;
  paymentDate?: string;
  cycleNumber?: number;
  payoutAmount?: number;
}

export interface NotificationCallback {
  (notification: PaymentNotification): void;
}

class NotificationService {
  private subscriptions: Map<string, RealtimeChannel> = new Map();

  /**
   * Subscribe to payment changes for a specific group
   * Listens for new payments and notifies members
   */
  subscribeToPayments(groupId: string, callback: NotificationCallback) {
    const channelName = `payments-${groupId}`;
    
    // Avoid duplicate subscriptions
    if (this.subscriptions.has(channelName)) {
      return;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payments',
          filter: `group_id=eq.${groupId}`,
        },
        (payload: any) => {
          // Don't notify about archived payments (from cycle finalization)
          if (payload.new.archived) {
            return;
          }

          callback({
            type: 'payment_recorded',
            membershipId: payload.new.membership_id,
            groupId: payload.new.group_id,
            amount: payload.new.amount,
            currency: payload.new.currency,
            paymentDate: payload.new.payment_date,
          });
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);
  }

  /**
   * Subscribe to payout changes for a specific group
   * Notifies members when cycle is finalized
   */
  subscribeToPayouts(groupId: string, callback: NotificationCallback) {
    const channelName = `payouts-${groupId}`;

    if (this.subscriptions.has(channelName)) {
      return;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payouts',
          filter: `group_id=eq.${groupId}`,
        },
        (payload: any) => {
          callback({
            type: 'cycle_finalized',
            groupId: payload.new.group_id,
            cycleNumber: payload.new.cycle_number,
            payoutAmount: payload.new.total_payout_amount,
          });
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);
  }

  /**
   * Subscribe to member's payment notifications
   * Listens for payments on all groups the member belongs to
   */
  subscribeToMemberPayments(membershipIds: string[], callback: NotificationCallback) {
    membershipIds.forEach((membershipId) => {
      const channelName = `member-payments-${membershipId}`;

      if (this.subscriptions.has(channelName)) {
        return;
      }

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'payments',
            filter: `membership_id=eq.${membershipId}`,
          },
          (payload: any) => {
            if (payload.new.archived) {
              return;
            }

            callback({
              type: 'payment_recorded',
              membershipId: payload.new.membership_id,
              groupId: payload.new.group_id,
              amount: payload.new.amount,
              currency: payload.new.currency,
              paymentDate: payload.new.payment_date,
            });
          }
        )
        .subscribe();

      this.subscriptions.set(channelName, channel);
    });
  }

  /**
   * Subscribe to member joins for a specific group
   * Notifies organizer when new members join their group
   */
  subscribeToMemberJoins(groupId: string, callback: NotificationCallback) {
    const channelName = `member-joins-${groupId}`;

    if (this.subscriptions.has(channelName)) {
      return;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'memberships',
          filter: `group_id=eq.${groupId}`,
        },
        async (payload: any) => {
          // Skip notifications for organizer membership
          if (payload.new.role === 'ORGANIZER') {
            return;
          }

          // Fetch member name for notification
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('name')
              .eq('id', payload.new.user_id)
              .single();

            callback({
              type: 'member_joined',
              membershipId: payload.new.id,
              groupId: payload.new.group_id,
              memberName: userData?.name || 'New Member',
            });
          } catch (err) {
            console.error('Error fetching member name:', err);
            callback({
              type: 'member_joined',
              membershipId: payload.new.id,
              groupId: payload.new.group_id,
              memberName: 'New Member',
            });
          }
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);
  }

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(channelName: string) {
    const channel = this.subscriptions.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.subscriptions.delete(channelName);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll() {
    this.subscriptions.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.subscriptions.clear();
  }
}

export const notificationService = new NotificationService();
