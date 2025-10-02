import { supabase } from '@/lib/supabase';
import type { LoginFormData, SignUpFormData } from '@/types/auth.types';

export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signIn({ email, password }: LoginFormData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sign up with email and password
   */
  static async signUp({ email, password, username }: SignUpFormData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
        },
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sign out the current user
   */
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Get the current session
   */
  static async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  /**
   * Get the current user
   */
  static async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Check if user is admin using user metadata
   */
  static async checkIsAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        console.error('Error checking admin status:', error);
        return false;
      }

      // Check user_metadata or app_metadata for role
      return data.user.user_metadata?.role === 'admin' ||
             data.user.app_metadata?.role === 'admin' ||
             false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Update user metadata with admin role
   * Note: This should be called from a secure backend/edge function
   * Direct client updates to app_metadata are not allowed
   */
  static async setUserRole(role: 'admin' | 'user'): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      data: { role }
    });

    if (error) throw error;
  }
}
