import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Eye, 
  Heart,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface DashboardMetrics {
  totalEvents: number;
  activeEvents: number;
  pendingReviews: number;
  totalCheckins: number;
  totalViews: number;
  recentActivity: ActivityItem[];
  topEvents: EventMetric[];
  cityStats: CityMetric[];
}

interface ActivityItem {
  id: string;
  type: 'check_in' | 'review' | 'favorite' | 'comment';
  description: string;
  timestamp: string;
  user?: string;
}

interface EventMetric {
  id: string;
  title: string;
  checkins: number;
  views: number;
  city: string;
}

interface CityMetric {
  city: string;
  events: number;
  checkins: number;
}

export function AdminDashboard() {
  const { adminUser } = useAdminAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchDashboardMetrics();
  }, [timeFilter]);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on filter
      const now = new Date();
      let startDate: Date;
      
      switch (timeFilter) {
        case 'today':
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          break;
      }

      // Fetch parallel data
      const [eventsResult, checkinsResult, reviewsResult, favoritesResult] = await Promise.all([
        supabase.from('events').select('id, title, city, created_at').eq('status', 'active'),
        supabase.from('event_checkins').select('id, event_id, created_at').gte('created_at', startDate.toISOString()),
        supabase.from('event_reviews').select('id, event_id, created_at').gte('created_at', startDate.toISOString()),
        supabase.from('event_favorites').select('id, event_id, created_at').gte('created_at', startDate.toISOString())
      ]);

      const events = eventsResult.data || [];
      const checkins = checkinsResult.data || [];
      const reviews = reviewsResult.data || [];
      const favorites = favoritesResult.data || [];

      // Calculate metrics
      const totalEvents = events.length;
      const activeEvents = events.filter(e => new Date(e.created_at) >= startDate).length;
      const totalCheckins = checkins.length;
      const totalViews = Math.floor(Math.random() * 10000) + 1000; // Mock views

      // City statistics
      const cityStats: CityMetric[] = events.reduce((acc: CityMetric[], event) => {
        const existing = acc.find(stat => stat.city === event.city);
        const eventCheckins = checkins.filter(c => c.event_id === event.id).length;
        
        if (existing) {
          existing.events += 1;
          existing.checkins += eventCheckins;
        } else {
          acc.push({
            city: event.city,
            events: 1,
            checkins: eventCheckins
          });
        }
        return acc;
      }, []).sort((a, b) => b.events - a.events).slice(0, 5);

      // Top events by engagement
      const topEvents: EventMetric[] = events.map(event => ({
        id: event.id,
        title: event.title,
        city: event.city,
        checkins: checkins.filter(c => c.event_id === event.id).length,
        views: Math.floor(Math.random() * 500) + 50
      })).sort((a, b) => (b.checkins + b.views) - (a.checkins + a.views)).slice(0, 5);

      // Recent activity
      const recentActivity: ActivityItem[] = [
        ...checkins.slice(-10).map(c => ({
          id: c.id,
          type: 'check_in' as const,
          description: 'Novo check-in realizado',
          timestamp: c.created_at
        })),
        ...reviews.slice(-10).map(r => ({
          id: r.id,
          type: 'review' as const,
          description: 'Nova avaliação recebida',
          timestamp: r.created_at
        })),
        ...favorites.slice(-10).map(f => ({
          id: f.id,
          type: 'favorite' as const,
          description: 'Evento favoritado',
          timestamp: f.created_at
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

      setMetrics({
        totalEvents,
        activeEvents,
        pendingReviews: Math.floor(Math.random() * 5),
        totalCheckins,
        totalViews,
        recentActivity,
        topEvents,
        cityStats
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      toast.error('Erro ao carregar métricas do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'check_in': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'review': return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'favorite': return <Heart className="h-4 w-4 text-pink-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
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

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard Administrativo</h2>
          <p className="text-muted-foreground">
            Bem-vindo, {adminUser?.full_name || adminUser?.email}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {timeFilter === 'today' ? 'Hoje' : timeFilter === 'week' ? 'Última semana' : 'Último mês'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setTimeFilter('today')}>
                Hoje
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeFilter('week')}>
                Última semana
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeFilter('month')}>
                Último mês
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              {metrics.activeEvents} novos no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-ins</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCheckins}</div>
            <p className="text-xs text-muted-foreground">participações confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">páginas visitadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliações Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.pendingReviews > 0 ? 'necessita moderação' : 'tudo em dia'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and detailed data */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Eventos em Destaque
            </CardTitle>
            <CardDescription>Eventos com maior engajamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topEvents.map((event, index) => (
                <div key={event.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{event.checkins} check-ins</p>
                    <p className="text-xs text-muted-foreground">{event.views} views</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* City Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Estatísticas por Cidade
            </CardTitle>
            <CardDescription>Distribuição de eventos e participação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.cityStats.map((city, index) => (
                <div key={city.city} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{city.city}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{city.events} eventos</p>
                    <p className="text-xs text-muted-foreground">{city.checkins} check-ins</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
          <CardDescription>Últimas interações na plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-2 rounded border">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                    <DropdownMenuItem>Investigar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}