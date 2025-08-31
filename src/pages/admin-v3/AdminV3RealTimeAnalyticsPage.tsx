import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Users, Eye, Clock, RefreshCw, TrendingUp, Database, Wifi } from 'lucide-react';
import { useAdminSession } from '@/hooks/useAuth';
import { useAnalyticsAdmin, RealtimeMetrics } from '@/hooks/useAnalyticsAdmin';
import { toast } from 'sonner';

export default function AdminV3RealTimeAnalyticsPage() {
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { adminEmail } = useAdminSession();
  const { getRealtimeMetrics } = useAnalyticsAdmin();

  const fetchMetrics = async (showToast = false) => {
    if (!adminEmail) return;
    
    try {
      setLoading(true);
      const data = await getRealtimeMetrics(adminEmail);
      setMetrics(data);
      
      if (showToast) {
        toast.success('Métricas atualizadas');
      }
    } catch (error) {
      console.error('Error fetching realtime metrics:', error);
      toast.error('Erro ao carregar métricas em tempo real');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [adminEmail]);

  useEffect(() => {
    if (!autoRefresh || !adminEmail) return;
    
    const interval = setInterval(() => {
      fetchMetrics();
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, adminEmail]);

  const MetricCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    status,
    trend 
  }: { 
    title: string; 
    value: string | number; 
    description: string; 
    icon: any; 
    status?: 'good' | 'warning' | 'critical';
    trend?: number;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <div className={`flex items-center text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {trend > 0 ? '+' : ''}{trend}%
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Icon className="h-6 w-6 text-muted-foreground" />
            {status && (
              <Badge 
                variant={status === 'good' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}
                className="text-xs"
              >
                {status === 'good' ? 'Bom' : status === 'warning' ? 'Atenção' : 'Crítico'}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading && !metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics em Tempo Real</h1>
            <p className="text-muted-foreground">Monitoramento ao vivo do sistema</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics em Tempo Real</h1>
          <p className="text-muted-foreground">
            Monitoramento ao vivo do sistema • Atualiza a cada 10 segundos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Wifi className={`h-4 w-4 mr-2 ${autoRefresh ? 'text-green-500' : 'text-muted-foreground'}`} />
            {autoRefresh ? 'Ao Vivo' : 'Pausado'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMetrics(true)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {metrics && (
        <>
          {/* Main Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Usuários Ativos"
              value={metrics.active_users_last_hour}
              description="Última hora"
              icon={Users}
              status={metrics.active_users_last_hour > 10 ? 'good' : 'warning'}
            />
            
            <MetricCard
              title="Visualizações"
              value={metrics.page_views_last_hour}
              description="Última hora"
              icon={Eye}
              status={metrics.page_views_last_hour > 50 ? 'good' : 'warning'}
            />
            
            <MetricCard
              title="Tempo de Carregamento"
              value={`${metrics.avg_load_time_last_hour.toFixed(2)}s`}
              description="Média da última hora"
              icon={Clock}
              status={metrics.avg_load_time_last_hour < 3 ? 'good' : metrics.avg_load_time_last_hour < 5 ? 'warning' : 'critical'}
            />
            
            <MetricCard
              title="Erros"
              value={metrics.errors_last_hour}
              description="Última hora"
              icon={Activity}
              status={metrics.errors_last_hour === 0 ? 'good' : metrics.errors_last_hour < 5 ? 'warning' : 'critical'}
            />
          </div>

          {/* System Health */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Status do Sistema
                </CardTitle>
                <CardDescription>Saúde geral da infraestrutura</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Uptime</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${metrics.system_uptime}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{metrics.system_uptime}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Base de Dados</span>
                    <Badge variant={metrics.database_health === 'healthy' ? 'default' : 'destructive'}>
                      {metrics.database_health === 'healthy' ? 'Saudável' : 'Com Problemas'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taxa de Erro</span>
                    <span className="text-sm">
                      {((metrics.errors_last_hour / Math.max(metrics.page_views_last_hour, 1)) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atividade em Tempo Real</CardTitle>
                <CardDescription>Fluxo de dados atual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {metrics.active_users_last_hour}
                    </div>
                    <p className="text-sm text-muted-foreground">usuários conectados</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xl font-semibold">{metrics.page_views_last_hour}</div>
                      <p className="text-xs text-muted-foreground">views/hora</p>
                    </div>
                    <div>
                      <div className="text-xl font-semibold">
                        {(metrics.page_views_last_hour / 60).toFixed(1)}
                      </div>
                      <p className="text-xs text-muted-foreground">views/min</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Sessão</CardTitle>
              <CardDescription>Última atualização: {new Date().toLocaleTimeString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">
                    {Math.round(metrics.avg_load_time_last_hour * 1000)}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Latência Média</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-500">
                    {metrics.page_views_last_hour > 0 ? 
                      ((1 - metrics.errors_last_hour / metrics.page_views_last_hour) * 100).toFixed(1) : 
                      '100.0'
                    }%
                  </div>
                  <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-500">
                    {metrics.active_users_last_hour > 0 ? 
                      (metrics.page_views_last_hour / metrics.active_users_last_hour).toFixed(1) : 
                      '0'
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Pages/Usuário</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}