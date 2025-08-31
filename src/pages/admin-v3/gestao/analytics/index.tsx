import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, BarChart3, TrendingUp, Users, Eye, Calendar, MapPin, RefreshCw, Activity, Clock, Database } from "lucide-react";
import { useAdminSession } from "@/hooks/useAuth";
import { useAnalyticsAdmin, ComprehensiveAnalytics, RealtimeMetrics } from "@/hooks/useAnalyticsAdmin";
import { toast } from "sonner";
import { subDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<ComprehensiveAnalytics | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");
  const { adminEmail } = useAdminSession();
  const { getComprehensiveAnalytics, getRealtimeMetrics } = useAnalyticsAdmin();

  const fetchAnalytics = async () => {
    if (!adminEmail) return;
    
    setLoading(true);
    try {
      const startDate = subDays(new Date(), parseInt(dateRange));
      const endDate = new Date();

      // Fetch comprehensive analytics
      const analyticsData = await getComprehensiveAnalytics(
        adminEmail,
        format(startDate, 'yyyy-MM-dd HH:mm:ss'),
        format(endDate, 'yyyy-MM-dd HH:mm:ss')
      );

      // Fetch realtime metrics
      const realtimeData = await getRealtimeMetrics(adminEmail);

      setAnalytics(analyticsData);
      setRealtimeMetrics(realtimeData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Erro ao carregar analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [adminEmail, dateRange]);

  useEffect(() => {
    if (!adminEmail) return;
    
    // Auto-refresh realtime metrics every 30 seconds
    const interval = setInterval(async () => {
      const realtimeData = await getRealtimeMetrics(adminEmail);
      setRealtimeMetrics(realtimeData);
    }, 30000);

    return () => clearInterval(interval);
  }, [adminEmail, getRealtimeMetrics]);

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend 
  }: { 
    title: string; 
    value: number | string; 
    description: string; 
    icon: any; 
    trend?: number;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-col items-end">
            <Icon className="h-6 w-6 text-muted-foreground" />
            {trend && (
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">+{trend}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Relatórios</h1>
          <p className="text-muted-foreground">
            Métricas e insights do sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando analytics...</span>
        </div>
      ) : analytics ? (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="locations">Localização</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total de Eventos"
                value={analytics.events.total_events}
                description="Todos os eventos"
                icon={Calendar}
              />
              <StatCard
                title="Eventos Publicados"
                value={analytics.events.published_events}
                description="Ativos no site"
                icon={Eye}
              />
              <StatCard
                title="Posts do Blog"
                value={analytics.blog.total_posts}
                description="Artigos publicados"
                icon={Users}
              />
              <StatCard
                title="Visualizações"
                value={analytics.analytics.page_views.toLocaleString()}
                description="Total de views"
                icon={BarChart3}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Eventos</CardTitle>
                  <CardDescription>Distribuição por status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Publicados</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ 
                              width: `${(analytics.events.published_events / analytics.events.total_events) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{analytics.events.published_events}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rascunhos</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ 
                              width: `${(analytics.events.draft_events / analytics.events.total_events) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{analytics.events.draft_events}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Sistema</CardTitle>
                  <CardDescription>Contadores gerais</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Favoritos</span>
                      <Badge variant="secondary">{analytics.users.total_favorites}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Check-ins</span>
                      <Badge variant="secondary">{analytics.users.total_checkins}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Comentários</span>
                      <Badge variant="secondary">{analytics.users.total_comments}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Curtidas</span>
                      <Badge variant="secondary">{analytics.users.total_likes}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sessões únicas</span>
                      <Badge variant="secondary">{analytics.analytics.unique_sessions}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            {realtimeMetrics && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Usuários Ativos"
                  value={realtimeMetrics.active_users_last_hour}
                  description="Última hora"
                  icon={Activity}
                />
                <StatCard
                  title="Views/Hora"
                  value={realtimeMetrics.page_views_last_hour}
                  description="Última hora"
                  icon={Eye}
                />
                <StatCard
                  title="Tempo de Carregamento"
                  value={`${realtimeMetrics.avg_load_time_last_hour.toFixed(2)}s`}
                  description="Média da última hora"
                  icon={Clock}
                />
                <StatCard
                  title="Erros"
                  value={realtimeMetrics.errors_last_hour}
                  description="Última hora"
                  icon={BarChart3}
                />
              </div>
            )}
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Status do Sistema</CardTitle>
                  <CardDescription>Saúde geral da aplicação</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Uptime</span>
                      <Badge variant="secondary">{realtimeMetrics?.system_uptime}%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Base de Dados</span>
                      <Badge variant={realtimeMetrics?.database_health === 'healthy' ? 'default' : 'destructive'}>
                        {realtimeMetrics?.database_health}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Performance em Tempo Real</CardTitle>
                  <CardDescription>Métricas atualizadas automaticamente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Carregamento médio</span>
                      <span className="text-sm font-medium">
                        {realtimeMetrics?.avg_load_time_last_hour.toFixed(2)}s
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Taxa de erro</span>
                      <span className="text-sm font-medium">
                        {((realtimeMetrics?.errors_last_hour || 0) / Math.max(realtimeMetrics?.page_views_last_hour || 1, 1) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Eventos por Visualizações</CardTitle>
                <CardDescription>Os eventos mais populares</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.top_events && analytics.top_events.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.top_events.map((event, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono">
                            #{index + 1}
                          </Badge>
                          <span className="text-sm font-medium">{event.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{event.views}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum dado disponível</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cidades Mais Populares</CardTitle>
                <CardDescription>Distribuição de eventos por cidade</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.popular_cities && analytics.popular_cities.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.popular_cities.map((city, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{city.city}</span>
                        </div>
                        <Badge variant="secondary">{city.count} eventos</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum dado disponível</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {analytics && (
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Métricas de Performance</CardTitle>
                    <CardDescription>Dados coletados do sistema</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Tempo de carregamento médio</span>
                        <span className="text-sm font-medium">
                          {analytics.performance.avg_page_load.toFixed(2)}ms
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">TTFB médio</span>
                        <span className="text-sm font-medium">
                          {analytics.performance.avg_ttfb.toFixed(2)}ms
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total de sessões</span>
                        <span className="text-sm font-medium">
                          {analytics.performance.total_sessions}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Taxa de erro</span>
                        <span className="text-sm font-medium">
                          {analytics.performance.error_rate.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resumo de Atividade</CardTitle>
                    <CardDescription>Período selecionado</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Eventos no período</span>
                        <Badge variant="secondary">{analytics.events.events_in_period}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Posts no período</span>
                        <Badge variant="secondary">{analytics.blog.posts_in_period}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Views de eventos</span>
                        <Badge variant="secondary">{analytics.analytics.event_views}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Usuários únicos</span>
                        <Badge variant="secondary">{analytics.analytics.unique_users}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage;