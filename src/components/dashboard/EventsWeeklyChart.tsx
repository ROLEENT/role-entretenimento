'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { getEventsWeekly, type WeeklyEventData } from '@/data/eventsWeekly';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { TrendingUp } from 'lucide-react';

export function EventsWeeklyChart() {
  const [data, setData] = useState<WeeklyEventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoggedError, setHasLoggedError] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const weeklyData = await getEventsWeekly(60);
        setData(weeklyData);
      } catch (error) {
        if (!hasLoggedError) {
          console.error('Failed to load weekly events data:', error);
          setHasLoggedError(true);
        }
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium">
            Semana de {formatDate(label)}
          </p>
          <p className="text-sm text-foreground/70">
            <span className="text-primary font-medium">{payload[0].value}</span> eventos
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card 
        role="status" 
        aria-live="polite" 
        aria-label="Carregando gráfico de eventos semanais"
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">Eventos por Semana</CardTitle>
            <p className="text-sm text-foreground/70">Últimos 60 dias</p>
          </div>
          <TrendingUp className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card role="region" aria-label="Gráfico de eventos por semana">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">Eventos por Semana</CardTitle>
          <p className="text-sm text-foreground/70">Últimos 60 dias</p>
        </div>
        <TrendingUp className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div 
            className="h-[300px] flex flex-col items-center justify-center text-center"
            role="status"
            aria-live="polite"
          >
            <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium text-foreground/80 mb-2">
              Nenhum evento encontrado
            </h3>
            <p className="text-sm text-foreground/70 max-w-md">
              Quando houver eventos nos últimos 60 dias, você verá o gráfico de tendência aqui.
            </p>
          </div>
        ) : (
          <div className="h-[300px] w-full" aria-label="Gráfico de área mostrando eventos por semana">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="week_start"
                  tickFormatter={formatDate}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.toString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEvents)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}