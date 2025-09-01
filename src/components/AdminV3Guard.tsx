import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminV3GuardProps {
  children: React.ReactNode;
}

export function AdminV3Guard({ children }: AdminV3GuardProps) {
  const { user, session, loading, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Single auth listener with decision logging
    if (!loading) {
      const hasSession = !!session;
      const userRole = role || 'none';
      const hasAccess = role === 'admin' || role === 'editor';
      const state = hasAccess ? 'allowed' : 'denied';
      
      console.log(`[GUARD DECISION] session:${hasSession} role:${userRole} state:${state}`);
      
      if (!hasSession) {
        navigate('/admin-v3/login');
        return;
      }
      
      setAuthChecked(true);
    }
  }, [session, role, loading, navigate]);

  // Don't block on loading - let admin routes render and check auth after
  if (loading || !authChecked) {
    return <>{children}</>;
  }

  // Show access denied for viewers
  if (role === 'viewer') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta área.
            </p>
            <p className="text-sm text-muted-foreground">
              Role atual: <strong>{role}</strong>
            </p>
            <Button onClick={signOut} variant="outline" className="w-full">
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}