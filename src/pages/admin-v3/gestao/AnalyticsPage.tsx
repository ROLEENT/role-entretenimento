import React, { useState, useEffect } from 'react';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Users, Eye, Activity, Download, Calendar, RefreshCw } from 'lucide-react';
import { useAnalyticsAdmin } from '@/hooks/useAnalyticsAdmin';
import { toast } from 'sonner';

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  eventViews: number;
  blogViews: number;
  topEvents: Array<{ title: string; views: number }>;
  topPosts: Array<{ title: string; views: number }>;
  userSignups: number;
  highlightLikes: number;
}

const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [basicStats, setBasicStats] = useState<any>(null);
  const [topContent, setTopContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { getAnalyticsData, getBasicStats, getTopContent } = useAnalyticsAdmin();

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Gestão', path: '/admin-v3/gestao' },
    { label: 'Analytics & Relatórios' },
  ];

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - parseInt(dateRange.replace('d', '')) * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      const [analytics, stats, content] = await Promise.all([
        getAnalyticsData(startDate, endDate),
        getBasicStats(),
        getTopContent()
      ]);

      // Map the analytics data to our local format
      if (analytics) {
        const mappedData: AnalyticsData[] = analytics.map(item => ({
          pageViews: item.page_views || 0,
          uniqueVisitors: item.unique_visitors || 0,
          eventViews: item.event_views || 0,
          blogViews: item.blog_views || 0,
          topEvents: item.top_events || [],
          topPosts: item.top_posts || [],
          userSignups: item.user_signups || 0,
          highlightLikes: item.highlights_likes || 0
        }));
        setAnalyticsData(mappedData);
      }
      if (stats) setBasicStats(stats);
      if (content) setTopContent(content);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      toast.error('Erro ao carregar dados de analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const exportData = () => {
    const data = {
      analytics: analyticsData,
      basicStats,
      topContent,
      exportedAt: new Date().toISOString(),
      dateRange
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Dados exportados com sucesso');
  };

  const totalPageViews = analyticsData.reduce((sum, day) => sum + day.pageViews, 0);
  const totalUniqueVisitors = analyticsData.reduce((sum, day) => sum + day.uniqueVisitors, 0);
  const totalEventViews = analyticsData.reduce((sum, day) => sum + day.eventViews, 0);
  const totalBlogViews = analyticsData.reduce((sum, day) => sum + day.blogViews, 0);

  return (
    <AdminPageWrapper
      title="Analytics & Relatórios"
      description="Análise detalhada de métricas, visualizações e performance"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Último dia</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadAnalytics} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Dados
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Métricas Principais */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalPageViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{Math.round((totalPageViews / analyticsData.length) * 100) / 100}% vs média diária
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visitantes Únicos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUniqueVisitors.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Taxa de conversão: {totalPageViews > 0 ? Math.round((totalUniqueVisitors / totalPageViews) * 100) : 0}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Eventos Visualizados</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalEventViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalPageViews > 0 ? Math.round((totalEventViews / totalPageViews) * 100) : 0}% do total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blog Views</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBlogViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalPageViews > 0 ? Math.round((totalBlogViews / totalPageViews) * 100) : 0}% do total
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Estatísticas do Sistema */}
            {basicStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{basicStats.events}</div>
                      <p className="text-sm text-muted-foreground">Eventos</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{basicStats.venues}</div>
                      <p className="text-sm text-muted-foreground">Locais</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{basicStats.organizers}</div>
                      <p className="text-sm text-muted-foreground">Organizadores</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{basicStats.posts}</div>
                      <p className="text-sm text-muted-foreground">Posts</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{basicStats.highlights}</div>
                      <p className="text-sm text-muted-foreground">Destaques</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{basicStats.comments}</div>
                      <p className="text-sm text-muted-foreground">Comentários</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            {topContent && (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Top Eventos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Eventos Mais Visualizados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topContent.events?.map((event: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{event.title}</p>
                          </div>
                          <Badge variant="secondary">{event.views} views</Badge>
                        </div>
                      ))}
                      {(!topContent.events || topContent.events.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhum evento encontrado
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Posts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Posts Mais Visualizados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topContent.posts?.map((post: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{post.title}</p>
                          </div>
                          <Badge variant="secondary">{post.views} views</Badge>
                        </div>
                      ))}
                      {(!topContent.posts || topContent.posts.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhum post encontrado
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            {topContent?.highlights && (
              <Card>
                <CardHeader>
                  <CardTitle>Destaques Mais Curtidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topContent.highlights.map((highlight: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{highlight.event_title}</p>
                        </div>
                        <Badge variant="secondary">{highlight.like_count} likes</Badge>
                      </div>
                    ))}
                    {topContent.highlights.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum destaque encontrado
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 animate-spin" />
              <span>Carregando dados...</span>
            </div>
          </div>
        )}
      </div>
    </AdminPageWrapper>
  );
};

export default AnalyticsPage;