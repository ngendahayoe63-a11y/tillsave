import { supabase } from '@/api/supabase';

// Helper to generate a random 6-character code
const generateJoinCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const groupsService = {
  /**
   * Create a new Savings Group
   */
  createGroup: async (organizerId: string, name: string, cycleDays: number = 30) => {
    let joinCode = generateJoinCode();
    let isUnique = false;

    // Keep generating codes until we find a unique one
    while (!isUnique) {
      const { data } = await supabase
        .from('groups')
        .select('id')
        .eq('join_code', joinCode)
        .single();
      
      if (!data) isUnique = true;
      else joinCode = generateJoinCode();
    }

    const { data: group, error } = await supabase
      .from('groups')
      .insert({
        organizer_id: organizerId,
        name,
        join_code: joinCode,
        cycle_days: cycleDays,
        status: 'ACTIVE'
      })
      .select()
      .single();

    if (error) throw error;
    return group;
  },

  /**
   * Update Group Details
   */
  updateGroup: async (groupId: string, name: string, cycleDays: number) => {
    const { data, error } = await supabase
      .from('groups')
      .update({
        name,
        cycle_days: cycleDays
      })
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete Group
   */
  deleteGroup: async (groupId: string) => {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;
  },

  /**
   * Join a Group using a Code (Using Secure RPC)
   */
  joinGroup: async (userId: string, joinCode: string) => {
    const { data, error } = await supabase.rpc('join_group_via_code', {
      p_user_id: userId,
      p_join_code: joinCode
    });

    if (error) throw error;
    return data;
  },

  /**
   * Get all groups for a user (Organizer or Member)
   */
  getUserGroups: async (userId: string, role: 'ORGANIZER' | 'MEMBER') => {
    if (role === 'ORGANIZER') {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('organizer_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('memberships')
        .select(`
          group_id,
          groups:group_id (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'ACTIVE');
        
      if (error) throw error;
      
      return data
        .map((item: any) => item.groups)
        .filter((group: any) => group !== null);
    }
  },

  /**
   * Get Single Group Details
   */
  getGroupDetails: async (groupId: string) => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();
      
    if (error) throw error;
    return data;
  },

  /**
   * Get Members of a Group (with User profiles)
   */
  getGroupMembers: async (groupId: string) => {
    const { data, error } = await supabase
      .from('memberships')
      .select(`
        id,
        status,
        joined_at,
        users:user_id (
          id,
          name,
          phone,
          email
        )
      `)
      .eq('group_id', groupId)
      .eq('status', 'ACTIVE');

    if (error) throw error;
    return data;
  }
};