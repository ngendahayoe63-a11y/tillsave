import { supabase } from '@/api/supabase';

export const profileService = {
  /**
   * Update text fields (Name, Bio, etc.)
   */
  updateProfile: async (userId: string, updates: { name?: string; bio?: string; phone?: string }) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Upload Avatar Image
   * Path format: avatars/{userId}/{timestamp}.png
   */
  uploadAvatar: async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // 1. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // 3. Save URL to User Profile
    await supabase
      .from('users')
      .update({ avatar_url: data.publicUrl })
      .eq('id', userId);

    return data.publicUrl;
  }
};