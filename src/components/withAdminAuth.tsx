import { ComponentType, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

/**
 * HOC para proteção de rotas admin com RBAC
 * ETAPA 1: Middleware de proteção com verificação de role
 */
export const withAdminAuth = <P extends object>(
  WrappedComponent: ComponentType<P>,
  requiredRole: 'admin' | 'editor' = 'editor'
) => {
  return function ProtectedComponent(props: P) {
    const { 
      user, 
      role, 
      loading, 
      isAuthenticated 
    } = useSecureAuth();
    
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated) {
          console.log('[WITH ADMIN AUTH] Usuário não autenticado, redirecionando para login');
          navigate('/admin-v2/login', { 
            state: { from: location.pathname },
            replace: true 
          });
          return;
        }

        if (!role) {
          console.log('[WITH ADMIN AUTH] Role não encontrada, redirecionando para login');
          navigate('/admin-v2/login', { 
            state: { from: location.pathname },
            replace: true 
          });
          return;
        }

        // Verificar se tem permissão para o role requerido
        if (requiredRole === 'admin' && role !== 'admin') {
          console.log('[WITH ADMIN AUTH] Acesso negado - role admin requerida');
          navigate('/', { replace: true });
          return;
        }

        console.log('[WITH ADMIN AUTH] Usuário autenticado:', user?.email, 'Role:', role);
      }
    }, [loading, isAuthenticated, role, user, navigate, location]);

    // Loading state
    if (loading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-muted-foreground">Verificando autenticação...</p>
          </div>
        </div>
      );
    }

    // Se chegou até aqui e está autenticado, renderizar componente
    if (isAuthenticated && role) {
      return <WrappedComponent {...props} />;
    }

    // Caso contrário, mostrar loading (redirecionamento acontece no useEffect)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  };
};

// Helper para criar componentes protegidos
export const createProtectedAdminComponent = <P extends object>(
  component: ComponentType<P>,
  requiredRole: 'admin' | 'editor' = 'editor'
) => withAdminAuth(component, requiredRole);