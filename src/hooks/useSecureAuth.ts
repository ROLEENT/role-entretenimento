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
 * Hook de autenticação segura com RBAC melhorado
 * ETAPA 1: Sistema de auth baseado em cookies, com retry e refresh automático
 */
export const useSecureAuth = (): SecureAuthState & { 
  logout: () => Promise<void>;
  checkRole: () => Promise<UserRole | null>;
  refreshAuth: () => Promise<void>;
  isSessionValid: () => boolean;
} => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const checkRole = async (): Promise<UserRole | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_admin')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao verificar role:', error);
        // Retry em caso de erro de rede
        if (retryCount < 2 && error.message?.includes('connection')) {
          setRetryCount(prev => prev + 1);
          return await checkRole();
        }
        return null;
      }
      
      setRetryCount(0); // Reset retry count on success
      return data?.role as UserRole || null;
    } catch (error) {
      console.error('Erro ao verificar role:', error);
      return null;
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      console.log('[SECURE AUTH] Refreshing authentication...');
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('[SECURE AUTH] Erro no refresh:', error);
        throw error;
      }

      if (session) {
        setSession(session);
        setUser(session.user);
        const userRole = await checkRole();
        setRole(userRole);
        console.log('[SECURE AUTH] Auth refreshed successfully');
      }
    } catch (error) {
      console.error('[SECURE AUTH] Falha no refresh:', error);
      // Force logout on refresh failure
      await logout();
    }
  };

  const isSessionValid = (): boolean => {
    if (!session) return false;
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at;
    
    // Check if session expires in the next 5 minutes
    return expiresAt ? (expiresAt - now) > 300 : false;
  };

  useEffect(() => {
    let sessionCheckInterval: NodeJS.Timeout;
    
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
          
          // Setup session monitoring for authenticated users
          sessionCheckInterval = setInterval(() => {
            if (!isSessionValid()) {
              console.log('[SECURE AUTH] Session expiring soon, refreshing...');
              refreshAuth();
            }
          }, 60000); // Check every minute
        } else {
          setRole(null);
          setLoading(false);
          if (sessionCheckInterval) {
            clearInterval(sessionCheckInterval);
          }
        }
      }
    );

    // Verificar sessão atual
    const initializeAuth = async () => {
      try {
        // First try to get session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[SECURE AUTH] Erro ao obter sessão:', error);
          // Try to refresh if there's an error
          try {
            await refreshAuth();
          } catch (refreshError) {
            console.error('[SECURE AUTH] Refresh também falhou:', refreshError);
            setLoading(false);
          }
          return;
        }

        console.log('[SECURE AUTH] Sessão inicial:', !!session, session?.user?.email);
        
        // Check if session is valid
        if (session && !isSessionValid()) {
          console.log('[SECURE AUTH] Sessão próxima do vencimento, fazendo refresh...');
          await refreshAuth();
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const userRole = await checkRole();
            setRole(userRole);
          } else {
            setRole(null);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('[SECURE AUTH] Erro na inicialização:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const logout = async () => {
    try {
      console.log('[SECURE AUTH] Fazendo logout...');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setRole(null);
      setRetryCount(0);
      
      // Clear any cached admin checks
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('admin_check_') || key.startsWith('role_check_')) {
          sessionStorage.removeItem(key);
        }
      });
      
      console.log('[SECURE AUTH] Logout concluído');
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
    checkRole,
    refreshAuth,
    isSessionValid
  };
};