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
    <Card className="min-h-[280px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Saúde do Sistema
        </CardTitle>
        <CardDescription>
          Status dos serviços essenciais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 p-4">
        {/* Storage - Movido para o topo e mais visível */}
        {health.storage.usage && (
          <div className="p-3 border rounded-lg bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Uso do Storage</span>
              </div>
              <Badge variant={health.storage.status === 'ok' ? 'default' : 'destructive'}>
                {health.storage.usage.percentage}%
              </Badge>
            </div>
            <Progress 
              value={health.storage.usage.percentage} 
              className="h-3" 
            />
            <div className="text-xs text-muted-foreground mt-1">
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
              <div className="flex items-center gap-2">
                {health.auth.status === 'ok' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 animate-pulse" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Autenticação</span>
              </div>
              {health.auth.status !== 'ok' && (
                <Badge variant="destructive" className="text-xs">
                  Erro
                </Badge>
              )}
            </div>

            {/* Banco de Dados */}
            <div className="flex items-center justify-between p-2 rounded-md bg-muted/10">
              <div className="flex items-center gap-2">
                {health.database.status === 'ok' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 animate-pulse" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Banco de Dados</span>
                {health.database.responseTime && (
                  <span className="text-xs text-muted-foreground">
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
              <div className="flex items-center gap-2">
                {health.storage.status === 'ok' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 animate-pulse" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Storage</span>
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