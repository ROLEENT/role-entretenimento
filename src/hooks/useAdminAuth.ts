import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
}

interface SecureAdminSession {
  session_token: string;
  admin: AdminUser;
}

export const useAdminAuth = () => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Validate session token with the server
  const validateSession = async (token: string): Promise<boolean> => {
    try {
      console.log('🔍 Validando sessão admin...');
      
      const { data, error } = await supabase.rpc('validate_admin_session', {
        p_session_token: token
      });

      console.log('📥 Resposta validação:', { data, error });

      if (error || !data || data.length === 0) {
        console.log('❌ Erro na validação ou dados vazios');
        return false;
      }

      const response = data[0];
      if (response?.valid) {
        console.log('✅ Sessão válida!', response);
        
        setAdminUser({
          id: response.admin_id,
          email: response.admin_email,
          full_name: response.admin_name || 'Admin'
        });
        setSessionToken(token);
        return true;
      }
      
      console.log('❌ Sessão inválida');
      return false;
    } catch (error) {
      console.error('❌ Erro na validação de sessão:', error);
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
      console.log('🔄 Tentando login admin:', email);
      
      const { data, error } = await supabase.rpc('authenticate_admin_secure', {
        p_email: email,
        p_password: password
      });

      console.log('📥 Resposta do login:', { data, error });

      if (error) {
        console.error('❌ Erro na função de login:', error);
        toast.error('Erro interno do servidor');
        return { success: false, error: 'Erro interno do servidor', requiresPasswordUpdate: false };
      }

      if (data && data.length > 0) {
        const response = data[0];
        
        if (response.success) {
          console.log('✅ Login bem-sucedido!', response);
          
          const adminData: AdminUser = {
            id: response.admin_id,
            email: email,
            full_name: 'Admin ROLE'
          };
          
          setAdminUser(adminData);
          setSessionToken(response.session_token);
          localStorage.setItem('admin_session_token', response.session_token);
          
          // Clean up legacy storage
          localStorage.removeItem('admin_session');
          
          toast.success('Login realizado com sucesso!');
          
          return { 
            success: true, 
            error: null,
            requiresPasswordUpdate: false
          };
        } else {
          console.error('❌ Login falhou:', response.message);
          toast.error(response.message || 'Email ou senha incorretos');
          return { 
            success: false, 
            error: response.message || 'Email ou senha incorretos',
            requiresPasswordUpdate: false
          };
        }
      } else {
        console.error('❌ Dados vazios na resposta');
        toast.error('Erro na autenticação');
        return { success: false, error: 'Erro na autenticação', requiresPasswordUpdate: false };
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      toast.error('Erro ao fazer login');
      return { success: false, error: error.message || 'Erro no login', requiresPasswordUpdate: false };
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