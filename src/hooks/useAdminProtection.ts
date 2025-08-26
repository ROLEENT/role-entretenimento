import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useAdminProtection = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        // Check if current path needs admin protection
        const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
        
        if (!isAdminRoute) {
          setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          navigate('/admin/login', { replace: true });
          return;
        }

        // Check if user is admin
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', session.user.id)
          .single();

        if (error || !profile?.is_admin) {
          navigate('/admin/login', { replace: true });
          return;
        }

        setUser(session.user);
        setIsAdmin(true);
      } catch (error) {
        console.error('Admin auth check error:', error);
        navigate('/admin/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setIsAdmin(false);
          if (location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') {
            navigate('/admin/login', { replace: true });
          }
        } else if (session?.user) {
          // Recheck admin status on sign in
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('user_id', session.user.id)
            .single();

          if (profile?.is_admin) {
            setUser(session.user);
            setIsAdmin(true);
          } else {
            await supabase.auth.signOut();
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return { user, loading, isAdmin };
};