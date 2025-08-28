import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

type AuthStatus = 'loading' | 'ready' | 'error';

interface AdminV2AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  status: AuthStatus;
  isAuthenticated: boolean;
}

export const useAdminV2Auth = (): AdminV2AuthState & { logout: () => void } => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [lastSavedEmail, setLastSavedEmail] = useState<string | null>(null);

  useEffect(() => {
    // Configurar listener de mudanças de auth PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[ADMIN V2 AUTH] Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Atualizar status baseado na sessão
        if (session?.user) {
          setStatus('ready');
        } else {
          setStatus('error');
        }
      }
    );

    // Verificar sessão salva no localStorage
    const savedSession = localStorage.getItem('admin-v2-session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        // Verificar se não expirou (24h)
        const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
        if (!isExpired && parsed.user && parsed.session) {
          console.log('[ADMIN V2 AUTH] Restoring session from localStorage:', parsed.user.email);
          setUser(parsed.user);
          setSession(parsed.session);
          setStatus('ready');
        } else {
          console.log('[ADMIN V2 AUTH] Session expired or invalid, removing from localStorage');
          localStorage.removeItem('admin-v2-session');
        }
      } catch (error) {
        console.error('Error parsing saved session:', error);
        localStorage.removeItem('admin-v2-session');
      }
    }

    // Verificar sessão atual do Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        setStatus('ready');
        
        // Salvar no localStorage se não existe ou mudou
        const savedSession = localStorage.getItem('admin-v2-session');
        const currentEmail = session.user.email;
        
        if (currentEmail) {
          const shouldSave = !savedSession || 
            JSON.parse(savedSession)?.email !== currentEmail;
          
          if (shouldSave) {
            console.log('[ADMIN V2 AUTH] Saving session to localStorage:', currentEmail);
            localStorage.setItem('admin-v2-session', JSON.stringify({
              user: session.user,
              session: session,
              email: currentEmail,
              timestamp: Date.now()
            }));
          }
        }
      } else {
        setStatus('error');
        localStorage.removeItem('admin-v2-session');
      }
      setLoading(false);
    }).catch(() => {
      setStatus('error');
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('admin-v2-session');
    setUser(null);
    setSession(null);
  };

  return {
    user,
    session,
    loading,
    status,
    isAuthenticated: !!user,
    logout
  };
};