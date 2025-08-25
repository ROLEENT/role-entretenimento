import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
}

interface SecureAdminSession {
  sessionToken: string;
  adminData: AdminUser;
  expiresAt: string;
}

export const useAdminAuth = () => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Validate session token with the server
  const validateSession = async (token: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('validate_admin_session', {
        p_session_token: token
      });

      if (error || !data || data.length === 0) {
        return false;
      }

      const session = data[0];
      if (session.is_valid) {
        setAdminUser({
          id: session.admin_id,
          email: session.admin_email,
          full_name: session.admin_email, // Will be updated from admin data
          is_admin: true
        });
        setSessionToken(token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      // Check for secure session token
      const savedToken = localStorage.getItem('admin_session_token');
      if (savedToken) {
        const isValid = await validateSession(savedToken);
        if (!isValid) {
          localStorage.removeItem('admin_session_token');
          // Clean up legacy admin_session if it exists
          localStorage.removeItem('admin_session');
        }
      } else {
        // Clean up legacy admin_session
        localStorage.removeItem('admin_session');
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const loginAdmin = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('authenticate_admin_secure', {
        p_email: email,
        p_password: password
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0];
        
        if (result.success) {
          const adminData = result.admin_data as AdminUser;
          
          // Create secure session
          const { data: sessionData, error: sessionError } = await supabase.rpc('create_admin_session', {
            p_admin_id: adminData.id
          });

          if (sessionError) throw sessionError;

          const token = sessionData;
          setAdminUser(adminData);
          setSessionToken(token);
          localStorage.setItem('admin_session_token', token);
          
          // Clean up legacy storage
          localStorage.removeItem('admin_session');
          
          return { 
            success: true, 
            error: null,
            requiresPasswordUpdate: result.requires_password_update 
          };
        } else {
          return { 
            success: false, 
            error: 'Email ou senha incorretos',
            requiresPasswordUpdate: result.requires_password_update || false
          };
        }
      } else {
        return { success: false, error: 'Erro na autenticação' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Erro no login' };
    } finally {
      setLoading(false);
    }
  };

  const logoutAdmin = async () => {
    // Remove session from server if we have a token
    if (sessionToken) {
      try {
        // Note: We could add a logout RPC function to invalidate the session server-side
        // For now, just clean up client-side
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    setAdminUser(null);
    setSessionToken(null);
    localStorage.removeItem('admin_session_token');
    localStorage.removeItem('admin_session'); // Clean up legacy
  };

  const updatePassword = async (newPassword: string) => {
    if (!adminUser) return { success: false, error: 'Not authenticated' };
    
    try {
      const { data, error } = await supabase.rpc('update_admin_password_secure', {
        p_admin_id: adminUser.id,
        p_new_password: newPassword
      });

      if (error) throw error;
      
      return { success: data, error: null };
    } catch (error: any) {
      console.error('Password update error:', error);
      return { success: false, error: error.message || 'Erro ao atualizar senha' };
    }
  };

  const isAdmin = () => {
    return !!adminUser && !!sessionToken;
  };

  return {
    adminUser,
    loading,
    loginAdmin,
    logoutAdmin,
    updatePassword,
    isAdmin,
    isAuthenticated: !!adminUser && !!sessionToken,
    sessionToken
  };
};