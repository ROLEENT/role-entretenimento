import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Database, HardDrive, Wifi, AlertCircle, CheckCircle } from 'lucide-react';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const SystemHealth = () => {
  const { data: health, isLoading, error } = useSystemHealth();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Saúde do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
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

  const services = [
    {
      name: 'Autenticação',
      icon: Shield,
      status: health?.auth.status || 'error',
      message: health?.auth.message || 'Erro desconhecido',
    },
    {
      name: 'Banco de Dados',
      icon: Database,
      status: health?.database.status || 'error',
      message: health?.database.message || 'Erro desconhecido',
      responseTime: health?.database.responseTime,
    },
    {
      name: 'Storage',
      icon: HardDrive,
      status: health?.storage.status || 'error',
      message: health?.storage.message || 'Erro desconhecido',
    },
  ];

  const allServicesOk = services.every(service => service.status === 'ok');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Saúde do Sistema
        </CardTitle>
        <CardDescription>
          Status das integrações e serviços
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status geral */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            {allServicesOk ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <div>
              <div className="font-medium">
                {allServicesOk ? 'Todos os serviços operacionais' : 'Problemas detectados'}
              </div>
              <div className="text-xs text-muted-foreground">
                {services.filter(s => s.status === 'ok').length}/{services.length} serviços ativos
              </div>
            </div>
          </div>
          <Badge variant={allServicesOk ? 'default' : 'destructive'}>
            {allServicesOk ? 'OK' : 'ALERTA'}
          </Badge>
        </div>

        {/* Detalhes dos serviços */}
        <div className="space-y-2">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <service.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">{service.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {service.message}
                    {service.responseTime && (
                      <span className="ml-2">({service.responseTime}ms)</span>
                    )}
                  </div>
                </div>
              </div>
              <Badge 
                variant={service.status === 'ok' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {service.status === 'ok' ? 'OK' : 'ERRO'}
              </Badge>
            </div>
          ))}
        </div>

        {/* Uso do storage */}
        {health?.storage.usage && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uso do Storage Admin</span>
              <span>{health.storage.usage.percentage}%</span>
            </div>
            <Progress value={health.storage.usage.percentage} className="h-2" />
            <div className="text-xs text-muted-foreground text-center">
              {health.storage.usage.used}GB / {health.storage.usage.total}GB utilizados
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};