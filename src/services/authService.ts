import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser extends User {
  profile?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
    preferences_json?: any;
    is_premium?: boolean;
  };
}

export const authService = {
  async signUp(email: string, password: string, displayName?: string) {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName
        }
      }
    });

    return { data, error };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return {
      ...user,
      profile: profile || undefined
    };
  },

  async updateProfile(updates: {
    display_name?: string;
    avatar_url?: string;
    preferences_json?: any;
  }) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString()
      });

    return { error };
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};