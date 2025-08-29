import { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProtectedAdminRouteProps {
  children?: ReactNode;
}

export const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { user, loading, isAuthenticated, role, hasAdminAccess } = useAuth();

  // Enquanto carrega, mostrar loading
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

  // Se não está autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/admin-v2/login" replace />;
  }

  // Se role é viewer, bloquear com mensagem clara
  if (role === 'viewer') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <h2 className="text-xl font-semibold mb-4">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-4">
            Sua conta tem permissões de visualização. Para acessar o painel administrativo, 
            solicite a um administrador para elevar suas permissões.
          </p>
          <p className="text-sm text-muted-foreground">
            Role atual: <span className="font-mono bg-muted px-2 py-1 rounded">{role}</span>
          </p>
        </div>
      </div>
    );
  }

  // Se tem acesso admin (admin ou editor), renderizar conteúdo
  if (hasAdminAccess) {
    return children ? <>{children}</> : <Outlet />;
  }

  // Fallback para casos não previstos
  return <Navigate to="/admin-v2/login" replace />;
};