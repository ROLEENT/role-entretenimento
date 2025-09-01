import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Navigate } from 'react-router-dom';

interface AdminV3GuardProps {
  children: React.ReactNode;
}

export function AdminV3Guard({ children }: AdminV3GuardProps) {
  const { user, loading, isAdmin } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verificando acesso..." />
      </div>
    );
  }

  // Not logged in - redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Logged in but not admin - show access denied or redirect
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta área administrativa.
          </p>
          <p className="text-sm text-muted-foreground">
            Entre em contato com um administrador se acredita que isso é um erro.
          </p>
        </div>
      </div>
    );
  }

  // Admin access granted
  return <>{children}</>;
}