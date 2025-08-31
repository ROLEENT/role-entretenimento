import { KpiCard } from '@/components/ui/KpiCard';
import { Calendar, FileText, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getKpis, type DashboardKpis } from '@/data/dashboard';

export function KpiRow() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadKpis = async () => {
      try {
        setLoading(true);
        const data = await getKpis();
        setKpis(data);
      } catch (error) {
        console.error('Failed to load KPIs:', error);
        // Set fallback values on error
        setKpis({
          publishedEvents: 0,
          scheduledEvents: 0,
          draftEvents: 0,
          agentsTotal: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadKpis();
  }, []);

  return (
    <div className="dashboard-grid-responsive">
      <KpiCard
        title="Eventos Ativos"
        value={kpis?.publishedEvents ?? 0}
        hint="publicados este mês"
        icon={<Calendar className="h-4 w-4" />}
        isLoading={loading}
      />
      
      <KpiCard
        title="Rascunhos"
        value={kpis?.draftEvents ?? 0}
        hint="aguardando publicação"
        icon={<FileText className="h-4 w-4" />}
        isLoading={loading}
      />
      
      <KpiCard
        title="Agendados"
        value={kpis?.scheduledEvents ?? 0}
        hint="eventos futuros"
        icon={<TrendingUp className="h-4 w-4" />}
        isLoading={loading}
      />
      
      <KpiCard
        title="Agentes"
        value={kpis?.agentsTotal ?? 0}
        hint="ativos na plataforma"
        icon={<Users className="h-4 w-4" />}
        isLoading={loading}
      />
    </div>
  );
}