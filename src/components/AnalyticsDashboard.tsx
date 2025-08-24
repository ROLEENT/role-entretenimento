import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  MapPin, 
  Eye, 
  Share2,
  Heart,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalEvents: number;
  totalViews: number;
  totalShares: number;
  totalFavorites: number;
  popularCities: Array<{ city: string; count: number }>;
  recentActivity: Array<{ action: string; count: number; date: string }>;
  topEvents: Array<{ title: string; views: number; city: string }>;
}

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch total events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, title, city')
        .eq('status', 'active');

      if (eventsError) throw eventsError;

      // Fetch blog posts for views
      const { data: posts, error: postsError } = await supabase
        .from('blog_posts')
        .select('views')
        .eq('status', 'published');

      if (postsError) throw postsError;

      // Fetch favorites count
      const { data: favorites, error: favoritesError } = await supabase
        .from('event_favorites')
        .select('id');

      if (favoritesError) throw favoritesError;

      // Calculate analytics
      const totalEvents = events?.length || 0;
      const totalViews = (posts?.reduce((sum, post) => sum + (post.views || 0), 0) || 0);
      const totalFavorites = favorites?.length || 0;

      // Calculate popular cities
      const cityCount = events?.reduce((acc, event) => {
        acc[event.city] = (acc[event.city] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const popularCities = Object.entries(cityCount)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Top events by title (mock views)
      const topEvents = events
        ?.slice(0, 5)
        .map((event, index) => ({
          title: event.title,
          views: Math.floor(Math.random() * 1000) + 100, // Mock views
          city: event.city
        })) || [];

      // Mock recent activity
      const recentActivity = [
        { action: 'Eventos visualizados', count: totalViews, date: 'Últimos 7 dias' },
        { action: 'Novos favoritos', count: totalFavorites, date: 'Últimos 7 dias' },
        { action: 'Compartilhamentos', count: Math.floor(totalViews * 0.1), date: 'Últimos 7 dias' }
      ];

      setAnalytics({
        totalEvents,
        totalViews,
        totalShares: Math.floor(totalViews * 0.1), // Mock shares
        totalFavorites,
        popularCities,
        recentActivity,
        topEvents
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;
    
    const data = {
      exported_at: new Date().toISOString(),
      time_range: timeRange,
      ...analytics
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `role-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
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
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex gap-2">
          <div className="flex rounded-md border">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="rounded-none first:rounded-l-md last:rounded-r-md"
              >
                {range === '7d' ? '7 dias' : range === '30d' ? '30 dias' : '90 dias'}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
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
            <div className="text-2xl font-bold">{analytics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">eventos ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              páginas visitadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compartilhamentos</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalShares}</div>
            <p className="text-xs text-muted-foreground">eventos compartilhados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalFavorites}</div>
            <p className="text-xs text-muted-foreground">eventos favoritados</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Popular Cities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Cidades Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.popularCities.map((city, index) => (
                <div key={city.city} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{city.city}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {city.count} evento{city.count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Eventos Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topEvents.map((event, index) => (
                <div key={event.title} className="space-y-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.city}</p>
                    </div>
                    <span className="text-sm font-medium">{event.views} views</span>
                  </div>
                  {index < analytics.topEvents.length - 1 && <div className="border-b" />}
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
            <Users className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{activity.count}</div>
                <div className="text-sm font-medium">{activity.action}</div>
                <div className="text-xs text-muted-foreground">{activity.date}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};