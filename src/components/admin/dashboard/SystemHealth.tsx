import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Database, Shield, HardDrive, Wifi, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const SystemHealth = () => {
  const { data: health, isLoading, error } = useSystemHealth();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Saúde do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error || !health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Saúde do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-destructive">
          Erro ao verificar status do sistema
          <button 
            onClick={() => window.location.reload()} 
            className="block mx-auto mt-2 text-sm underline"
          >
            Recarregar
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-h-[450px] flex flex-col shadow-md border-0 bg-gradient-card">
      <CardHeader className="flex-shrink-0 pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          <Activity className="h-6 w-6 text-primary" />
          Saúde do Sistema
        </CardTitle>
        <CardDescription className="text-base">
          Status dos serviços essenciais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 p-4">
        {/* Storage - Destaque no topo */}
        {health.storage.usage && (
          <div className="p-4 border-2 border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <HardDrive className="h-5 w-5 text-primary" />
                <span className="font-bold text-lg">Uso do Storage</span>
              </div>
              <Badge 
                variant={health.storage.status === 'ok' ? 'default' : 'destructive'}
                className="text-sm font-bold bg-primary text-primary-foreground"
              >
                {health.storage.usage.percentage}%
              </Badge>
            </div>
            <Progress 
              value={health.storage.usage.percentage} 
              className="h-4" 
            />
            <div className="text-sm text-muted-foreground mt-2 font-medium">
              {health.storage.usage.used}GB / {health.storage.usage.total}GB utilizados
            </div>
          </div>
        )}

        {/* Status dos Serviços - Mais compacto */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Serviços</div>
          
          {/* Grid de serviços */}
          <div className="grid grid-cols-1 gap-2">
            {/* Autenticação */}
            <div className="flex items-center justify-between p-2 rounded-md bg-muted/10">
              <div className="flex items-center gap-3">
                {health.auth.status === 'ok' ? (
                  <CheckCircle2 className="h-5 w-5 text-success animate-pulse" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                <span className="text-sm font-medium">Autenticação</span>
              </div>
              {health.auth.status !== 'ok' && (
                <Badge variant="destructive" className="text-xs">
                  Erro
                </Badge>
              )}
            </div>

            {/* Banco de Dados */}
            <div className="flex items-center justify-between p-2 rounded-md bg-muted/10">
              <div className="flex items-center gap-3">
                {health.database.status === 'ok' ? (
                  <CheckCircle2 className="h-5 w-5 text-success animate-pulse" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                <span className="text-sm font-medium">Banco de Dados</span>
                {health.database.responseTime && (
                  <span className="text-xs text-muted-foreground font-medium">
                    ({health.database.responseTime}ms)
                  </span>
                )}
              </div>
              {health.database.status !== 'ok' && (
                <Badge variant="destructive" className="text-xs">
                  Erro
                </Badge>
              )}
            </div>

            {/* Storage */}
            <div className="flex items-center justify-between p-2 rounded-md bg-muted/10">
              <div className="flex items-center gap-3">
                {health.storage.status === 'ok' ? (
                  <CheckCircle2 className="h-5 w-5 text-success animate-pulse" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                <span className="text-sm font-medium">Storage</span>
              </div>
              {health.storage.status !== 'ok' && (
                <Badge variant="destructive" className="text-xs">
                  Erro
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};