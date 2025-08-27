import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AdminV2AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAdminV2Auth = (): AdminV2AuthState & { logout: () => void } => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão salva no localStorage
    const savedSession = localStorage.getItem('admin-v2-session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        // Verificar se não expirou (24h)
        const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
        if (!isExpired && parsed.user && parsed.session) {
          setUser(parsed.user);
          setSession(parsed.session);
        } else {
          localStorage.removeItem('admin-v2-session');
        }
      } catch (error) {
        console.error('Error parsing saved session:', error);
        localStorage.removeItem('admin-v2-session');
      }
    }

    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          localStorage.setItem('admin-v2-session', JSON.stringify({
            user: session.user,
            session: session,
            timestamp: Date.now()
          }));
        } else {
          localStorage.removeItem('admin-v2-session');
        }
      }
    );

    // Verificar sessão atual do Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
      }
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
    isAuthenticated: !!user,
    logout
  };
};