import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/types';
import { supabase } from '@/api/supabase';
import { authService } from '@/services/authService';

interface AuthState {
  user: UserProfile | null;
  session: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSession: (session: any) => void;
  setUser: (user: UserProfile | null) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      setSession: (session) => set({ session, isAuthenticated: !!session }),
      setUser: (user) => set({ user }),
      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.signOut();
          set({ user: null, session: null, isAuthenticated: false, error: null });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        try {
          // Check for existing session from Supabase
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            set({ session, isAuthenticated: true });
            
            // If we have a session, fetch the full profile
            if (session.user) {
              const profile = await authService.getUserProfile(session.user.id);
              if (profile) {
                set({ user: profile });
              }
            }
          }
        } catch (error: any) {
          console.error('Auth initialization error:', error);
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'tillsave-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        session: state.session, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);