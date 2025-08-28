import { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProtectedAdminRouteProps {
  children?: ReactNode;
}

export const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { user, loading, isAuthenticated, isAdmin } = useSecureAuth();
  
  // Log de debugging
  console.log('[PROTECTED ADMIN ROUTE]', {
    loading,
    isAuthenticated,
    isAdmin,
    userEmail: user?.email,
    timestamp: new Date().toISOString()
  });

  // Se ainda está carregando, mostrar loading
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

  // Se não está autenticado ou não é admin, redirecionar para login
  if (!isAuthenticated || !isAdmin) {
    console.log('[PROTECTED ADMIN ROUTE] Acesso negado:', { 
      isAuthenticated, 
      isAdmin, 
      userEmail: user?.email 
    });
    return <Navigate to="/admin-v2/login" replace />;
  }

  // Se chegou aqui, é admin autenticado - renderizar conteúdo
  console.log('[PROTECTED ADMIN ROUTE] Admin autenticado:', user?.email);
  return children ? <>{children}</> : <Outlet />;
};