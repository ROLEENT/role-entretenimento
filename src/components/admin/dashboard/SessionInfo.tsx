import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Clock, Shield, AlertTriangle, Eye, Lock, HelpCircle } from 'lucide-react';
import { useSessionInfo } from '@/hooks/useSystemHealth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from 'react';

export const SessionInfo = () => {
  const { data: session, isLoading, error } = useSessionInfo();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin-login');
  };

  // Contagem regressiva para expiração
  useEffect(() => {
    if (!session?.expiresAt) return;

    const updateTimeLeft = () => {
      const minutes = differenceInMinutes(session.expiresAt!, new Date());
      setTimeLeft(Math.max(0, minutes));
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, [session?.expiresAt]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Sessão
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error || !session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Sessão
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-destructive mb-4">
            Erro na sessão ou não autenticado
          </div>
          <Button onClick={() => navigate('/admin-login')}>
            Fazer Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'editor': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'editor': return 'Editor';
      default: return 'Usuário';
    }
  };

  return (
    <Card className="min-h-[450px] flex flex-col shadow-md border-0 bg-gradient-card">
      <CardHeader className="flex-shrink-0 pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          <User className="h-6 w-6 text-primary" />
          Sessão e Segurança
        </CardTitle>
        <CardDescription className="text-base">
          Informações da sessão atual e segurança
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 p-4">
        {/* Aviso de expiração com contagem regressiva */}
        {session.isExpiringSoon && (
          <Alert className="border-orange-200 bg-orange-50/50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <div className="font-medium text-orange-800">Sessão expirando em breve!</div>
              <div className="text-sm text-orange-700 mt-1">
                {timeLeft !== null && timeLeft > 0 ? (
                  <>Restam <strong>{timeLeft} minutos</strong>. Salve seu trabalho!</>
                ) : (
                  <>Sessão expirada. Faça login novamente.</>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Informações do usuário - Destaque maior */}
        <div className="p-6 border-2 border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-lg text-primary truncate">{session.user.email}</div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant={getRoleBadgeVariant(session.user.role)} className="text-sm font-semibold bg-primary text-primary-foreground">
                    {getRoleLabel(session.user.role)}
                  </Badge>
                  {session.user.role === 'admin' && (
                    <Badge variant="outline" className="text-sm border-success text-success font-semibold">
                      <Shield className="h-3 w-3 mr-1" />
                      Acesso Total
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button 
              size="lg"
              onClick={handleLogout}
              className="ml-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Detalhes da sessão */}
        <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Expira em:</span>
            </div>
            <div className="text-right">
              {session.expiresAt ? (
                <>
                  <div className="font-medium">
                    {format(session.expiresAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </div>
                  {timeLeft !== null && (
                    <div className="text-xs text-muted-foreground">
                      {timeLeft > 0 ? `${timeLeft} min restantes` : 'Expirada'}
                    </div>
                  )}
                </>
              ) : (
                'Indeterminado'
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>Permissões:</span>
            </div>
            <span className="font-medium">
              {session.user.role === 'admin' ? 'Total' : 'Limitado'}
            </span>
          </div>
        </div>

        {/* Dicas de segurança com ícones */}
        <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-sm font-medium mb-3 text-blue-800">
            <HelpCircle className="h-4 w-4" />
            Dicas de Segurança
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-blue-700">
              <LogOut className="h-3 w-3" />
              <span>Sempre faça logout ao terminar</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-700">
              <Lock className="h-3 w-3" />
              <span>Não compartilhe suas credenciais</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-700">
              <Eye className="h-3 w-3" />
              <span>Monitore atividades suspeitas</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};