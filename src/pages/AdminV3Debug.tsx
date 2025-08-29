import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

export default function AdminV3Debug() {
  const { user, session, loading, signOut } = useAuth();
  const [profileRole, setProfileRole] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const navigate = useNavigate();

  const projectRef = import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] || 'unknown';

  const fetchProfileRole = async () => {
    if (!session?.user?.id) return;
    
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .limit(1)
        .single();
      
      if (error) {
        setProfileError(`Erro ao consultar profile: ${error.message}`);
        setProfileRole(null);
      } else {
        setProfileRole(data?.role || 'null');
      }
    } catch (err) {
      setProfileError(`Erro na consulta: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      setProfileRole(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const reloadSession = async () => {
    try {
      await supabase.auth.getSession();
    } catch (err) {
      console.error('Erro ao recarregar sessão:', err);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin-v3/login');
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfileRole();
    }
  }, [session?.user?.id]);

  // Se não tem sessão, mostrar acesso negado (mas não redirecionar)
  if (!loading && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Debug - Sessão Requerida</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Esta página requer uma sessão ativa para acessar as informações de debug.
            </p>
            <Button onClick={() => navigate('/admin-v3/login')} className="w-full">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando debug..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin V3 Debug</h1>
          <div className="space-x-2">
            <Button onClick={reloadSession} variant="outline">
              Recarregar Sessão
            </Button>
            <Button onClick={fetchProfileRole} variant="outline">
              Reconsultar Profile
            </Button>
            <Button onClick={handleSignOut} variant="destructive">
              Sair
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Informações da Sessão */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Sessão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>User ID:</strong>
                <p className="font-mono text-sm bg-muted p-2 rounded mt-1">
                  {session?.user?.id || 'null'}
                </p>
              </div>
              <div>
                <strong>Email:</strong>
                <p className="font-mono text-sm bg-muted p-2 rounded mt-1">
                  {session?.user?.email || 'null'}
                </p>
              </div>
              <div>
                <strong>Project Ref:</strong>
                <p className="font-mono text-sm bg-muted p-2 rounded mt-1">
                  {projectRef}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Role</CardTitle>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <LoadingSpinner size="sm" text="Consultando profile..." />
              ) : profileError ? (
                <div className="text-destructive">
                  <p className="font-semibold">Erro:</p>
                  <p className="text-sm mt-1">{profileError}</p>
                </div>
              ) : (
                <div>
                  <strong>Role:</strong>
                  <p className="font-mono text-sm bg-muted p-2 rounded mt-1">
                    {profileRole}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Informações de Debug Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes Técnicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>Sessão Válida:</strong> {session ? 'Sim' : 'Não'}
            </div>
            <div>
              <strong>Timestamp:</strong> {new Date().toISOString()}
            </div>
            <div>
              <strong>URL Atual:</strong> {window.location.href}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}