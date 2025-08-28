import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SystemHealth {
  auth: {
    status: 'ok' | 'error';
    message: string;
  };
  database: {
    status: 'ok' | 'error';
    message: string;
    responseTime?: number;
  };
  storage: {
    status: 'ok' | 'error';
    message: string;
    usage?: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

interface SessionInfo {
  user: {
    email: string;
    role: string;
  };
  expiresAt?: Date;
  isExpiringSoon: boolean;
}

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: async (): Promise<SystemHealth> => {
      const startTime = Date.now();
      
      try {
        // Testar autenticação
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        // Testar banco de dados
        const { data: dbTest, error: dbError } = await supabase
          .from('highlights')
          .select('id')
          .limit(1);
        
        const responseTime = Date.now() - startTime;

        // Testar storage (simulado - Supabase não expõe usage facilmente)
        const { data: storageTest, error: storageError } = await supabase.storage
          .from('highlights')
          .list('', { limit: 1 });

        return {
          auth: {
            status: authError ? 'error' : 'ok',
            message: authError ? authError.message : user ? 'Autenticado' : 'Não autenticado',
          },
          database: {
            status: dbError ? 'error' : 'ok',
            message: dbError ? dbError.message : 'Conectado',
            responseTime,
          },
          storage: {
            status: storageError ? 'error' : 'ok',
            message: storageError ? storageError.message : 'Disponível',
            usage: {
              used: 45, // Simulado
              total: 100,
              percentage: 45,
            },
          },
        };
      } catch (error) {
        return {
          auth: { status: 'error', message: 'Erro de conexão' },
          database: { status: 'error', message: 'Erro de conexão' },
          storage: { status: 'error', message: 'Erro de conexão' },
        };
      }
    },
    staleTime: 60000, // 1 minuto
    refetchInterval: 300000, // 5 minutos
  });
};

export const useSessionInfo = () => {
  return useQuery({
    queryKey: ['session-info'],
    queryFn: async (): Promise<SessionInfo | null> => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) return null;

      // Buscar role do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      // Calcular expiração (JWT padrão: 1 hora)
      const expiresAt = user.created_at ? new Date(Date.now() + 60 * 60 * 1000) : undefined;
      const isExpiringSoon = expiresAt ? expiresAt.getTime() - Date.now() < 15 * 60 * 1000 : false;

      return {
        user: {
          email: user.email || '',
          role: profile?.role || 'user',
        },
        expiresAt,
        isExpiringSoon,
      };
    },
    staleTime: 60000, // 1 minuto
  });
};