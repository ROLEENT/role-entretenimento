import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

interface UserProfile {
  role: 'admin' | 'editor' | 'viewer';
  display_name?: string;
  email?: string;
}

interface AuthState {
  loading: boolean;
  session: Session | null;
  profile: UserProfile | null;
  accessGranted: boolean;
}

interface AdminV2GuardProps {
  children: React.ReactNode;
}

const AUTHORIZED_EMAILS = [
  'pablohenrique.dev@gmail.com',
  'admin@role.app'
];

export function AdminV2Guard({ children }: AdminV2GuardProps) {
  const [authState, setAuthState] = useState<AuthState>({
    loading: true,
    session: null,
    profile: null,
    accessGranted: false
  });
  
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    let authListener: any = null;

    const checkAccess = async (session: Session | null) => {
      if (!session?.user?.email) {
        console.log('[ADMIN-V2] guard:denied reason:no_session');
        setAuthState({
          loading: false,
          session: null,
          profile: null,
          accessGranted: false
        });
        return;
      }

      if (!AUTHORIZED_EMAILS.includes(session.user.email)) {
        console.log('[ADMIN-V2] guard:denied reason:unauthorized_email');
        setAuthState({
          loading: false,
          session,
          profile: null,
          accessGranted: false
        });
        return;
      }

      try {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, display_name, email')
          .eq('user_id', session.user.id)
          .single();

        if (!isMounted) return;

        const userRole = profile?.role || 'viewer';
        console.log(`[ADMIN-V2] role:${userRole}`);

        if (userRole === 'admin' || userRole === 'editor') {
          console.log('[ADMIN-V2] guard:allowed');
          setAuthState({
            loading: false,
            session,
            profile: { ...profile, role: userRole },
            accessGranted: true
          });
        } else {
          console.log('[ADMIN-V2] guard:denied reason:insufficient_role');
          setAuthState({
            loading: false,
            session,
            profile: { ...profile, role: userRole },
            accessGranted: false
          });
        }
      } catch (error) {
        console.error('[ADMIN-V2] Profile check error:', error);
        if (!isMounted) return;
        
        setAuthState({
          loading: false,
          session,
          profile: null,
          accessGranted: false
        });
      }
    };

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        await checkAccess(session);

        // Set up auth listener (avoiding INITIAL_SESSION)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMounted) return;
            
            // Skip INITIAL_SESSION to avoid loops
            if (event === 'INITIAL_SESSION') return;
            
            console.log('[ADMIN-V2] Auth state change:', event, !!session);
            await checkAccess(session);
          }
        );

        authListener = subscription;
      } catch (error) {
        console.error('[ADMIN-V2] Auth initialization error:', error);
        if (isMounted) {
          setAuthState({
            loading: false,
            session: null,
            profile: null,
            accessGranted: false
          });
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      authListener?.unsubscribe();
    };
  }, []);

  // Loading state
  if (authState.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando sessão...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login with next parameter
  if (!authState.session) {
    const loginUrl = `/admin-v2/login?next=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={loginUrl} replace />;
  }

  // Access denied - handled by the dashboard itself
  if (!authState.accessGranted) {
    return <>{children}</>;
  }

  // Access granted
  return <>{children}</>;
}