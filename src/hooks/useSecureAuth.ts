import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'editor';

export interface SecureAuthState {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  canDelete: boolean;
}

/**
 * Hook de autenticação segura com RBAC e cookies
 * ETAPA 1: Sistema de auth baseado em cookies, eliminando localStorage
 */
export const useSecureAuth = (): SecureAuthState & { 
  logout: () => Promise<void>;
  checkRole: () => Promise<UserRole | null>;
} => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const checkRole = async (): Promise<UserRole | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao verificar role:', error);
        return null;
      }
      
      return data?.role as UserRole || null;
    } catch (error) {
      console.error('Erro ao verificar role:', error);
      return null;
    }
  };

  useEffect(() => {
    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[SECURE AUTH] Auth state change:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Verificar role do usuário
          const userRole = await checkRole();
          setRole(userRole);
          setLoading(false);
        } else {
          setRole(null);
          setLoading(false);
        }
      }
    );

    // Verificar sessão atual
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[SECURE AUTH] Erro ao obter sessão:', error);
          setLoading(false);
          return;
        }

        console.log('[SECURE AUTH] Sessão inicial:', !!session, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userRole = await checkRole();
          setRole(userRole);
        } else {
          setRole(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('[SECURE AUTH] Erro na inicialização:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setRole(null);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = role === 'admin';
  const canDelete = isAdmin;

  return {
    user,
    session,
    role,
    loading,
    isAuthenticated,
    isAdmin,
    canDelete,
    logout,
    checkRole
  };
};