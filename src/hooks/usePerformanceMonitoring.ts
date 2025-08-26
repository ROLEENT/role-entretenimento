import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface PerformanceMetrics {
  page_load_time: number;
  api_response_time: number;
  database_query_time: number;
  memory_usage: number;
  cpu_usage: number;
  active_users: number;
  error_rate: number;
  uptime_percentage: number;
}

export interface PerformanceAlert {
  id: string;
  metric: string;
  threshold: number;
  current_value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  resolved: boolean;
}

export interface PerformanceOptimization {
  id: string;
  category: string;
  recommendation: string;
  impact: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_improvement: string;
  implemented: boolean;
}

export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [optimizations, setOptimizations] = useState<PerformanceOptimization[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  
  const { toast } = useToast();

  const fetchPerformanceMetrics = async () => {
    setLoading(true);
    try {
      // Simulate performance metrics - in a real app, this would come from monitoring services
      const mockMetrics: PerformanceMetrics = {
        page_load_time: 2.3,
        api_response_time: 150,
        database_query_time: 45,
        memory_usage: 67.5,
        cpu_usage: 23.8,
        active_users: 142,
        error_rate: 0.8,
        uptime_percentage: 99.96
      };
      
      setMetrics(mockMetrics);
      
      // Fetch real analytics data if available
      const { data: analyticsData } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', new Date(Date.now() - getTimeRangeMs()).toISOString())
        .order('created_at', { ascending: false });
      
      if (analyticsData) {
        // Process analytics data for performance insights
        const uniqueUsers = new Set(analyticsData.map(event => event.user_id)).size;
        setMetrics(prev => prev ? { ...prev, active_users: uniqueUsers } : null);
      }
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar métricas de performance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceAlerts = async () => {
    try {
      // Mock alerts - in production, these would come from monitoring systems
      const mockAlerts: PerformanceAlert[] = [
        {
          id: '1',
          metric: 'API Response Time',
          threshold: 200,
          current_value: 245,
          severity: 'medium',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          resolved: false
        },
        {
          id: '2',
          metric: 'Memory Usage',
          threshold: 80,
          current_value: 85.2,
          severity: 'high',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          resolved: false
        }
      ];
      
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error fetching performance alerts:', error);
    }
  };

  const fetchOptimizationRecommendations = async () => {
    try {
      const mockOptimizations: PerformanceOptimization[] = [
        {
          id: '1',
          category: 'Database',
          recommendation: 'Adicionar índice na coluna created_at da tabela events',
          impact: 'high',
          difficulty: 'easy',
          estimated_improvement: '40% mais rápido em consultas por data',
          implemented: false
        },
        {
          id: '2',
          category: 'Frontend',
          recommendation: 'Implementar lazy loading para imagens de eventos',
          impact: 'medium',
          difficulty: 'medium',
          estimated_improvement: '25% redução no tempo de carregamento',
          implemented: false
        },
        {
          id: '3',
          category: 'Caching',
          recommendation: 'Implementar cache Redis para dados de eventos',
          impact: 'high',
          difficulty: 'hard',
          estimated_improvement: '60% redução na latência de API',
          implemented: false
        }
      ];
      
      setOptimizations(mockOptimizations);
    } catch (error) {
      console.error('Error fetching optimization recommendations:', error);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, resolved: true }
            : alert
        )
      );
      
      toast({
        title: "Sucesso",
        description: "Alerta marcado como resolvido",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao resolver alerta",
        variant: "destructive",
      });
    }
  };

  const markOptimizationImplemented = async (optimizationId: string) => {
    try {
      setOptimizations(prev => 
        prev.map(opt => 
          opt.id === optimizationId 
            ? { ...opt, implemented: true }
            : opt
        )
      );
      
      toast({
        title: "Sucesso",
        description: "Otimização marcada como implementada",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar otimização",
        variant: "destructive",
      });
    }
  };

  const generatePerformanceReport = async () => {
    try {
      const report = {
        period: timeRange,
        generated_at: new Date().toISOString(),
        metrics,
        alerts: alerts.length,
        resolved_alerts: alerts.filter(a => a.resolved).length,
        optimizations_available: optimizations.filter(o => !o.implemented).length,
        optimizations_completed: optimizations.filter(o => o.implemented).length
      };
      
      // Convert to CSV
      const csvContent = [
        'Métrica,Valor',
        `Tempo de Carregamento,${metrics?.page_load_time}s`,
        `Tempo de Resposta API,${metrics?.api_response_time}ms`,
        `Tempo de Query DB,${metrics?.database_query_time}ms`,
        `Uso de Memória,${metrics?.memory_usage}%`,
        `Uso de CPU,${metrics?.cpu_usage}%`,
        `Usuários Ativos,${metrics?.active_users}`,
        `Taxa de Erro,${metrics?.error_rate}%`,
        `Uptime,${metrics?.uptime_percentage}%`
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Sucesso",
        description: "Relatório de performance exportado",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao gerar relatório",
        variant: "destructive",
      });
    }
  };

  const getTimeRangeMs = () => {
    switch (timeRange) {
      case '1h': return 60 * 60 * 1000;
      case '24h': return 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      case '30d': return 30 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  };

  useEffect(() => {
    fetchPerformanceMetrics();
    fetchPerformanceAlerts();
    fetchOptimizationRecommendations();
  }, [timeRange]);

  // Auto-refresh metrics every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchPerformanceMetrics, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  return {
    metrics,
    alerts,
    optimizations,
    loading,
    timeRange,
    setTimeRange,
    fetchPerformanceMetrics,
    resolveAlert,
    markOptimizationImplemented,
    generatePerformanceReport,
    refreshData: () => {
      fetchPerformanceMetrics();
      fetchPerformanceAlerts();
      fetchOptimizationRecommendations();
    }
  };
};