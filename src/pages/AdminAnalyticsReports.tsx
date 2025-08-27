import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Download, 
  TrendingUp, 
  Users, 
  MousePointer, 
  Eye, 
  Target,
  Calendar,
  MapPin,
  Filter,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  date: string;
  event_name: string;
  city: string;
  source: string;
  event_count: number;
  unique_users: number;
  unique_sessions: number;
}

interface AnalyticsTotals {
  total_events: number;
  total_pageviews: number;
  total_clicks: number;
  total_conversions: number;
  unique_users: number;
  unique_sessions: number;
  top_cities: Array<{ city: string; count: number }>;
  top_sources: Array<{ source: string; count: number }>;
}

interface DailyAnalytics {
  date: string;
  pageviews: number;
  clicks: number;
  conversions: number;
  unique_users: number;
}

interface Filters {
  startDate: string;
  endDate: string;
  city: string;
  source: string;
  eventName: string;
}

const cities = [
  'São Paulo',
  'Rio de Janeiro',
  'Belo Horizonte',
  'Brasília',
  'Salvador',
  'Fortaleza',
  'Recife',
  'Porto Alegre',
  'Curitiba',
  'Goiânia'
];

const sources = ['web', 'mobile', 'email', 'social', 'direct', 'google', 'ads'];
const eventNames = ['pageview', 'click', 'cta_click', 'form_submit', 'download', 'signup'];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff7f', '#ff1493'];

const AdminAnalyticsReports: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [totals, setTotals] = useState<AnalyticsTotals | null>(null);
  const [dailyData, setDailyData] = useState<DailyAnalytics[]>([]);
  
  const [filters, setFilters] = useState<Filters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    city: '',
    source: '',
    eventName: ''
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [filters]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel for better performance
      const [totalsResult, dailyResult, detailedResult] = await Promise.all([
        supabase.rpc('get_analytics_totals', {
          p_start_date: filters.startDate,
          p_end_date: filters.endDate,
          p_city: filters.city || null,
          p_source: filters.source || null
        }),
        supabase.rpc('get_daily_analytics', {
          p_start_date: filters.startDate,
          p_end_date: filters.endDate,
          p_city: filters.city || null,
          p_source: filters.source || null
        }),
        supabase.rpc('get_analytics_data', {
          p_start_date: filters.startDate,
          p_end_date: filters.endDate,
          p_city: filters.city || null,
          p_source: filters.source || null,
          p_event_name: filters.eventName || null,
          p_limit: 1000,
          p_offset: 0
        })
      ]);

      if (totalsResult.error) throw totalsResult.error;
      if (dailyResult.error) throw dailyResult.error;
      if (detailedResult.error) throw detailedResult.error;

      setTotals(totalsResult.data?.[0] || null);
      setDailyData(dailyResult.data || []);
      setAnalyticsData(detailedResult.data || []);

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados de analytics.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      city: '',
      source: '',
      eventName: ''
    });
  };

  const exportToCSV = async () => {
    try {
      setExporting(true);
      
      const csvData = analyticsData.map(row => ({
        Data: row.date,
        Evento: row.event_name,
        Cidade: row.city || 'N/A',
        Fonte: row.source || 'N/A',
        'Total de Eventos': row.event_count,
        'Usuários Únicos': row.unique_users,
        'Sessões Únicas': row.unique_sessions
      }));

      const csvContent = [
        Object.keys(csvData[0] || {}).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics-report-${filters.startDate}-${filters.endDate}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export Concluído',
        description: 'Relatório exportado com sucesso!',
        variant: 'default'
      });

    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar dados.',
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  // Memoized chart data for better performance
  const chartData = useMemo(() => {
    const dailyChartData = dailyData.map(day => ({
      date: new Date(day.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
      'Page Views': Number(day.pageviews),
      'Clicks': Number(day.clicks),
      'Conversões': Number(day.conversions),
      'Usuários': Number(day.unique_users)
    }));

    const cityData = totals?.top_cities?.slice(0, 8).map((item, index) => ({
      name: item.city,
      value: item.count,
      fill: COLORS[index % COLORS.length]
    })) || [];

    const sourceData = totals?.top_sources?.slice(0, 6).map((item, index) => ({
      name: item.source,
      value: item.count,
      fill: COLORS[index % COLORS.length]
    })) || [];

    return { dailyChartData, cityData, sourceData };
  }, [dailyData, totals]);

  const conversionRate = totals && totals.total_pageviews > 0 
    ? ((totals.total_conversions / totals.total_pageviews) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Relatórios de Analytics</h1>
                <p className="text-muted-foreground">Análise detalhada de tráfego e conversões</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                disabled={loading}
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
              <Button 
                variant="outline"
                onClick={fetchAnalyticsData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                onClick={exportToCSV}
                disabled={exporting || analyticsData.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exportando...' : 'Export CSV'}
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="startDate">Data Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Data Fim</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as cidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as cidades</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="source">Fonte</Label>
                  <Select value={filters.source} onValueChange={(value) => handleFilterChange('source', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as fontes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as fontes</SelectItem>
                      {sources.map(source => (
                        <SelectItem key={source} value={source}>{source}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="eventName">Evento</Label>
                  <Select value={filters.eventName} onValueChange={(value) => handleFilterChange('eventName', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os eventos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os eventos</SelectItem>
                      {eventNames.map(event => (
                        <SelectItem key={event} value={event}>{event}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-lg">Carregando dados de analytics...</div>
          </div>
        ) : (
          <>
            {/* KPIs Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals?.total_events?.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground">Todos os eventos rastreados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals?.total_pageviews?.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground">Visualizações de página</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals?.total_clicks?.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground">Clicks registrados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversões</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals?.total_conversions?.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground">Taxa: {conversionRate}%</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Únicos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totals?.unique_users?.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground">Usuários únicos</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="trends" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="trends">Tendências</TabsTrigger>
                <TabsTrigger value="demographics">Demografia</TabsTrigger>
                <TabsTrigger value="sources">Fontes</TabsTrigger>
              </TabsList>

              <TabsContent value="trends" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tendências Diárias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={chartData.dailyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Page Views" stroke="#8884d8" strokeWidth={2} />
                        <Line type="monotone" dataKey="Clicks" stroke="#82ca9d" strokeWidth={2} />
                        <Line type="monotone" dataKey="Conversões" stroke="#ffc658" strokeWidth={2} />
                        <Line type="monotone" dataKey="Usuários" stroke="#ff7300" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Área de Conversões</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData.dailyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="Conversões" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="demographics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Cidades</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chartData.cityData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.cityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Distribuição por Cidade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.cityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="sources" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Fontes de Tráfego</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chartData.sourceData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.sourceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Performance por Fonte</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {chartData.sourceData.map((source, index) => (
                          <div key={source.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: source.fill }}
                              />
                              <span className="font-medium">{source.name}</span>
                            </div>
                            <Badge variant="outline">
                              {source.value.toLocaleString()} eventos
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Data Table Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Detalhados ({analyticsData.length} registros)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Data</th>
                        <th className="text-left p-2">Evento</th>
                        <th className="text-left p-2">Cidade</th>
                        <th className="text-left p-2">Fonte</th>
                        <th className="text-right p-2">Eventos</th>
                        <th className="text-right p-2">Usuários</th>
                        <th className="text-right p-2">Sessões</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.slice(0, 10).map((row, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{new Date(row.date).toLocaleDateString('pt-BR')}</td>
                          <td className="p-2">
                            <Badge variant="outline">{row.event_name}</Badge>
                          </td>
                          <td className="p-2">{row.city || 'N/A'}</td>
                          <td className="p-2">{row.source || 'N/A'}</td>
                          <td className="text-right p-2">{row.event_count.toLocaleString()}</td>
                          <td className="text-right p-2">{row.unique_users.toLocaleString()}</td>
                          <td className="text-right p-2">{row.unique_sessions.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {analyticsData.length > 10 && (
                    <div className="mt-4 text-center text-muted-foreground">
                      Mostrando 10 de {analyticsData.length} registros. Use o export CSV para ver todos os dados.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminAnalyticsReports;