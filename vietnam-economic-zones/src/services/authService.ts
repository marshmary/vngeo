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
}
