import { useState, useEffect } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Shield, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const AuthStatusIndicator = () => {
  const { user, role, isAuthenticated, isAdmin, loading } = useSecureAuth();
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const checkSystemStatus = async () => {
    if (!user?.email) return;
    
    try {
      setLoadingStatus(true);
      const { data, error } = await supabase
        .rpc('debug_auth_system', { p_user_email: user.email });
      
      if (error) throw error;
      setSystemStatus(data);
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      checkSystemStatus();
    }
  }, [isAuthenticated, user?.email]);

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-muted h-10 w-10"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-destructive font-medium">Não autenticado</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Status de Autenticação
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={checkSystemStatus}
            disabled={loadingStatus}
          >
            <RefreshCw className={`h-4 w-4 ${loadingStatus ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status de Autenticação */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge variant={isAuthenticated ? 'default' : 'destructive'}>
            {isAuthenticated ? 'Autenticado' : 'Não autenticado'}
          </Badge>
        </div>

        {/* Email do usuário */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Email:</span>
          <span className="text-sm font-medium">{user?.email}</span>
        </div>

        {/* Role do usuário */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Role:</span>
          <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
            {role || 'N/A'}
          </Badge>
        </div>

        {/* Status de Admin */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Admin:</span>
          <div className="flex items-center space-x-1">
            {isAdmin ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            )}
            <Badge variant={isAdmin ? 'default' : 'outline'}>
              {isAdmin ? 'Sim' : 'Não'}
            </Badge>
          </div>
        </div>

        {/* Consistência do Sistema */}
        {systemStatus?.consistency_check && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Consistência:</span>
              <Badge variant={systemStatus.consistency_check.is_consistent ? 'default' : 'destructive'}>
                {systemStatus.consistency_check.is_consistent ? 'OK' : 'Inconsistente'}
              </Badge>
            </div>
            
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>Approved Admin: {systemStatus.consistency_check.in_approved_admins ? '✓' : '✗'}</div>
              <div>Admin User: {systemStatus.consistency_check.in_admin_users ? '✓' : '✗'}</div>
              <div>Profile Admin: {systemStatus.consistency_check.profile_is_admin ? '✓' : '✗'}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};