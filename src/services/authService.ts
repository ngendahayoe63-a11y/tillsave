import { supabase } from '@/api/supabase';
import { UserProfile } from '@/types';
import { hashPin } from '@/lib/crypto'; // Import hashing logic

export const authService = {
  // ... (Keep ALL existing functions: signUp, signIn, resetPassword, etc.)
  signUpWithEmail: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  signInWithEmail: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data as UserProfile;
  },

  createUserProfile: async (profile: Partial<UserProfile>) => {
    const { data, error } = await supabase.from('users').insert([profile]).select().single();
    if (error) throw error;
    return data as UserProfile;
  },

  checkUserExists: async (email: string): Promise<boolean> => {
    return false; 
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  resetPasswordForEmail: async (email: string) => {
    const redirectTo = `${window.location.origin}/auth/update-password`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
    return data;
  },

  updatePassword: async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  },

  // --- NEW: UPDATE PIN ---
  updatePin: async (userId: string, newPin: string) => {
    // 1. Hash the PIN
    const hashedPin = await hashPin(newPin);

    // 2. Update DB
    const { error } = await supabase
      .from('users')
      .update({ pin_hash: hashedPin })
      .eq('id', userId);

    if (error) throw error;
  }
};