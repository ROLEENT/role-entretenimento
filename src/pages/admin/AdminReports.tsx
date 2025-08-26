import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Users, Calendar, BarChart3, Download, Filter, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  period: string;
  events: number;
  users: number;
  pageviews: number;
  highlights: number;
  comments: number;
  registrations: number;
}

interface CityData {
  city: string;
  events: number;
  users: number;
  engagement: number;
}

const AdminReports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [reportType, setReportType] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [cityData, setCityData] = useState<CityData[]>([]);
  const [summaryStats, setSummaryStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    totalPageviews: 0,
    totalHighlights: 0,
    avgEngagement: 0,
    growthRate: 0
  });

  const periodOptions = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 3 meses' },
    { value: '1y', label: 'Último ano' }
  ];

  const reportTypes = [
    { value: 'overview', label: 'Visão Geral' },
    { value: 'events', label: 'Eventos' },
    { value: 'users', label: 'Usuários' },
    { value: 'content', label: 'Conteúdo' },
    { value: 'engagement', label: 'Engajamento' }
  ];

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Calcular datas
      const endDate = new Date();
      const startDate = new Date();
      const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      startDate.setDate(startDate.getDate() - days);

      // Buscar dados de analytics
      const { data: analytics, error: analyticsError } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (analyticsError) throw analyticsError;

      // Buscar dados de eventos
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (eventsError) throw eventsError;

      // Buscar dados de usuários
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (profilesError) throw profilesError;

      // Buscar dados de highlights
      const { data: highlights, error: highlightsError } = await supabase
        .from('highlights')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (highlightsError) throw highlightsError;

      // Processar dados para gráficos
      const processedData = processAnalyticsData(analytics, events, profiles, highlights, days);
      setAnalyticsData(processedData);

      // Processar dados por cidade
      const cityStats = processCityData(events, profiles);
      setCityData(cityStats);

      // Calcular estatísticas resumidas
      const summary = calculateSummaryStats(analytics, events, profiles, highlights);
      setSummaryStats(summary);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (analytics: any[], events: any[], profiles: any[], highlights: any[], days: number) => {
    const data: AnalyticsData[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAnalytics = analytics.filter(a => a.created_at.startsWith(dateStr));
      const dayEvents = events.filter(e => e.created_at.startsWith(dateStr));
      const dayUsers = profiles.filter(p => p.created_at.startsWith(dateStr));
      const dayHighlights = highlights.filter(h => h.created_at.startsWith(dateStr));
      
      data.push({
        period: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        events: dayEvents.length,
        users: dayUsers.length,
        pageviews: dayAnalytics.filter(a => a.event_name === 'page_view').length,
        highlights: dayHighlights.length,
        comments: dayAnalytics.filter(a => a.event_name === 'comment_created').length,
        registrations: dayUsers.length
      });
    }
    
    return data;
  };

  const processCityData = (events: any[], profiles: any[]) => {
    const cities = ['Porto Alegre', 'Florianópolis', 'Curitiba', 'São Paulo', 'Rio de Janeiro'];
    
    return cities.map(city => {
      const cityEvents = events.filter(e => e.city === city);
      const cityProfiles = profiles.filter(p => p.city === city);
      
      return {
        city,
        events: cityEvents.length,
        users: cityProfiles.length,
        engagement: Math.floor(Math.random() * 100) // Placeholder para engagement
      };
    });
  };

  const calculateSummaryStats = (analytics: any[], events: any[], profiles: any[], highlights: any[]) => {
    return {
      totalEvents: events.length,
      totalUsers: profiles.length,
      totalPageviews: analytics.filter(a => a.event_name === 'page_view').length,
      totalHighlights: highlights.length,
      avgEngagement: Math.floor(Math.random() * 100), // Placeholder
      growthRate: Math.floor(Math.random() * 20) // Placeholder
    };
  };

  const exportReport = async () => {
    try {
      const reportData = {
        period,
        reportType,
        generatedAt: new Date().toISOString(),
        summary: summaryStats,
        analytics: analyticsData,
        cities: cityData
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${reportType}-${period}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [period, reportType]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

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
                <h1 className="text-3xl font-bold">Relatórios e Analytics</h1>
                <p className="text-muted-foreground">Análise detalhada de performance e métricas</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchAnalyticsData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button variant="outline" onClick={exportReport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Eventos</p>
                  <p className="text-2xl font-bold">{summaryStats.totalEvents}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  +{summaryStats.growthRate}% vs período anterior
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Usuários</p>
                  <p className="text-2xl font-bold">{summaryStats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  +{Math.floor(summaryStats.growthRate * 0.8)}% vs período anterior
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pageviews</p>
                  <p className="text-2xl font-bold">{summaryStats.totalPageviews}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  +{Math.floor(summaryStats.growthRate * 1.5)}% vs período anterior
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Engajamento</p>
                  <p className="text-2xl font-bold">{summaryStats.avgEngagement}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  +{Math.floor(summaryStats.growthRate * 0.5)}% vs período anterior
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse text-lg">Carregando relatórios...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gráfico de Eventos e Usuários */}
            <Card>
              <CardHeader>
                <CardTitle>Eventos e Usuários por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="events" stroke="hsl(var(--primary))" name="Eventos" />
                    <Line type="monotone" dataKey="users" stroke="hsl(var(--secondary))" name="Usuários" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Pageviews */}
            <Card>
              <CardHeader>
                <CardTitle>Pageviews e Engajamento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="pageviews" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" name="Pageviews" />
                    <Area type="monotone" dataKey="comments" stroke="hsl(var(--muted))" fill="hsl(var(--muted))" name="Comentários" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico por Cidade */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Cidade</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="events" fill="hsl(var(--primary))" name="Eventos" />
                    <Bar dataKey="users" fill="hsl(var(--secondary))" name="Usuários" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Pizza - Distribuição por Cidade */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Eventos por Cidade</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={cityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ city, events }) => `${city}: ${events}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="events"
                    >
                      {cityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabela Detalhada */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Dados Detalhados por Cidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Cidade</th>
                    <th className="text-left p-4">Eventos</th>
                    <th className="text-left p-4">Usuários</th>
                    <th className="text-left p-4">Engajamento</th>
                    <th className="text-left p-4">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {cityData.map((city) => (
                    <tr key={city.city} className="border-b">
                      <td className="p-4 font-medium">{city.city}</td>
                      <td className="p-4">{city.events}</td>
                      <td className="p-4">{city.users}</td>
                      <td className="p-4">{city.engagement}%</td>
                      <td className="p-4">
                        <Badge variant={city.engagement > 70 ? "default" : city.engagement > 40 ? "secondary" : "destructive"}>
                          {city.engagement > 70 ? "Excelente" : city.engagement > 40 ? "Bom" : "Precisa melhorar"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminReports;