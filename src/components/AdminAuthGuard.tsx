import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export const AdminAuthGuard = ({ children }: AdminAuthGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  const { user, session, loading } = useAuth();

  useEffect(() => {
    let mounted = true;
    
    const checkAdminAccess = async () => {
      try {
        // Se ainda está carregando auth, aguarda
        if (loading) {
          return;
        }

        // Se não há sessão, redireciona para login
        if (!session || !user) {
          console.log('❌ Sem sessão ativa, redirecionando para login');
          if (mounted) {
            navigate('/admin/login');
          }
          return;
        }

        // Aguardar um pouco para garantir que a sessão está estável
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verifica novamente se ainda temos sessão válida
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession && mounted) {
          console.log('❌ Sessão perdida, redirecionando para login');
          navigate('/admin/login');
          return;
        }

        // Verifica se é admin através da função do banco
        const { data: isAdmin, error } = await supabase.rpc('is_admin', {
          uid: user.id
        });

        if (error) {
          console.error('❌ Erro ao verificar permissões admin:', error);
          if (mounted) {
            navigate('/admin/login');
          }
          return;
        }

        if (!isAdmin) {
          console.log('❌ Usuário não é admin:', user.email);
          if (mounted) {
            alert(`Acesso negado. Apenas administradores podem acessar esta área.\n\nSeu email: ${user.email}\nEmails autorizados: admin@role.com.br, fiih@roleentretenimento.com`);
            navigate('/');
          }
          return;
        }

        console.log('✅ Usuário admin autenticado:', user.email);
        if (mounted) {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error('❌ Erro na verificação de autenticação:', error);
        if (mounted) {
          navigate('/admin/login');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkAdminAccess();
    
    return () => {
      mounted = false;
    };
  }, [user, session, loading, navigate]);

  // Mostra loading enquanto verifica auth
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Só renderiza children se autorizado
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};