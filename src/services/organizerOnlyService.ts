import { supabase } from '@/api/supabase';
import { OrganizerOnlyMember } from '@/types';

export const organizerOnlyService = {
  /**
   * Add a new member to an organizer-only group
   */
  addMember: async (groupId: string, name: string, phoneNumber: string, email?: string, notes?: string) => {
    const { data, error } = await supabase
      .from('organizer_only_members')
      .insert({
        group_id: groupId,
        name,
        phone_number: phoneNumber,
        email,
        notes,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all members of an organizer-only group
   */
  getGroupMembers: async (groupId: string) => {
    const { data, error } = await supabase
      .from('organizer_only_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as OrganizerOnlyMember[];
  },

  /**
   * Get a specific member
   */
  getMember: async (memberId: string) => {
    const { data, error } = await supabase
      .from('organizer_only_members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (error) throw error;
    return data as OrganizerOnlyMember;
  },

  /**
   * Update member details
   */
  updateMember: async (memberId: string, updates: Partial<OrganizerOnlyMember>) => {
    const { data, error } = await supabase
      .from('organizer_only_members')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Deactivate a member (soft delete)
   */
  deactivateMember: async (memberId: string) => {
    const { data, error } = await supabase
      .from('organizer_only_members')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Reactivate a member
   */
  reactivateMember: async (memberId: string) => {
    const { data, error } = await supabase
      .from('organizer_only_members')
      .update({
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Import members from array (bulk add)
   */
  bulkAddMembers: async (groupId: string, members: Array<{ name: string; phone_number: string; email?: string; notes?: string }>) => {
    const membersToInsert = members.map(m => ({
      group_id: groupId,
      name: m.name,
      phone_number: m.phone_number,
      email: m.email,
      notes: m.notes,
      is_active: true
    }));

    const { data, error } = await supabase
      .from('organizer_only_members')
      .insert(membersToInsert)
      .select();

    if (error) throw error;
    return data as OrganizerOnlyMember[];
  },

  /**
   * Get member by phone number for a group
   */
  getMemberByPhone: async (groupId: string, phoneNumber: string) => {
    const { data, error } = await supabase
      .from('organizer_only_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('phone_number', phoneNumber)
      .single();

    if (error && error.code !== 'PGRST116') throw error;  // 'PGRST116' = no rows returned
    return data as OrganizerOnlyMember | null;
  },

  /**
   * Search members in a group
   */
  searchMembers: async (groupId: string, query: string) => {
    const { data, error } = await supabase
      .from('organizer_only_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,phone_number.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return data as OrganizerOnlyMember[];
  }
};
