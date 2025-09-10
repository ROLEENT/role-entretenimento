import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Heart, Bell, ExternalLink, TrendingUp, Clock, MousePointer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AnalyticsMetrics {
  totalEvents: number;
  totalUsers: number;
  savedEvents: number;
  followedArtists: number;
  ticketClicks: number;
  activeAlerts: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

interface EventMetric {
  date: string;
  events: number;
  users: number;
  engagement: number;
}

interface PopularPage {
  path: string;
  views: number;
  avgTime: number;
  bounceRate: number;
}

interface RecentActivity {
  id: string;
  type: 'event_saved' | 'artist_followed' | 'ticket_clicked' | 'alert_activated';
  event_name?: string;
  artist_name?: string;
  user_id: string;
  timestamp: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalEvents: 0,
    totalUsers: 0,
    savedEvents: 0,
    followedArtists: 0,
    ticketClicks: 0,
    activeAlerts: 0,
    avgTimeOnPage: 0,
    bounceRate: 0,
  });
  
  const [weeklyData, setWeeklyData] = useState<EventMetric[]>([]);
  const [popularPages, setPopularPages] = useState<PopularPage[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load basic metrics
      const [eventsResult, usersResult, analyticsResult] = await Promise.all([
        supabase.from('agenda_entries').select('id').eq('status', 'published'),
        supabase.from('profiles').select('id'),
        supabase.from('user_analytics').select('*').order('timestamp', { ascending: false }).limit(1000)
      ]);

      if (analyticsResult.data) {
        const analytics = analyticsResult.data;
        
        // Calculate metrics from analytics data
        const savedEvents = analytics.filter(a => a.event_name === 'event_saved').length;
        const followedArtists = analytics.filter(a => a.event_name === 'artist_followed').length;
        const ticketClicks = analytics.filter(a => a.event_name === 'ticket_clicked').length;
        const alertsActivated = analytics.filter(a => a.event_name === 'alert_activated').length;
        
        // Calculate average time on page and bounce rate
        const pageViews = analytics.filter(a => a.event_name === 'pageview');
        const avgTime = pageViews.reduce((sum, view) => {
          return sum + (view.event_data?.timeOnPage || 0);
        }, 0) / (pageViews.length || 1);
        
        const bounces = pageViews.filter(view => (view.event_data?.timeOnPage || 0) < 10).length;
        const bounceRate = (bounces / (pageViews.length || 1)) * 100;

        setMetrics({
          totalEvents: eventsResult.data?.length || 0,
          totalUsers: usersResult.data?.length || 0,
          savedEvents,
          followedArtists,
          ticketClicks,
          activeAlerts: alertsActivated,
          avgTimeOnPage: Math.round(avgTime),
          bounceRate: Math.round(bounceRate),
        });

        // Generate weekly data
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        });

        const weeklyMetrics = last7Days.map(date => {
          const dayAnalytics = analytics.filter(a => 
            a.timestamp?.startsWith(date)
          );
          
          return {
            date: new Date(date).toLocaleDateString('pt-BR', { 
              month: 'short', 
              day: 'numeric' 
            }),
            events: dayAnalytics.filter(a => a.event_name === 'event_saved').length,
            users: new Set(dayAnalytics.map(a => a.session_id)).size,
            engagement: dayAnalytics.filter(a => 
              ['event_saved', 'artist_followed', 'ticket_clicked'].includes(a.event_name || '')
            ).length,
          };
        });
        
        setWeeklyData(weeklyMetrics);

        // Popular pages
        const pageViewsByPath: Record<string, { views: number; totalTime: number; bounces: number }> = {};
        
        pageViews.forEach(view => {
          const path = view.page_url || '/';
          if (!pageViewsByPath[path]) {
            pageViewsByPath[path] = { views: 0, totalTime: 0, bounces: 0 };
          }
          pageViewsByPath[path].views++;
          pageViewsByPath[path].totalTime += view.event_data?.timeOnPage || 0;
          if ((view.event_data?.timeOnPage || 0) < 10) {
            pageViewsByPath[path].bounces++;
          }
        });

        const popularPagesData = Object.entries(pageViewsByPath)
          .map(([path, data]) => ({
            path,
            views: data.views,
            avgTime: Math.round(data.totalTime / data.views),
            bounceRate: Math.round((data.bounces / data.views) * 100),
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);

        setPopularPages(popularPagesData);

        // Recent activity
        const activities = analytics
          .filter(a => ['event_saved', 'artist_followed', 'ticket_clicked', 'alert_activated'].includes(a.event_name || ''))
          .slice(0, 20)
          .map(a => ({
            id: a.id || '',
            type: a.event_name as 'event_saved' | 'artist_followed' | 'ticket_clicked' | 'alert_activated',
            event_name: a.event_data?.event_name,
            artist_name: a.event_data?.artist_name,
            user_id: a.session_id || '',
            timestamp: a.timestamp || '',
          }));

        setRecentActivity(activities);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'event_saved': return <Heart className="h-4 w-4" />;
      case 'artist_followed': return <Users className="h-4 w-4" />;
      case 'ticket_clicked': return <ExternalLink className="h-4 w-4" />;
      case 'alert_activated': return <Bell className="h-4 w-4" />;
      default: return <MousePointer className="h-4 w-4" />;
    }
  };

  const getActivityDescription = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'event_saved':
        return `Evento salvo: ${activity.event_name || 'N/A'}`;
      case 'artist_followed':
        return `Artista seguido: ${activity.artist_name || 'N/A'}`;
      case 'ticket_clicked':
        return `Clique em ingresso: ${activity.event_name || 'N/A'}`;
      case 'alert_activated':
        return `Alerta ativado: ${activity.artist_name || 'N/A'}`;
      default:
        return 'Atividade desconhecida';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Button onClick={loadAnalyticsData} variant="outline">
          Atualizar Dados
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">eventos publicados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">usuários cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Salvos</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.savedEvents}</div>
            <p className="text-xs text-muted-foreground">total de salvamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliques em Ingressos</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.ticketClicks}</div>
            <p className="text-xs text-muted-foreground">conversões para ingressos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Atividade Recente</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Atividade Semanal</CardTitle>
                <CardDescription>Eventos salvos e engajamento dos últimos 7 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="events" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Eventos Salvos"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="engagement" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      name="Engajamento Total"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Engajamento</CardTitle>
                <CardDescription>Distribuição das ações dos usuários</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-primary" />
                      <span className="text-sm">Eventos Salvos</span>
                    </div>
                    <Badge variant="secondary">{metrics.savedEvents}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm">Artistas Seguidos</span>
                    </div>
                    <Badge variant="secondary">{metrics.followedArtists}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <span className="text-sm">Alertas Ativados</span>
                    </div>
                    <Badge variant="secondary">{metrics.activeAlerts}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4 text-primary" />
                      <span className="text-sm">Cliques em Ingressos</span>
                    </div>
                    <Badge variant="secondary">{metrics.ticketClicks}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Páginas Mais Acessadas</CardTitle>
                <CardDescription>Top 10 páginas por número de visualizações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {popularPages.map((page, index) => (
                    <div key={page.path} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div>
                        <span className="text-sm font-medium">{page.path}</span>
                        <div className="text-xs text-muted-foreground">
                          Tempo médio: {page.avgTime}s | Taxa de rejeição: {page.bounceRate}%
                        </div>
                      </div>
                      <Badge variant="outline">{page.views} views</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
                <CardDescription>Indicadores de experiência do usuário</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Tempo Médio na Página</span>
                      <span className="text-lg font-bold">{metrics.avgTimeOnPage}s</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${Math.min((metrics.avgTimeOnPage / 120) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Taxa de Rejeição</span>
                      <span className="text-lg font-bold">{metrics.bounceRate}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-destructive h-2 rounded-full" 
                        style={{ width: `${metrics.bounceRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Últimas 20 ações dos usuários no site</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium">{getActivityDescription(activity)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.user_id.slice(0, 8)}...
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}