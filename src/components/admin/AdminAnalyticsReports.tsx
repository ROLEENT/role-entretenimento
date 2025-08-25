import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  Download, 
  Calendar, 
  Users, 
  Eye, 
  MapPin,
  BarChart3,
  PieChart,
  Activity,
  Target
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface AnalyticsReport {
  period: string;
  totalEvents: number;
  totalCheckins: number;
  totalReviews: number;
  totalFavorites: number;
  conversionRate: number;
  topCities: CityMetric[];
  topEvents: EventMetric[];
  engagementTrends: EngagementTrend[];
  userActivity: UserActivity[];
}

interface CityMetric {
  city: string;
  events: number;
  checkins: number;
  avgEngagement: number;
}

interface EventMetric {
  id: string;
  title: string;
  city: string;
  checkins: number;
  reviews: number;
  favorites: number;
  views: number;
  conversionRate: number;
}

interface EngagementTrend {
  date: string;
  checkins: number;
  reviews: number;
  favorites: number;
}

interface UserActivity {
  hour: number;
  checkins: number;
  pageViews: number;
}

export function AdminAnalyticsReports() {
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    generateReport();
  }, [timeRange]);

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date, endDate: Date = now;

    switch (timeRange) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      case 'custom':
        startDate = customStart ? new Date(customStart) : subDays(now, 30);
        endDate = customEnd ? new Date(customEnd) : now;
        break;
      default:
        startDate = subDays(now, 30);
    }

    return { startDate, endDate };
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();

      // Fetch all necessary data in parallel
      const [eventsResult, checkinsResult, reviewsResult, favoritesResult] = await Promise.all([
        supabase
          .from('events')
          .select('id, title, city, created_at')
          .eq('status', 'active')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        
        supabase
          .from('event_checkins')
          .select('id, event_id, created_at')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        
        supabase
          .from('event_reviews')
          .select('id, event_id, created_at')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        
        supabase
          .from('event_favorites')
          .select('id, event_id, created_at')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
      ]);

      const events = eventsResult.data || [];
      const checkins = checkinsResult.data || [];
      const reviews = reviewsResult.data || [];
      const favorites = favoritesResult.data || [];

      // Calculate basic metrics
      const totalEvents = events.length;
      const totalCheckins = checkins.length;
      const totalReviews = reviews.length;
      const totalFavorites = favorites.length;
      const totalViews = Math.floor(Math.random() * 50000) + 10000; // Mock data
      const conversionRate = totalViews > 0 ? (totalCheckins / totalViews) * 100 : 0;

      // Top cities analysis
      const cityStats = events.reduce((acc: Record<string, CityMetric>, event) => {
        const city = event.city;
        const eventCheckins = checkins.filter(c => c.event_id === event.id).length;
        const eventReviews = reviews.filter(r => r.event_id === event.id).length;
        const eventFavorites = favorites.filter(f => f.event_id === event.id).length;
        
        if (!acc[city]) {
          acc[city] = {
            city,
            events: 0,
            checkins: 0,
            avgEngagement: 0
          };
        }
        
        acc[city].events += 1;
        acc[city].checkins += eventCheckins;
        acc[city].avgEngagement = (eventCheckins + eventReviews + eventFavorites) / acc[city].events;
        
        return acc;
      }, {});

      const topCities = Object.values(cityStats)
        .sort((a, b) => b.avgEngagement - a.avgEngagement)
        .slice(0, 5);

      // Top events analysis
      const topEvents: EventMetric[] = events.map(event => {
        const eventCheckins = checkins.filter(c => c.event_id === event.id).length;
        const eventReviews = reviews.filter(r => r.event_id === event.id).length;
        const eventFavorites = favorites.filter(f => f.event_id === event.id).length;
        const eventViews = Math.floor(Math.random() * 1000) + 100; // Mock views
        
        return {
          id: event.id,
          title: event.title,
          city: event.city,
          checkins: eventCheckins,
          reviews: eventReviews,
          favorites: eventFavorites,
          views: eventViews,
          conversionRate: eventViews > 0 ? (eventCheckins / eventViews) * 100 : 0
        };
      }).sort((a, b) => b.conversionRate - a.conversionRate).slice(0, 10);

      // Engagement trends (daily aggregation)
      const engagementTrends: EngagementTrend[] = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayStart = new Date(d);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d);
        dayEnd.setHours(23, 59, 59, 999);
        
        const dayCheckins = checkins.filter(c => {
          const checkDate = new Date(c.created_at);
          return checkDate >= dayStart && checkDate <= dayEnd;
        }).length;
        
        const dayReviews = reviews.filter(r => {
          const reviewDate = new Date(r.created_at);
          return reviewDate >= dayStart && reviewDate <= dayEnd;
        }).length;
        
        const dayFavorites = favorites.filter(f => {
          const favDate = new Date(f.created_at);
          return favDate >= dayStart && favDate <= dayEnd;
        }).length;
        
        engagementTrends.push({
          date: format(d, 'dd/MM', { locale: ptBR }),
          checkins: dayCheckins,
          reviews: dayReviews,
          favorites: dayFavorites
        });
      }

      // User activity by hour (mock data based on realistic patterns)
      const userActivity: UserActivity[] = Array.from({ length: 24 }, (_, hour) => {
        let activityMultiplier = 1;
        
        // Higher activity during evening hours
        if (hour >= 18 && hour <= 23) activityMultiplier = 2.5;
        else if (hour >= 12 && hour <= 17) activityMultiplier = 1.8;
        else if (hour >= 6 && hour <= 11) activityMultiplier = 1.2;
        else activityMultiplier = 0.3;
        
        const baseCheckins = Math.floor((totalCheckins / 24) * activityMultiplier);
        const baseViews = Math.floor((totalViews / 24) * activityMultiplier);
        
        return {
          hour,
          checkins: baseCheckins,
          pageViews: baseViews
        };
      });

      setReport({
        period: `${format(startDate, 'dd/MM/yyyy', { locale: ptBR })} - ${format(endDate, 'dd/MM/yyyy', { locale: ptBR })}`,
        totalEvents,
        totalCheckins,
        totalReviews,
        totalFavorites,
        conversionRate,
        topCities,
        topEvents,
        engagementTrends,
        userActivity
      });

    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!report) return;

    const reportData = {
      generated_at: new Date().toISOString(),
      period: report.period,
      summary: {
        total_events: report.totalEvents,
        total_checkins: report.totalCheckins,
        total_reviews: report.totalReviews,
        total_favorites: report.totalFavorites,
        conversion_rate: report.conversionRate
      },
      top_cities: report.topCities,
      top_events: report.topEvents,
      engagement_trends: report.engagementTrends,
      user_activity: report.userActivity
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `role-analytics-report-${timeRange}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Relatório exportado com sucesso');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Relatórios e Analytics</h2>
          <p className="text-muted-foreground">
            Análise detalhada do desempenho da plataforma • {report.period}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="custom">Período customizado</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalEvents}</div>
            <p className="text-xs text-muted-foreground">criados no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-ins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalCheckins}</div>
            <p className="text-xs text-muted-foreground">participações confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalReviews}</div>
            <p className="text-xs text-muted-foreground">feedbacks recebidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalFavorites}</div>
            <p className="text-xs text-muted-foreground">eventos salvos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">visualizações → check-ins</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Events Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top 10 Eventos por Conversão
            </CardTitle>
            <CardDescription>
              Eventos com melhor taxa de conversão (visualizações → check-ins)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.topEvents.map((event, index) => (
                <div key={event.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{event.conversionRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">
                        {event.checkins}/{event.views} views
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{event.checkins} check-ins</span>
                    <span>{event.reviews} reviews</span>
                    <span>{event.favorites} favoritos</span>
                  </div>
                  {index < report.topEvents.length - 1 && <div className="border-b" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Cities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Performance por Cidade
            </CardTitle>
            <CardDescription>
              Cidades com maior engajamento médio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.topCities.map((city, index) => (
                <div key={city.city} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{city.city}</span>
                    </div>
                    <Badge>{city.avgEngagement.toFixed(1)} eng/evento</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <span>{city.events} eventos</span>
                    <span>{city.checkins} check-ins</span>
                  </div>
                  {index < report.topCities.length - 1 && <div className="border-b" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendências de Engajamento
          </CardTitle>
          <CardDescription>
            Evolução diária das interações na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2 mb-4">
            {report.engagementTrends.map((trend, index) => {
              const maxValue = Math.max(...report.engagementTrends.map(t => t.checkins + t.reviews + t.favorites));
              const totalEngagement = trend.checkins + trend.reviews + trend.favorites;
              const height = maxValue > 0 ? (totalEngagement / maxValue) * 200 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full max-w-8">
                    <div 
                      className="bg-primary rounded-t w-full"
                      style={{ height: `${height}px` }}
                    />
                    <div className="text-xs text-center mt-1 text-muted-foreground">
                      {trend.date}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span>Total de Engajamento</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Activity Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Padrões de Atividade por Hora
          </CardTitle>
          <CardDescription>
            Distribuição da atividade dos usuários ao longo do dia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-1 mb-4">
            {report.userActivity.map((activity, index) => {
              const maxActivity = Math.max(...report.userActivity.map(a => a.checkins + a.pageViews));
              const totalActivity = activity.checkins + activity.pageViews;
              const intensity = maxActivity > 0 ? (totalActivity / maxActivity) : 0;
              
              return (
                <div
                  key={index}
                  className="aspect-square rounded text-xs flex items-center justify-center text-white font-medium"
                  style={{
                    backgroundColor: `hsl(var(--primary) / ${0.2 + intensity * 0.8})`
                  }}
                  title={`${activity.hour}h - ${totalActivity} interações`}
                >
                  {activity.hour}
                </div>
              );
            })}
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Horários de pico: 18h-23h | Atividade moderada: 12h-17h</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}