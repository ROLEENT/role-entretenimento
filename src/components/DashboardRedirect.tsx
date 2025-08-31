import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Index from '@/pages/Index';

export function DashboardRedirect() {
  const { user, session, loading, role } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verificando acesso..." />
      </div>
    );
  }

  // Always show the homepage, regardless of user role
  return <Index />;
}