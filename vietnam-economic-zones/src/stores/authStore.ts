import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, AuthActions } from '@/types/auth.types';
import { AuthService } from '@/services/authService';

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      session: null,
      isLoading: true,
      error: null,

      // Actions
      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { user, session } = await AuthService.signIn({ email, password });
          set({ user, session, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      signUp: async (email: string, password: string, username?: string) => {
        set({ isLoading: true, error: null });
        try {
          const { user, session } = await AuthService.signUp({ email, password, username });
          set({ user, session, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      signOut: async () => {
        set({ isLoading: true, error: null });
        try {
          await AuthService.signOut();
          set({ user: null, session: null, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);

// Initialize auth state on app load
export const initializeAuth = async () => {
  const { setUser, setSession, setLoading } = useAuthStore.getState();

  try {
    const session = await AuthService.getSession();
    if (session) {
      const user = await AuthService.getUser();
      setUser(user);
      setSession(session);
    }
  } catch (error) {
    console.error('Failed to initialize auth:', error);
  } finally {
    setLoading(false);
  }

  // Listen for auth changes
  AuthService.onAuthStateChange((_event, session) => {
    if (session) {
      setUser(session.user);
      setSession(session);
    } else {
      setUser(null);
      setSession(null);
    }
  });
};
