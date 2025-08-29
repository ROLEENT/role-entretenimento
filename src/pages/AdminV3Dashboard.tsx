import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Calendar, FileText, RotateCcw, Plus, RefreshCw, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  drafts: number;
  published: number;
  today: number;
  thisWeek: number;
}

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats>({
    drafts: 0,
    published: 0,
    today: 0,
    thisWeek: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadStats = async () => {
    setLoading(true);
    setError('');

    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      // Get drafts count
      const { count: draftsCount } = await supabase
        .from('agenda_itens')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft')
        .is('deleted_at', null);

      // Get published count
      const { count: publishedCount } = await supabase
        .from('agenda_itens')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .is('deleted_at', null);

      // Get today's events
      const { count: todayCount } = await supabase
        .from('agenda_itens')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .is('deleted_at', null)
        .gte('start_at', today.toISOString())
        .lt('start_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());

      // Get next 7 days events
      const { count: nextWeekCount } = await supabase
        .from('agenda_itens')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .is('deleted_at', null)
        .gte('start_at', today.toISOString())
        .lt('start_at', nextWeek.toISOString());

      setStats({
        drafts: draftsCount || 0,
        published: publishedCount || 0,
        today: todayCount || 0,
        thisWeek: nextWeekCount || 0
      });

    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    isLoading 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    isLoading: boolean; 
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : error ? (
          <div className="text-destructive text-sm">Erro</div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadStats}
          disabled={isLoading}
          className="w-full"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Recarregar
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin v3 Dashboard</h1>
          <Button onClick={() => navigate('/admin-highlights/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Agenda
          </Button>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive text-center">{error}</p>
              <Button 
                variant="outline" 
                onClick={loadStats} 
                className="w-full mt-4"
              >
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Rascunhos"
            value={stats.drafts}
            icon={FileText}
            isLoading={loading}
          />
          
          <StatCard
            title="Publicados"
            value={stats.published}
            icon={FileText}
            isLoading={loading}
          />
          
          <StatCard
            title="Hoje"
            value={stats.today}
            icon={Calendar}
            isLoading={loading}
          />
          
          <StatCard
            title="Próximos 7 dias"
            value={stats.thisWeek}
            icon={Calendar}
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminV3Dashboard() {
  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        <div className="pt-16 p-6">
          <div className="max-w-7xl mx-auto">
            <DashboardContent />
          </div>
        </div>
      </div>
    </AdminV3Guard>
  );
}