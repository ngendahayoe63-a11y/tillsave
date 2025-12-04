import { supabase } from '@/api/supabase';

export const paymentsService = {
  /**
   * Upload Receipt Image
   */
  uploadReceipt: async (file: File, paymentId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${paymentId}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  /**
   * Record a new payment (Now supports Receipt URL)
   */
  recordPayment: async (
    membershipId: string,
    groupId: string,
    amount: number,
    currency: string,
    recorderId: string,
    date: Date,
    receiptFile?: File // Optional file
  ) => {
    // 1. Insert the payment record first to get an ID
    const { data, error } = await supabase
      .from('payments')
      .insert({
        membership_id: membershipId,
        group_id: groupId,
        amount: amount,
        currency: currency,
        recorded_by: recorderId,
        payment_date: date.toISOString().split('T')[0],
        status: 'CONFIRMED',
        payment_method: 'CASH'
      })
      .select()
      .single();

    if (error) throw error;

    // 2. If there is a file, upload it and update the record
    if (receiptFile && data) {
      const publicUrl = await paymentsService.uploadReceipt(receiptFile, data.id);
      
      await supabase
        .from('payments')
        .update({ receipt_url: publicUrl })
        .eq('id', data.id);
    }

    return data;
  },

  // ... (Keep getMembershipPayments, getPaymentById, updatePayment, deletePayment exactly as they were)
  getMembershipPayments: async (membershipId: string) => {
    const { data, error } = await supabase.from('payments').select('*').eq('membership_id', membershipId).order('payment_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  getPaymentById: async (paymentId: string) => {
    const { data, error } = await supabase.from('payments').select('*').eq('id', paymentId).single();
    if (error) throw error;
    return data;
  },

  updatePayment: async (paymentId: string, amount: number, date: Date) => {
    const { data, error } = await supabase.from('payments').update({ amount, payment_date: date.toISOString().split('T')[0] }).eq('id', paymentId).select().single();
    if (error) throw error;
    return data;
  },

  deletePayment: async (paymentId: string) => {
    const { error } = await supabase.from('payments').delete().eq('id', paymentId);
    if (error) throw error;
  }
};