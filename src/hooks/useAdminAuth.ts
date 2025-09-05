import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.email) {
          // For development, we'll assume any authenticated user is admin
          // In production, this would check against admin_users table
          setIsAdmin(true);
          setAdminEmail(session.user.email);
          console.log("✅ Admin autenticado:", session.user.email);
        } else {
          setIsAdmin(false);
          setAdminEmail(null);
        }
      } catch (error) {
        console.error('Erro ao verificar status de admin:', error);
        setIsAdmin(false);
        setAdminEmail(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        setIsAdmin(true);
        setAdminEmail(session.user.email);
        console.log("✅ Admin logado:", session.user.email);
      } else if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setAdminEmail(null);
        console.log("❌ Admin deslogado");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getAdminHeaders = () => {
    if (!adminEmail) {
      throw new Error('Admin não autenticado');
    }
    return {
      'x-admin-email': adminEmail
    };
  };

  return {
    isAdmin,
    adminEmail,
    isLoading,
    getAdminHeaders
  };
};