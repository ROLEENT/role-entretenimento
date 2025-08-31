import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface RequireAuthProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

export function RequireAuth({ children, requiredRole = 'user' }: RequireAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasRequiredRole, setHasRequiredRole] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, [requiredRole]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);

      if (requiredRole === 'admin') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', session.user.id)
          .single();

        setHasRequiredRole(profile?.is_admin === true);
      } else {
        setHasRequiredRole(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setHasRequiredRole(false);
    }
  };

  if (isAuthenticated === null || hasRequiredRole === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole === 'admin' && !hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}