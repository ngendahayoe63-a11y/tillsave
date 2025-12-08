import { supabase } from '@/api/supabase';
import { GroupType } from '@/types';

// Helper to generate a random 6-character code
const generateJoinCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const groupsService = {
  /**
   * Create a new Savings Group (organizer is automatically added as a member)
   */
  createGroup: async (organizerId: string, name: string, cycleDays: number = 30, groupType: GroupType = 'FULL_PLATFORM') => {
    let joinCode = generateJoinCode();
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    // Keep generating codes until we find a unique one (max 10 attempts)
    while (!isUnique && attempts < maxAttempts) {
      try {
        const { data, error } = await supabase
          .from('groups')
          .select('id')
          .eq('join_code', joinCode)
          .single();
        
        // If error is "no rows returned", code is unique
        if (error?.code === 'PGRST116') {
          isUnique = true;
        } else if (!data && !error) {
          // No data and no error = code is unique
          isUnique = true;
        } else if (data) {
          // Code already exists, generate new one
          joinCode = generateJoinCode();
        }
      } catch (err) {
        // On any error, assume code is unique and continue
        // (better to have rare duplicates than block group creation)
        isUnique = true;
      }
      attempts++;
    }

    // If we hit max attempts, just use the current code
    if (!isUnique) {
      console.warn('⚠️ Join code uniqueness check failed, using generated code anyway');
    }

    // Set current_cycle_start_date to today so payment filtering works correctly from day 1
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const { data: group, error } = await supabase
      .from('groups')
      .insert({
        organizer_id: organizerId,
        name,
        join_code: joinCode,
        cycle_days: cycleDays,
        group_type: groupType,
        status: 'ACTIVE',
        current_cycle: 1,
        current_cycle_start_date: todayISO
      })
      .select()
      .single();

    if (error) throw error;

    // Automatically add organizer as a member
    if (groupType === 'FULL_PLATFORM') {
      // Full Platform: Add to memberships table
      try {
        await supabase
          .from('memberships')
          .insert({
            group_id: group.id,
            user_id: organizerId,
            status: 'ACTIVE',
            joined_at: new Date().toISOString()
          });
      } catch (memberError: any) {
        console.error('Error adding organizer as member:', memberError);
        if (memberError?.code === '23505') {
          console.log('Organizer membership already exists, continuing');
        } else {
          console.warn('Membership insert failed but group created. User may not be able to save immediately.');
        }
      }
    } else if (groupType === 'ORGANIZER_ONLY') {
      // Organizer-Only: Add to organizer_only_members table
      try {
        await supabase
          .from('organizer_only_members')
          .insert({
            group_id: group.id,
            name: 'Me (Organizer)',
            phone_number: null,  // Use NULL instead of empty string to allow multiple organizers
            email: null,
            is_active: true
          });
      } catch (memberError: any) {
        console.error('Error adding organizer to organizer_only_members:', memberError);
        if (memberError?.code === '23505') {
          console.log('Organizer member already exists, continuing');
        } else {
          console.warn('Organizer member insert failed but group created.');
        }
      }
    }

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
  },

  /**
   * Check if organizer has a membership in a group
   */
  getOrganizerMembership: async (groupId: string, organizerId: string) => {
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('id, status, joined_at')
        .eq('group_id', groupId)
        .eq('user_id', organizerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data || null;
    } catch (err: any) {
      // 406 error = RLS policy denied access (e.g., organizer-only group with no memberships)
      if (err.status === 406 || err.message?.includes('406')) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Create organizer membership in a group (if not exists)
   */
  addOrganizerToGroup: async (groupId: string, organizerId: string) => {
    // Check if already a member
    const existing = await groupsService.getOrganizerMembership(groupId, organizerId);
    if (existing) return existing;

    // Add organizer as member
    const { data, error } = await supabase
      .from('memberships')
      .insert({
        group_id: groupId,
        user_id: organizerId,
        status: 'ACTIVE',
        joined_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};