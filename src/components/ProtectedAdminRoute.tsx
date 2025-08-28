import { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminV2Auth } from '@/hooks/useAdminV2Auth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProtectedAdminRouteProps {
  children?: ReactNode;
}

export const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { user, status } = useAdminV2Auth();
  
  // Log de debugging temporário
  console.log('[PROTECTED ADMIN ROUTE]', {
    status,
    userEmail: user?.email,
    timestamp: new Date().toISOString()
  });

  // Se ainda está carregando, mostrar loading (NÃO redirecionar)
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Carregando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se status error OU não tem email do usuário, redirecionar para login
  if (status === 'error' || !user?.email) {
    console.log('[PROTECTED ADMIN ROUTE] Redirecionando para login:', { status, hasUserEmail: !!user?.email });
    return <Navigate to="/admin-v2/login" replace />;
  }

  // Se chegou aqui, está autenticado - renderizar conteúdo
  console.log('[PROTECTED ADMIN ROUTE] Usuário autenticado:', user.email);
  return children ? <>{children}</> : <Outlet />;
};