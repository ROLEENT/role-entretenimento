import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import EventEditPage from '@/pages/EventEditPage';
import { supabase } from '@/integrations/supabase/client';

export default function AdminV3AgendaCreate() {
  const navigate = useNavigate();
  const { user, session, loading, role, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Handle ESC key to cancel and go back to agenda
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        navigate('/admin-v3/agenda');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Handle authentication checking
  useEffect(() => {
    if (!loading) {
      try {
        if (!session) {
          navigate('/admin-v3/login');
          return;
        }
        setAuthChecked(true);
      } catch (error) {
        console.error('Error checking auth:', error);
        setError(error instanceof Error ? error.message : 'Erro de autenticação');
      }
    }
  }, [session, loading, navigate]);

  const handleCancel = () => {
    navigate('/admin-v3/agenda');
  };

  const handleRetry = () => {
    setError(null);
    window.location.reload();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin-v3/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Loading state - show skeleton
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Skeleton Breadcrumb */}
            <div className="flex items-center space-x-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-8" />
            </div>
            
            {/* Skeleton Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-20" />
            </div>

            {/* Skeleton Form */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <LoadingSpinner />
                  <p className="text-muted-foreground">Verificando acesso...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <AdminV3Breadcrumb 
              items={[
                { label: 'Agenda', path: '/admin-v3/agenda' },
                { label: 'Criar' }
              ]}
            />
            
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <AlertTriangle className="h-12 w-12 text-destructive" />
                  <div>
                    <h3 className="text-lg font-semibold text-destructive mb-2">
                      Erro ao carregar página
                    </h3>
                    <p className="text-sm text-destructive/80 mb-4">
                      {error}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleRetry} className="gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Tentar de novo
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Voltar para Agenda
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Viewer blocked state - local blocking without redirect
  if (role === 'viewer') {
    return (
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <AdminV3Breadcrumb 
              items={[
                { label: 'Agenda', path: '/admin-v3/agenda' },
                { label: 'Criar' }
              ]}
            />
            
            <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <AlertTriangle className="h-12 w-12 text-amber-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                      Acesso Negado
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                      Você não tem permissão para criar itens da agenda.
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Role atual: <strong>{role}</strong>
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleSignOut} variant="outline">
                      Sair
                    </Button>
                    <Button variant="secondary" onClick={handleCancel}>
                      Voltar para Agenda
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated and authorized - show main content
  return (
    <div className="min-h-screen bg-background">
      <AdminV3Header />
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <AdminV3Breadcrumb 
            items={[
              { label: 'Agenda', path: '/admin-v3/agenda' },
              { label: 'Criar' }
            ]}
          />
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Criar Agenda</h1>
              <p className="text-muted-foreground">
                Adicione um novo item à agenda
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="gap-2"
            >
              Cancelar
            </Button>
          </div>

          {/* New EventEditPage */}
          <EventEditPage />
        </div>
      </div>
    </div>
  );
}