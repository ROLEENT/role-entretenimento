import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotificationAnalytics } from '@/hooks/useNotificationAnalytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { 
  TrendingUp, 
  Send, 
  Eye, 
  MousePointer, 
  AlertTriangle,
  Clock,
  Target,
  Calendar,
  Filter,
  Download
} from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const NotificationAnalyticsDashboard = () => {
  const {
    metrics,
    hourlyPerformance,
    campaigns,
    loading,
    error,
    fetchMetrics,
    getTopPerformingTypes,
    getTopPerformingCities,
    getTotalMetrics,
    getBestSendingHours
  } = useNotificationAnalytics();

  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    notificationType: '',
    city: ''
  });

  const totalMetrics = getTotalMetrics();
  const topTypes = getTopPerformingTypes();
  const topCities = getTopPerformingCities();
  const bestHours = getBestSendingHours();

  const deliveryRate = totalMetrics.total_sent > 0 
    ? ((totalMetrics.total_delivered / totalMetrics.total_sent) * 100).toFixed(1)
    : '0';

  const openRate = totalMetrics.total_delivered > 0 
    ? ((totalMetrics.total_opened / totalMetrics.total_delivered) * 100).toFixed(1)
    : '0';

  const clickRate = totalMetrics.total_opened > 0 
    ? ((totalMetrics.total_clicked / totalMetrics.total_opened) * 100).toFixed(1)
    : '0';

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchMetrics(newFilters);
  };

  const exportData = () => {
    const csvData = metrics.map(metric => ({
      Date: metric.date,
      Type: metric.notification_type,
      City: metric.city || 'All',
      Sent: metric.total_sent,
      Delivered: metric.total_delivered,
      Opened: metric.total_opened,
      Clicked: metric.total_clicked,
      Failed: metric.total_failed,
      'Delivery Rate (%)': metric.delivery_rate,
      'Open Rate (%)': metric.open_rate,
      'Click Rate (%)': metric.click_rate
    }));

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notification-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Data Início</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Data Fim</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo</label>
              <Select value={filters.notificationType} onValueChange={(value) => handleFilterChange('notificationType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="new_events">Novos Eventos</SelectItem>
                  <SelectItem value="event_reminders">Lembretes</SelectItem>
                  <SelectItem value="weekly_highlights">Destaques</SelectItem>
                  <SelectItem value="comment_replies">Comentários</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Cidade</label>
              <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as cidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as cidades</SelectItem>
                  <SelectItem value="São Paulo">São Paulo</SelectItem>
                  <SelectItem value="Rio de Janeiro">Rio de Janeiro</SelectItem>
                  <SelectItem value="Curitiba">Curitiba</SelectItem>
                  <SelectItem value="Porto Alegre">Porto Alegre</SelectItem>
                  <SelectItem value="Florianópolis">Florianópolis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Enviadas</p>
                <p className="text-2xl font-bold">{totalMetrics.total_sent.toLocaleString()}</p>
              </div>
              <Send className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Entrega</p>
                <p className="text-2xl font-bold">{deliveryRate}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Abertura</p>
                <p className="text-2xl font-bold">{openRate}%</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Clique</p>
                <p className="text-2xl font-bold">{clickRate}%</p>
              </div>
              <MousePointer className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de Tendência */}
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Notificações</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="total_sent" 
                      stroke="hsl(var(--primary))" 
                      name="Enviadas"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total_opened" 
                      stroke="hsl(var(--secondary))" 
                      name="Abertas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance por Horário */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Horário</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour_of_day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="open_rate" fill="hsl(var(--primary))" name="Taxa de Abertura %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Tipos */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topTypes.map((type, index) => (
                    <div key={type.type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{type.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {type.total_sent} enviadas • {type.total_opened} abertas
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          {type.open_rate.toFixed(1)}% abertura
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {type.click_rate.toFixed(1)}% clique
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Cidades */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Cidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCities.slice(0, 5).map((city) => (
                    <div key={city.city} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{city.city}</p>
                        <p className="text-sm text-muted-foreground">
                          {city.total_sent} enviadas • {city.total_opened} abertas
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          {city.open_rate.toFixed(1)}% abertura
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {city.click_rate.toFixed(1)}% clique
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{campaign.name}</h4>
                      <p className="text-sm text-muted-foreground">{campaign.title}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </span>
                        <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {campaign.total_sent}/{campaign.total_recipients} enviadas
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {campaign.total_opened} abertas • {campaign.total_clicked} cliques
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Melhores Horários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Melhores Horários para Envio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bestHours.map((hour, index) => (
                    <div key={hour.hour_of_day} className="flex items-center justify-between">
                      <span className="font-medium">{hour.hour_of_day}:00</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {hour.open_rate.toFixed(1)}% abertura
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ({hour.total_sent} enviadas)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recomendações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deliveryRate < '90' && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">
                        Taxa de entrega baixa ({deliveryRate}%)
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Considere revisar a lista de assinantes e remover endereços inválidos.
                      </p>
                    </div>
                  )}
                  
                  {openRate < '20' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-800">
                        Taxa de abertura baixa ({openRate}%)
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        Teste títulos mais chamativos e horários de envio otimizados.
                      </p>
                    </div>
                  )}
                  
                  {bestHours.length > 0 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        Melhor horário: {bestHours[0].hour_of_day}:00
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        {bestHours[0].open_rate.toFixed(1)}% de taxa de abertura neste horário.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};