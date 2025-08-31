import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminSession = () => {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.email) {
          // Verify if user is admin
          const { data } = await supabase
            .from('admin_users')
            .select('email')
            .eq('email', session.user.email)
            .eq('is_active', true)
            .single();
          
          if (data) {
            setAdminEmail(session.user.email);
          }
        }
      } catch (error) {
        console.error('Error checking admin session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        const { data } = await supabase
          .from('admin_users')
          .select('email')
          .eq('email', session.user.email)
          .eq('is_active', true)
          .single();
        
        if (data) {
          setAdminEmail(session.user.email);
        }
      } else if (event === 'SIGNED_OUT') {
        setAdminEmail(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    adminEmail,
    isLoading,
    isAdmin: !!adminEmail
  };
};