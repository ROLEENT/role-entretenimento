import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
}

export const useAdminAuth = () => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in from localStorage
    const savedAdmin = localStorage.getItem('admin_session');
    if (savedAdmin) {
      try {
        const adminData = JSON.parse(savedAdmin);
        // Validate the admin data structure
        if (adminData && adminData.id && adminData.email && adminData.is_admin) {
          setAdminUser(adminData);
        } else {
          localStorage.removeItem('admin_session');
        }
      } catch (error) {
        console.error('Error parsing admin session:', error);
        localStorage.removeItem('admin_session');
      }
    }
    setLoading(false);
  }, []);

  const loginAdmin = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('authenticate_admin_simple', {
        p_email: email,
        p_password: password
      });

      if (error) throw error;

      if (data && (data as any).length > 0 && (data as any)[0].success) {
        const adminData = data[0].admin_data as unknown as AdminUser;
        setAdminUser(adminData);
        localStorage.setItem('admin_session', JSON.stringify(adminData));
        return { success: true, error: null };
      } else {
        return { success: false, error: 'Email ou senha incorretos' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Erro no login' };
    } finally {
      setLoading(false);
    }
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem('admin_session');
  };

  const isAdmin = () => {
    return !!adminUser;
  };

  return {
    adminUser,
    loading,
    loginAdmin,
    logoutAdmin,
    isAdmin,
    isAuthenticated: !!adminUser
  };
};