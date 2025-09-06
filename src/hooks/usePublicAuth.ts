import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface PublicAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

// Global state para público (separado do admin)
let globalPublicAuthState: PublicAuthState = {
  user: null,
  session: null,
  loading: false,
  isAuthenticated: false
};

let listeners = new Set<Function>();
let initialized = false;
let subscription: any = null;

function updateGlobalState(updates: Partial<PublicAuthState>) {
  Object.assign(globalPublicAuthState, updates);
  listeners.forEach(listener => listener(globalPublicAuthState));
}

export const usePublicAuth = () => {
  const [state, setState] = useState<PublicAuthState>(globalPublicAuthState);

  useEffect(() => {
    let isMounted = true;
    
    const updateLocalState = (newState: PublicAuthState) => {
      if (!isMounted) return;
      setState(newState);
    };
    
    listeners.add(updateLocalState);
    
    if (!initialized) {
      initialized = true;
      
      const getInitialSession = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          updateGlobalState({
            user: session?.user || null,
            session,
            loading: false,
            isAuthenticated: !!session?.user
          });
        } catch (error) {
          console.error('[PUBLIC_AUTH] Error getting initial session:', error);
          updateGlobalState({ loading: false });
        }
      };

      if (!subscription) {
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('[PUBLIC_AUTH] State changed:', event, !!session);
            
            updateGlobalState({
              user: session?.user || null,
              session,
              loading: false,
              isAuthenticated: !!session?.user
            });
          }
        );
        
        subscription = authSubscription;
      }

      getInitialSession();
    } else {
      updateLocalState(globalPublicAuthState);
    }

    return () => {
      isMounted = false;
      listeners.delete(updateLocalState);
      
      if (listeners.size === 0 && subscription) {
        subscription.unsubscribe();
        subscription = null;
        initialized = false;
      }
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    updateGlobalState({ loading: true });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: displayName || ''
          }
        }
      });

      if (error) throw error;

      toast.success('Conta criada! Verifique seu email para confirmar.');
      return { data, error: null };
    } catch (error: any) {
      console.error('[PUBLIC_AUTH] Sign up error:', error);
      toast.error(error.message || 'Erro ao criar conta');
      return { data: null, error };
    } finally {
      updateGlobalState({ loading: false });
    }
  };

  const signIn = async (email: string, password: string) => {
    updateGlobalState({ loading: true });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast.success('Login realizado com sucesso!');
      return { data, error: null };
    } catch (error: any) {
      console.error('[PUBLIC_AUTH] Sign in error:', error);
      toast.error(error.message || 'Erro ao fazer login');
      return { data: null, error };
    } finally {
      updateGlobalState({ loading: false });
    }
  };

  const signOut = async () => {
    updateGlobalState({ loading: true });
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      updateGlobalState({
        user: null,
        session: null,
        loading: false,
        isAuthenticated: false
      });

      toast.success('Logout realizado com sucesso!');
      return { error: null };
    } catch (error: any) {
      console.error('[PUBLIC_AUTH] Sign out error:', error);
      toast.error(error.message || 'Erro ao fazer logout');
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`
      });

      if (error) throw error;

      toast.success('Email de recuperação enviado!');
      return { error: null };
    } catch (error: any) {
      console.error('[PUBLIC_AUTH] Reset password error:', error);
      toast.error(error.message || 'Erro ao enviar email de recuperação');
      return { error };
    }
  };

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    resetPassword
  };
};