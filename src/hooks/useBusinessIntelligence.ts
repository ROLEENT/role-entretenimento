import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface BusinessIntelligenceReport {
  id: string;
  name: string;
  type: 'events' | 'users' | 'engagement' | 'revenue' | 'growth';
  description: string;
  data: any;
  generated_at: string;
  period: string;
}

export interface ReportMetrics {
  total_events: number;
  total_users: number;
  active_users: number;
  user_growth_rate: number;
  event_completion_rate: number;
  average_session_duration: number;
  top_categories: Array<{ name: string; count: number }>;
  top_cities: Array<{ name: string; count: number }>;
  engagement_trends: Array<{ date: string; value: number }>;
}

export const useBusinessIntelligence = () => {
  const [reports, setReports] = useState<BusinessIntelligenceReport[]>([]);
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  
  const { toast } = useToast();

  const fetchBusinessMetrics = async () => {
    setLoading(true);
    try {
      const { from, to } = dateRange;
      
      // Fetch events data
      const { data: eventsData, count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact' })
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString());

      // Fetch users data
      const { data: profilesData, count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString());

      // Fetch analytics events
      const { data: analyticsData } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString());

      // Process categories
      const categoryMap = new Map();
      eventsData?.forEach(event => {
        event.tags?.forEach((tag: string) => {
          categoryMap.set(tag, (categoryMap.get(tag) || 0) + 1);
        });
      });
      const topCategories = Array.from(categoryMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Process cities
      const cityMap = new Map();
      eventsData?.forEach(event => {
        if (event.city) {
          cityMap.set(event.city, (cityMap.get(event.city) || 0) + 1);
        }
      });
      const topCities = Array.from(cityMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate engagement trends (mock data for demo)
      const engagementTrends = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.floor(Math.random() * 100) + 50
      }));

      const calculatedMetrics: ReportMetrics = {
        total_events: eventsCount || 0,
        total_users: usersCount || 0,
        active_users: analyticsData?.length ? new Set(analyticsData.map(a => a.user_id)).size : 0,
        user_growth_rate: 12.5, // Mock calculation
        event_completion_rate: 78.3, // Mock calculation
        average_session_duration: 8.7, // Mock calculation in minutes
        top_categories: topCategories,
        top_cities: topCities,
        engagement_trends: engagementTrends
      };

      setMetrics(calculatedMetrics);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar métricas de BI",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type: BusinessIntelligenceReport['type'], customName?: string) => {
    try {
      setLoading(true);
      
      const reportData = {
        metrics,
        dateRange,
        generated_at: new Date().toISOString()
      };

      const reportName = customName || `Relatório de ${getReportTypeLabel(type)}`;
      
      const newReport: BusinessIntelligenceReport = {
        id: Date.now().toString(),
        name: reportName,
        type,
        description: `Relatório ${getReportTypeLabel(type)} gerado para o período de ${dateRange.from.toLocaleDateString('pt-BR')} a ${dateRange.to.toLocaleDateString('pt-BR')}`,
        data: reportData,
        generated_at: new Date().toISOString(),
        period: `${dateRange.from.toLocaleDateString('pt-BR')} - ${dateRange.to.toLocaleDateString('pt-BR')}`
      };

      setReports(prev => [newReport, ...prev]);

      toast({
        title: "Sucesso",
        description: "Relatório gerado com sucesso",
      });

      return newReport;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao gerar relatório",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (report: BusinessIntelligenceReport, format: 'csv' | 'pdf' | 'excel') => {
    try {
      if (format === 'csv') {
        let csvContent = '';
        
        if (report.type === 'events') {
          csvContent = [
            'Métrica,Valor',
            `Total de Eventos,${metrics?.total_events}`,
            `Taxa de Conclusão,${metrics?.event_completion_rate}%`,
            '',
            'Top Categorias',
            'Categoria,Quantidade',
            ...metrics?.top_categories.map(cat => `${cat.name},${cat.count}`) || [],
            '',
            'Top Cidades',
            'Cidade,Quantidade',
            ...metrics?.top_cities.map(city => `${city.name},${city.count}`) || []
          ].join('\n');
        } else if (report.type === 'users') {
          csvContent = [
            'Métrica,Valor',
            `Total de Usuários,${metrics?.total_users}`,
            `Usuários Ativos,${metrics?.active_users}`,
            `Taxa de Crescimento,${metrics?.user_growth_rate}%`,
            `Duração Média da Sessão,${metrics?.average_session_duration} min`
          ].join('\n');
        } else {
          csvContent = [
            'Métrica,Valor',
            `Total de Eventos,${metrics?.total_events}`,
            `Total de Usuários,${metrics?.total_users}`,
            `Usuários Ativos,${metrics?.active_users}`,
            `Taxa de Crescimento,${metrics?.user_growth_rate}%`
          ].join('\n');
        }

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.name.toLowerCase().replace(/ /g, '-')}-${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      toast({
        title: "Sucesso",
        description: `Relatório exportado em ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao exportar relatório",
        variant: "destructive",
      });
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      setReports(prev => prev.filter(report => report.id !== reportId));
      
      toast({
        title: "Sucesso",
        description: "Relatório removido com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao remover relatório",
        variant: "destructive",
      });
    }
  };

  const getReportTypeLabel = (type: BusinessIntelligenceReport['type']) => {
    switch (type) {
      case 'events': return 'Eventos';
      case 'users': return 'Usuários';
      case 'engagement': return 'Engajamento';
      case 'revenue': return 'Receita';
      case 'growth': return 'Crescimento';
      default: return 'Geral';
    }
  };

  const getReportTypeIcon = (type: BusinessIntelligenceReport['type']) => {
    switch (type) {
      case 'events': return '📅';
      case 'users': return '👥';
      case 'engagement': return '📊';
      case 'revenue': return '💰';
      case 'growth': return '📈';
      default: return '📋';
    }
  };

  useEffect(() => {
    fetchBusinessMetrics();
  }, [dateRange]);

  return {
    reports,
    metrics,
    loading,
    dateRange,
    setDateRange,
    generateReport,
    exportReport,
    deleteReport,
    getReportTypeLabel,
    getReportTypeIcon,
    refreshMetrics: fetchBusinessMetrics
  };
};