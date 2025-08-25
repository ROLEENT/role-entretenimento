import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser extends User {
  profile?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
    preferences_json?: any;
    is_premium?: boolean;
    is_admin?: boolean;
    username?: string;
    bio?: string;
    location?: string;
    website?: string;
    is_verified?: boolean;
    followers_count?: number;
    following_count?: number;
    birth_date?: string;
    phone?: string;
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

    // Get user profile including admin status
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

  async isAdmin(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_admin_user');
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      return data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  async updateProfile(updates: {
    display_name?: string;
    avatar_url?: string;
    preferences_json?: any;
    username?: string;
    bio?: string;
    location?: string;
    website?: string;
    birth_date?: string;
    phone?: string;
  }) {
    try {
      // Verificar sessão ativa antes de tentar atualizar
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('Erro de sessão:', sessionError);
        throw new Error('Sessão não encontrada. Faça login novamente.');
      }

      // Usar o user_id da sessão atual
      const userId = session.user.id;
      
      console.log('Atualizando perfil para usuário:', userId, 'com dados:', updates);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erro RLS ou banco:', error);
        throw error;
      }

      return { error: null };
    } catch (error) {
      console.error('Erro completo ao atualizar perfil:', error);
      return { error };
    }
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};