import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Index from '@/pages/Index';

export function DashboardRedirect() {
  const { user, session, loading, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (session && (role === 'admin' || role === 'editor')) {
        navigate('/admin-v3', { replace: true });
      }
    }
  }, [session, role, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verificando acesso..." />
      </div>
    );
  }

  // If not logged in or no admin role, show the homepage
  if (!session || (role !== 'admin' && role !== 'editor')) {
    return <Index />;
  }

  return null;
}