import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Activity, Database, Globe, Server, AlertTriangle, CheckCircle, Clock, Zap, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetric {
  id: string;
  metric_name: string;
  value: number;
  threshold_warning: number;
  threshold_critical: number;
  timestamp: string;
  metadata?: any;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  issues: string[];
  recommendations: string[];
}

const AdminPerformanceMonitor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    score: 95,
    issues: [],
    recommendations: []
  });
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 0,
    responseTime: 0,
    errorRate: 0,
    throughput: 0
  });

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      
      // Buscar métricas de performance dos últimos 24h
      const { data: performanceData, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      setMetrics(performanceData || []);
      
      // Calcular saúde do sistema
      calculateSystemHealth(performanceData || []);
      
      // Simular dados em tempo real (substituir por dados reais em produção)
      updateRealTimeData();
      
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      toast.error('Erro ao carregar métricas de performance');
    } finally {
      setLoading(false);
    }
  };

  const calculateSystemHealth = (metricsData: PerformanceMetric[]) => {
    if (!metricsData.length) {
      setSystemHealth({
        status: 'warning',
        score: 0,
        issues: ['Nenhuma métrica disponível'],
        recommendations: ['Verificar sistema de monitoramento']
      });
      return;
    }

    const issues: string[] = [];
    const recommendations: string[] = [];
    let totalScore = 100;

    // Analisar cada métrica
    metricsData.forEach(metric => {
      if (metric.value >= metric.threshold_critical) {
        issues.push(`${metric.metric_name} está em nível crítico`);
        recommendations.push(`Investigar imediatamente ${metric.metric_name}`);
        totalScore -= 20;
      } else if (metric.value >= metric.threshold_warning) {
        issues.push(`${metric.metric_name} está acima do limite recomendado`);
        recommendations.push(`Monitorar ${metric.metric_name} de perto`);
        totalScore -= 10;
      }
    });

    const status = totalScore >= 80 ? 'healthy' : totalScore >= 60 ? 'warning' : 'critical';

    setSystemHealth({
      status,
      score: Math.max(totalScore, 0),
      issues,
      recommendations
    });
  };

  const updateRealTimeData = () => {
    // Simular dados em tempo real (substituir por dados reais)
    setRealTimeData({
      activeUsers: Math.floor(Math.random() * 100) + 50,
      responseTime: Math.floor(Math.random() * 500) + 100,
      errorRate: Math.random() * 2,
      throughput: Math.floor(Math.random() * 1000) + 500
    });
  };

  useEffect(() => {
    fetchMetrics();
    
    // Atualizar dados em tempo real a cada 30 segundos
    const interval = setInterval(updateRealTimeData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getMetricStatus = (metric: PerformanceMetric) => {
    if (metric.value >= metric.threshold_critical) return 'critical';
    if (metric.value >= metric.threshold_warning) return 'warning';
    return 'healthy';
  };

  const formatMetricValue = (metricName: string, value: number) => {
    switch (metricName) {
      case 'response_time':
        return `${value.toFixed(0)}ms`;
      case 'error_rate':
        return `${value.toFixed(2)}%`;
      case 'memory_usage':
      case 'cpu_usage':
      case 'disk_usage':
        return `${value.toFixed(1)}%`;
      case 'database_connections':
        return value.toString();
      default:
        return value.toFixed(2);
    }
  };

  const metricCategories = {
    'Performance': ['response_time', 'throughput', 'error_rate'],
    'Sistema': ['cpu_usage', 'memory_usage', 'disk_usage'],
    'Database': ['database_connections', 'query_time', 'db_size'],
    'Rede': ['bandwidth_usage', 'connection_count', 'network_latency']
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/admin')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Monitor de Performance</h1>
                <p className="text-muted-foreground">Monitoramento em tempo real do sistema</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(systemHealth.status)}
              <div>
                <p className="text-sm font-medium">Status do Sistema</p>
                <p className={`text-sm capitalize ${getStatusColor(systemHealth.status)}`}>
                  {systemHealth.status === 'healthy' ? 'Saudável' : 
                   systemHealth.status === 'warning' ? 'Atenção' : 'Crítico'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Geral */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Saúde do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Score Geral</span>
                  <span className="text-2xl font-bold">{systemHealth.score}%</span>
                </div>
                <Progress value={systemHealth.score} className="h-2" />
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Problemas Identificados</p>
                <div className="space-y-1">
                  {systemHealth.issues.length === 0 ? (
                    <p className="text-sm text-green-600">Nenhum problema detectado</p>
                  ) : (
                    systemHealth.issues.slice(0, 3).map((issue, index) => (
                      <p key={index} className="text-sm text-yellow-600">• {issue}</p>
                    ))
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Recomendações</p>
                <div className="space-y-1">
                  {systemHealth.recommendations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sistema operando normalmente</p>
                  ) : (
                    systemHealth.recommendations.slice(0, 3).map((rec, index) => (
                      <p key={index} className="text-sm text-blue-600">• {rec}</p>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas em Tempo Real */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                  <p className="text-2xl font-bold">{realTimeData.activeUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
              <Badge variant="outline" className="mt-2">
                Tempo real
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tempo de Resposta</p>
                  <p className="text-2xl font-bold">{realTimeData.responseTime}ms</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <Badge variant={realTimeData.responseTime > 1000 ? "destructive" : realTimeData.responseTime > 500 ? "secondary" : "default"}>
                {realTimeData.responseTime > 1000 ? "Lento" : realTimeData.responseTime > 500 ? "Normal" : "Rápido"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Erro</p>
                  <p className="text-2xl font-bold">{realTimeData.errorRate.toFixed(2)}%</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-primary" />
              </div>
              <Badge variant={realTimeData.errorRate > 5 ? "destructive" : realTimeData.errorRate > 2 ? "secondary" : "default"}>
                {realTimeData.errorRate > 5 ? "Alto" : realTimeData.errorRate > 2 ? "Médio" : "Baixo"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Throughput</p>
                  <p className="text-2xl font-bold">{realTimeData.throughput}</p>
                </div>
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <Badge variant="outline" className="mt-2">
                req/min
              </Badge>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse text-lg">Carregando métricas...</div>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(metricCategories).map(([category, metricNames]) => {
              const categoryMetrics = metrics.filter(m => metricNames.includes(m.metric_name));
              
              if (categoryMetrics.length === 0) return null;
              
              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {category === 'Performance' && <Globe className="h-5 w-5" />}
                      {category === 'Sistema' && <Server className="h-5 w-5" />}
                      {category === 'Database' && <Database className="h-5 w-5" />}
                      {category === 'Rede' && <Activity className="h-5 w-5" />}
                      Métricas de {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryMetrics.map((metric) => {
                        const status = getMetricStatus(metric);
                        const progressValue = Math.min((metric.value / metric.threshold_critical) * 100, 100);
                        
                        return (
                          <div key={metric.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium capitalize">
                                {metric.metric_name.replace('_', ' ')}
                              </span>
                              <Badge variant={status === 'critical' ? "destructive" : status === 'warning' ? "secondary" : "default"}>
                                {formatMetricValue(metric.metric_name, metric.value)}
                              </Badge>
                            </div>
                            <Progress 
                              value={progressValue} 
                              className={`h-2 ${status === 'critical' ? 'bg-red-100' : status === 'warning' ? 'bg-yellow-100' : 'bg-green-100'}`}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>Limite: {formatMetricValue(metric.metric_name, metric.threshold_warning)}</span>
                              <span>Crítico: {formatMetricValue(metric.metric_name, metric.threshold_critical)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {metrics.length === 0 && !loading && (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma métrica disponível</h3>
            <p className="text-muted-foreground mb-4">
              As métricas de performance serão exibidas conforme o sistema coleta dados
            </p>
            <Button onClick={fetchMetrics}>
              Atualizar Métricas
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminPerformanceMonitor;