import { KpiCard } from '@/components/ui/KpiCard';
import { Calendar, FileText, TrendingUp, Users } from 'lucide-react';
import { useAdminDashboardStats } from '@/hooks/useAdminDashboardStats';

export function KpiRow() {
  const { stats, loading } = useAdminDashboardStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Indicadores principais">
      <KpiCard
        title="Eventos Publicados"
        value={stats?.events.published ?? 0}
        hint="eventos ativos"
        icon={<Calendar className="h-4 w-4" />}
        isLoading={loading}
        aria-label={`${stats?.events.published ?? 0} eventos publicados`}
      />
      
      <KpiCard
        title="Rascunhos"
        value={stats?.events.draft ?? 0}
        hint="aguardando publicação"
        icon={<FileText className="h-4 w-4" />}
        isLoading={loading}
        aria-label={`${stats?.events.draft ?? 0} rascunhos`}
      />
      
      <KpiCard
        title="Próximos Eventos"
        value={stats?.events.upcoming ?? 0}
        hint="eventos futuros"
        icon={<TrendingUp className="h-4 w-4" />}
        isLoading={loading}
        aria-label={`${stats?.events.upcoming ?? 0} eventos agendados`}
      />
      
      <KpiCard
        title="Artistas"
        value={stats?.artists.active ?? 0}
        hint="ativos na plataforma"
        icon={<Users className="h-4 w-4" />}
        isLoading={loading}
        aria-label={`${stats?.artists.active ?? 0} artistas ativos`}
      />
    </div>
  );
}