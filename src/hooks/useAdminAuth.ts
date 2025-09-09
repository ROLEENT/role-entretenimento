import { useAuth } from '@/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAuth = () => {
  const { user, isAdmin } = useAuth();
  
  const getAdminEmail = () => {
    if (!isAdmin || !user?.email) {
      throw new Error('Usuário não tem permissões de admin');
    }
    return user.email;
  };

  const callAdminRpc = async (functionName: string, params: Record<string, any>) => {
    if (!isAdmin) {
      throw new Error('Acesso negado: permissões de admin necessárias');
    }

    const adminEmail = getAdminEmail();
    
    // Configurar header de admin e fazer chamada RPC
    const { data, error } = await supabase.rpc(functionName, {
      p_admin_email: adminEmail,
      ...params
    });

    if (error) throw error;
    
    // Se a resposta é um objeto com success, verificar o resultado
    if (data && typeof data === 'object' && 'success' in data) {
      if (!data.success) {
        throw new Error(data.error || 'Operação falhou');
      }
    }
    
    return data;
  };

  return {
    isAdmin,
    getAdminEmail,
    callAdminRpc
  };
};