import { useState, useEffect } from 'react';
import { authService, type AuthUser } from '@/services/authService';
import type { Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer' | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Clear potentially corrupted auth data
    const clearCorruptedData = () => {
      try {
        const keys = ['sb-nutlcbnruabjsxecqpnd-auth-token', 'admin_session'];
        keys.forEach(key => {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              JSON.parse(item);
            } catch {
              console.log('Removing corrupted localStorage item:', key);
              localStorage.removeItem(key);
            }
          }
        });
      } catch (error) {
        console.error('Error clearing corrupted data:', error);
      }
    };

    clearCorruptedData();

    // Get initial session synchronously
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await authService.getSession();
        if (isMounted) {
          setSession(session);
          
          if (session?.user) {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            
            // Extract and log role decision
            const userRole = currentUser?.profile?.role || 'viewer';
            setRole(userRole);
            
            const hasAccess = userRole === 'admin' || userRole === 'editor';
            const state = hasAccess ? 'allowed' : 'denied';
            const reason = hasAccess ? 'valid_role' : 'insufficient_permissions';
            
            console.log(`[AUTH DECISION] session:true role:${userRole} state:${state} reason:${reason}`);
          } else {
            setUser(null);
            setRole(null);
            console.log('[AUTH DECISION] session:false role:none state:denied reason:no_session');
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Auth state listener - load profile and role after session change
    const { data: { subscription } } = authService.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        console.log('[AUTH] State changed:', event, !!session);
        setSession(session);
        
        if (session?.user && event !== 'INITIAL_SESSION') {
          // Load user profile and role after auth state change (not initial)
          setTimeout(async () => {
            try {
              const currentUser = await authService.getCurrentUser();
              setUser(currentUser);
              
              const userRole = currentUser?.profile?.role || 'viewer';
              setRole(userRole);
              
              const hasAccess = userRole === 'admin' || userRole === 'editor';
              const state = hasAccess ? 'allowed' : 'denied';
              const reason = hasAccess ? 'valid_role' : 'insufficient_permissions';
              
              console.log(`[AUTH DECISION] session:true role:${userRole} state:${state} reason:${reason}`);
            } catch (error) {
              console.error('[AUTH] Erro ao carregar profile:', error);
            }
            setLoading(false);
          }, 0);
        } else if (!session) {
          setUser(null);
          setRole(null);
          setLoading(false);
          console.log('[AUTH DECISION] session:false role:none state:denied reason:signed_out');
        }
      }
    );

    getInitialSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    const result = await authService.signUp(email, password, displayName);
    setLoading(false);
    return result;
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await authService.signIn(email, password);
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await authService.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setLoading(false);
    return result;
  };

  const updateProfile = async (updates: {
    display_name?: string;
    avatar_url?: string;
    preferences_json?: any;
    username?: string;
    bio?: string;
    location?: string;
    website?: string;
    birth_date?: string;
    phone?: string;
  }) => {
    try {
      // Verificar se o usuário está autenticado
      if (!session?.user) {
        throw new Error('Usuário não está autenticado');
      }

      console.log('Hook updateProfile - Usuário autenticado:', session.user.id);
      
      const result = await authService.updateProfile(updates);
      
      if (!result.error) {
        // Refresh user data após sucesso
        const updatedUser = await authService.getCurrentUser();
        setUser(updatedUser);
        console.log('Perfil atualizado com sucesso');
      } else {
        console.error('Erro ao atualizar perfil:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Erro no hook updateProfile:', error);
      return { error };
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    role,
    isAdmin: role === 'admin',
    isEditor: role === 'editor',
    hasAdminAccess: role === 'admin' || role === 'editor'
  };
};