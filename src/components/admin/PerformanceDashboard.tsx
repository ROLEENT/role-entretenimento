import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePerformanceMonitoring, PerformanceMetrics } from "@/hooks/usePerformanceMonitoring";
import { AlertTriangle, TrendingUp, Activity, Zap, Clock, Users, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data for charts since we have single metrics object
const generateMockTimeSeriesData = (currentMetrics: PerformanceMetrics | null) => {
  if (!currentMetrics) return [];
  
  const data = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      page_load_time: currentMetrics.page_load_time + (Math.random() - 0.5) * 0.5,
      cpu_usage: currentMetrics.cpu_usage + (Math.random() - 0.5) * 10,
      memory_usage: currentMetrics.memory_usage + (Math.random() - 0.5) * 20,
      error_rate: currentMetrics.error_rate + (Math.random() - 0.5) * 1,
    });
  }
  
  return data;
};

export function PerformanceDashboard() {
  const {
    metrics,
    alerts,
    optimizations,
    loading,
    timeRange,
    setTimeRange,
    resolveAlert,
    markOptimizationImplemented,
    generatePerformanceReport
  } = usePerformanceMonitoring();

  const formatMetricValue = (value: number, unit: string) => {
    if (unit === 'ms') return `${value.toFixed(1)}ms`;
    if (unit === '%') return `${value.toFixed(1)}%`;
    if (unit === 'MB') return `${value.toFixed(2)}MB`;
    return value.toString();
  };

  const getPerformanceScore = () => {
    if (!metrics) return 0;
    // Calculate a score based on various metrics
    const loadTimeScore = Math.max(0, 100 - (metrics.page_load_time * 20)); // 2.5s = 50 points
    const cpuScore = Math.max(0, 100 - metrics.cpu_usage);
    const memoryScore = Math.max(0, 100 - (metrics.memory_usage / 10));
    const uptimeScore = metrics.uptime_percentage;
    const errorScore = Math.max(0, 100 - (metrics.error_rate * 20));
    
    return Math.round((loadTimeScore + cpuScore + memoryScore + uptimeScore + errorScore) / 5);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const chartData = generateMockTimeSeriesData(metrics);
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' && !alert.resolved);
  const highImpactOptimizations = optimizations.filter(opt => opt.impact === 'high' && !opt.implemented);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Performance Dashboard</h1>
          <p className="text-muted-foreground">Monitoramento em tempo real da performance da aplicação</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="1h">Última hora</option>
            <option value="24h">Últimas 24 horas</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>
          <Button onClick={generatePerformanceReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Score de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-bold ${getScoreColor(getPerformanceScore())}`}>
              {getPerformanceScore()}
            </div>
            <Progress value={getPerformanceScore()} className="flex-1" />
            <Badge variant={getPerformanceScore() >= 90 ? "default" : getPerformanceScore() >= 70 ? "secondary" : "destructive"}>
              {getPerformanceScore() >= 90 ? "Excelente" : getPerformanceScore() >= 70 ? "Bom" : "Precisa Melhorar"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Alertas Críticos ({criticalAlerts.length})</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              {criticalAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between">
                  <span>{alert.metric}: {alert.current_value} (limite: {alert.threshold})</span>
                  <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                    Resolver
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* High Impact Optimizations */}
      {highImpactOptimizations.length > 0 && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertTitle>Otimizações de Alto Impacto Disponíveis ({highImpactOptimizations.length})</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              {highImpactOptimizations.slice(0, 3).map((optimization) => (
                <div key={optimization.id} className="flex items-center justify-between">
                  <div>
                    <span>{optimization.recommendation}</span>
                    <Badge variant="secondary" className="ml-2">
                      {optimization.estimated_improvement}
                    </Badge>
                  </div>
                  <Button size="sm" onClick={() => markOptimizationImplemented(optimization.id)}>
                    Implementar
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="optimizations">Otimizações</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          {/* Core Web Vitals */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo de Carregamento</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics ? formatMetricValue(metrics.page_load_time, 'ms') : '0ms'}
                </div>
                <p className="text-xs text-muted-foreground">Core Web Vitals</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uso de CPU</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics ? formatMetricValue(metrics.cpu_usage, '%') : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">Processamento atual</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics ? metrics.active_users : 0}
                </div>
                <p className="text-xs text-muted-foreground">Online agora</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tempo de Carregamento</CardTitle>
                <CardDescription>Evolução ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(time) => format(new Date(time), 'HH:mm', { locale: ptBR })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(time) => format(new Date(time), 'dd/MM HH:mm', { locale: ptBR })}
                      formatter={(value) => [`${Number(value).toFixed(1)}ms`, 'Tempo de Carregamento']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="page_load_time" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uso de Recursos</CardTitle>
                <CardDescription>CPU e Memória</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(time) => format(new Date(time), 'HH:mm', { locale: ptBR })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(time) => format(new Date(time), 'dd/MM HH:mm', { locale: ptBR })}
                    />
                    <Area type="monotone" dataKey="cpu_usage" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" />
                    <Area type="monotone" dataKey="memory_usage" stackId="1" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tempo API</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {metrics ? formatMetricValue(metrics.api_response_time, 'ms') : '0ms'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Banco de Dados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {metrics ? formatMetricValue(metrics.database_query_time, 'ms') : '0ms'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Taxa de Erro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {metrics ? formatMetricValue(metrics.error_rate, '%') : '0%'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {metrics ? formatMetricValue(metrics.uptime_percentage, '%') : '0%'}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Performance</CardTitle>
              <CardDescription>Monitoramento automático de problemas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhum alerta ativo</p>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          alert.severity === 'critical' ? 'text-red-500' : 
                          alert.severity === 'high' ? 'text-orange-500' :
                          alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                        }`} />
                        <div>
                          <h4 className="font-medium">
                            {alert.metric}: {alert.current_value} (limite: {alert.threshold})
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          alert.severity === 'critical' ? 'destructive' : 
                          alert.severity === 'high' ? 'destructive' :
                          alert.severity === 'medium' ? 'secondary' : 'default'
                        }>
                          {alert.severity === 'critical' ? 'Crítico' : 
                           alert.severity === 'high' ? 'Alto' :
                           alert.severity === 'medium' ? 'Médio' : 'Baixo'}
                        </Badge>
                        {!alert.resolved && (
                          <Button size="sm" onClick={() => resolveAlert(alert.id)}>
                            Resolver
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recomendações de Otimização</CardTitle>
              <CardDescription>Sugestões para melhorar a performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhuma otimização disponível</p>
                ) : (
                  optimizations.map((optimization) => (
                    <div key={optimization.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{optimization.category}</h4>
                          <Badge variant={optimization.impact === 'high' ? 'default' : 'secondary'}>
                            {optimization.impact === 'high' ? 'Alto Impacto' : 
                             optimization.impact === 'medium' ? 'Médio Impacto' : 'Baixo Impacto'}
                          </Badge>
                          <Badge variant="outline">
                            {optimization.estimated_improvement}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{optimization.recommendation}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Dificuldade: {optimization.difficulty === 'easy' ? 'Fácil' : 
                                      optimization.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {optimization.implemented ? (
                          <Badge variant="default">Implementado</Badge>
                        ) : (
                          <Button size="sm" onClick={() => markOptimizationImplemented(optimization.id)}>
                            Implementar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Performance</CardTitle>
                <CardDescription>Análise dos tempos de carregamento</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.slice(-12)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(time) => format(new Date(time), 'HH:mm', { locale: ptBR })} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(time) => format(new Date(time), 'dd/MM HH:mm', { locale: ptBR })}
                      formatter={(value) => [`${Number(value).toFixed(1)}ms`, 'Tempo de Carregamento']}
                    />
                    <Bar dataKey="page_load_time" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Erro</CardTitle>
                <CardDescription>Monitoramento de erros ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(time) => format(new Date(time), 'HH:mm', { locale: ptBR })} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(time) => format(new Date(time), 'dd/MM HH:mm', { locale: ptBR })}
                      formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Taxa de Erro']}
                    />
                    <Line type="monotone" dataKey="error_rate" stroke="hsl(var(--destructive))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}