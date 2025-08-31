import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, session, loading, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      const hasSession = !!session;
      const userRole = role || 'none';
      const hasAccess = role === 'admin' || role === 'editor';
      
      console.log(`[ADMIN GUARD] session:${hasSession} role:${userRole} access:${hasAccess}`);
      
      if (!hasSession) {
        navigate('/admin-v3/login');
        return;
      }
      
      // Set admin email header for storage requests
      if (user?.email && hasAccess) {
        localStorage.setItem('admin_email', user.email);
      }
      
      setAuthChecked(true);
    }
  }, [session, role, loading, navigate, user]);

  // Show loading while checking session and role
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verificando acesso administrativo..." />
      </div>
    );
  }

  // Show access denied for viewers or non-authenticated users
  if (role === 'viewer' || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Faça login como administrador para continuar.
            </p>
            {role && (
              <p className="text-sm text-muted-foreground">
                Role atual: <strong>{role}</strong>
              </p>
            )}
            <div className="space-y-2">
              <Button onClick={() => navigate('/admin-v3/login')} className="w-full">
                Fazer Login
              </Button>
              {session && (
                <Button onClick={signOut} variant="outline" className="w-full">
                  Sair
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}