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
    let timeoutId: NodeJS.Timeout;
    
    // Configurar listener de mudanças de auth PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const timestamp = new Date().toISOString();
        console.log(`[ADMIN V2 AUTH] ${timestamp} Auth state change:`, event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Atualizar status baseado na sessão
        if (session?.user) {
          setStatus('ready');
          setLoading(false);
          
          // Salvar sessão com debounce para evitar loops
          const currentEmail = session.user.email;
          if (currentEmail && currentEmail !== lastSavedEmail) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              console.log(`[ADMIN V2 AUTH] ${timestamp} Saving session to localStorage:`, currentEmail);
              localStorage.setItem('admin-v2-session', JSON.stringify({
                user: session.user,
                session: session,
                email: currentEmail,
                timestamp: Date.now()
              }));
              setLastSavedEmail(currentEmail);
            }, 100);
          }
        } else {
          setStatus('error');
          setLoading(false);
          localStorage.removeItem('admin-v2-session');
          setLastSavedEmail(null);
        }
      }
    );

    // Verificar sessão salva no localStorage primeiro
    const savedSession = localStorage.getItem('admin-v2-session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        // Verificar se não expirou (24h)
        const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
        
        if (!isExpired && parsed.user && parsed.session && parsed.email) {
          console.log('[ADMIN V2 AUTH] Restoring session from localStorage:', parsed.email);
          setUser(parsed.user);
          setSession(parsed.session);
          setStatus('ready');
          setLastSavedEmail(parsed.email);
          setLoading(false);
          return () => {
            clearTimeout(timeoutId);
            subscription.unsubscribe();
          };
        } else {
          console.log('[ADMIN V2 AUTH] Session expired or invalid, removing from localStorage');
          localStorage.removeItem('admin-v2-session');
        }
      } catch (error) {
        console.error('[ADMIN V2 AUTH] Error parsing saved session:', error);
        localStorage.removeItem('admin-v2-session');
      }
    }

    // Verificar sessão atual do Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      const timestamp = new Date().toISOString();
      console.log(`[ADMIN V2 AUTH] ${timestamp} getSession result:`, !!session, session?.user?.email);
      
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        setStatus('ready');
        
        const currentEmail = session.user.email;
        if (currentEmail && currentEmail !== lastSavedEmail) {
          console.log(`[ADMIN V2 AUTH] ${timestamp} First time saving session:`, currentEmail);
          localStorage.setItem('admin-v2-session', JSON.stringify({
            user: session.user,
            session: session,
            email: currentEmail,
            timestamp: Date.now()
          }));
          setLastSavedEmail(currentEmail);
        }
      } else {
        setStatus('error');
        localStorage.removeItem('admin-v2-session');
        setLastSavedEmail(null);
      }
      setLoading(false);
    }).catch((error) => {
      console.error('[ADMIN V2 AUTH] Error getting session:', error);
      setStatus('error');
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [lastSavedEmail]);

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