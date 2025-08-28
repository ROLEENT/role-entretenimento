import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Clock, Shield, AlertTriangle } from 'lucide-react';
import { useSessionInfo } from '@/hooks/useSystemHealth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const SessionInfo = () => {
  const { data: session, isLoading, error } = useSessionInfo();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin-login');
  };

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Sessão e Segurança
        </CardTitle>
        <CardDescription>
          Informações da sessão atual
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Aviso de expiração */}
        {session.isExpiringSoon && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">Sessão expirando em breve</div>
              <div className="text-sm">
                Sua sessão expirará em menos de 15 minutos. 
                Salve seu trabalho e faça login novamente se necessário.
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Informações do usuário */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium">{session.user.email}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getRoleBadgeVariant(session.user.role)} className="text-xs">
                  {getRoleLabel(session.user.role)}
                </Badge>
                {session.user.role === 'admin' && (
                  <Badge variant="outline" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Acesso Total
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Detalhes da sessão */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Sessão expira em:</span>
            </div>
            <span className="font-medium">
              {session.expiresAt ? (
                format(session.expiresAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })
              ) : (
                'Indeterminado'
              )}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>Nível de acesso:</span>
            </div>
            <span className="font-medium">
              {session.user.role === 'admin' ? 'Administrador completo' : 'Editor limitado'}
            </span>
          </div>
        </div>

        {/* Dicas de segurança */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-sm font-medium mb-2">Dicas de Segurança</div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Sempre faça logout ao terminar</li>
            <li>• Não compartilhe suas credenciais</li>
            <li>• Mantenha suas senhas seguras</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};