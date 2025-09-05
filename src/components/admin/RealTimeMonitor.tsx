import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNotificationAnalytics } from "@/hooks/useNotificationAnalytics";
import { Activity, Users, Eye, TrendingUp, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function RealTimeMonitor() {
  const {
    metrics,
    hourlyPerformance,
    getTotalMetrics,
    getBestSendingHours,
    loading
  } = useNotificationAnalytics();

  const [liveMetrics, setLiveMetrics] = useState({
    activeUsers: 0,
    pageViews: 0,
    serverLoad: 0,
    errorRate: 0
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 10 - 5)),
        pageViews: prev.pageViews + Math.floor(Math.random() * 5),
        serverLoad: Math.max(0, Math.min(100, prev.serverLoad + Math.random() * 20 - 10)),
        errorRate: Math.max(0, Math.min(5, prev.errorRate + Math.random() * 2 - 1))
      }));
    }, 3000);

    // Initialize with some base values
    setLiveMetrics({
      activeUsers: 45 + Math.floor(Math.random() * 20),
      pageViews: 1250 + Math.floor(Math.random() * 100),
      serverLoad: 25 + Math.random() * 30,
      errorRate: Math.random() * 2
    });

    return () => clearInterval(interval);
  }, []);

  const totalMetrics = getTotalMetrics();
  const bestHours = getBestSendingHours();

  const getLoadStatus = (load: number) => {
    if (load < 50) return { color: "text-green-600", status: "Normal" };
    if (load < 80) return { color: "text-yellow-600", status: "Médio" };
    return { color: "text-red-600", status: "Alto" };
  };

  const getErrorStatus = (rate: number) => {
    if (rate < 1) return { color: "text-green-600", status: "Normal" };
    if (rate < 3) return { color: "text-yellow-600", status: "Atenção" };
    return { color: "text-red-600", status: "Crítico" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Monitor em Tempo Real</h2>
          <p className="text-muted-foreground">Acompanhamento contínuo da aplicação</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">Ao vivo</span>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Online</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{liveMetrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">ativos agora</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{liveMetrics.pageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carga do Servidor</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getLoadStatus(liveMetrics.serverLoad).color}`}>
              {liveMetrics.serverLoad.toFixed(1)}%
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={liveMetrics.serverLoad} className="flex-1 h-2" />
              <Badge variant="outline" className="text-xs">
                {getLoadStatus(liveMetrics.serverLoad).status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getErrorStatus(liveMetrics.errorRate).color}`}>
              {liveMetrics.errorRate.toFixed(2)}%
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {getErrorStatus(liveMetrics.errorRate).status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Horária</CardTitle>
          <CardDescription>Métricas das últimas 24 horas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={(hour) => `${hour}h`}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(hour) => `${hour}:00`}
                formatter={(value, name) => [
                  typeof value === 'number' ? value.toFixed(2) : value,
                  name === 'sent' ? 'Enviadas' : 
                  name === 'delivered' ? 'Entregues' :
                  name === 'opened' ? 'Abertas' : name
                ]}
              />
              <Line type="monotone" dataKey="sent" stroke="hsl(var(--primary))" strokeWidth={2} name="sent" />
              <Line type="monotone" dataKey="delivered" stroke="hsl(var(--secondary))" strokeWidth={2} name="delivered" />
              <Line type="monotone" dataKey="opened" stroke="hsl(var(--accent))" strokeWidth={2} name="opened" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Resumo de Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Enviadas</span>
                <span className="text-lg font-bold text-blue-600">
                  {totalMetrics.total_sent?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Entregues</span>
                <span className="text-lg font-bold text-green-600">
                  {totalMetrics.total_delivered?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Abertas</span>
                <span className="text-lg font-bold text-orange-600">
                  {totalMetrics.total_opened?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Cliques</span>
                <span className="text-lg font-bold text-purple-600">
                  {totalMetrics.total_clicked?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Melhores Horários</CardTitle>
            <CardDescription>Top 5 horários para envio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bestHours.map((hourData, index) => (
                <div key={hourData.hour_of_day} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-8 h-6 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="text-sm font-medium">{hourData.hour_of_day}:00</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-primary">
                      {hourData.open_rate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">abertura</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}