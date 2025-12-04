import { create } from 'zustand';
import { groupsService } from '@/services/groupsService';

interface Group {
  id: string;
  name: string;
  join_code: string;
  cycle_days: number;
  status: string;
  current_cycle: number;
}

interface GroupsState {
  groups: Group[];
  isLoading: boolean;
  error: string | null;

  fetchGroups: (userId: string, role: 'ORGANIZER' | 'MEMBER') => Promise<void>;
  addGroup: (group: Group) => void;
}

export const useGroupsStore = create<GroupsState>((set) => ({
  groups: [],
  isLoading: false,
  error: null,

  fetchGroups: async (userId, role) => {
    set({ isLoading: true, error: null });
    try {
      const groups = await groupsService.getUserGroups(userId, role);
      set({ groups: groups as Group[] });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addGroup: (group) => set((state) => ({ groups: [group, ...state.groups] })),
}));