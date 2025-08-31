import { KpiCard } from '@/components/ui/KpiCard';
import { Calendar, FileText, TrendingUp, Users } from 'lucide-react';
import { useAdminDashboardCounts } from '@/hooks/useAdminDashboardCounts';

export function KpiRow() {
  const { counts, loading, error } = useAdminDashboardCounts();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Indicadores principais">
      <KpiCard
        title="Contatos"
        value={counts?.contacts.total ?? 0}
        hint={`${counts?.contacts.last_7d ?? 0} nos últimos 7 dias`}
        icon={<Calendar className="h-4 w-4" />}
        isLoading={loading}
        aria-label={`${counts?.contacts.total ?? 0} contatos total`}
      />
      
      <KpiCard
        title="Newsletter"
        value={counts?.newsletter.total ?? 0}
        hint={`${counts?.newsletter.last_7d ?? 0} novos esta semana`}
        icon={<FileText className="h-4 w-4" />}
        isLoading={loading}
        aria-label={`${counts?.newsletter.total ?? 0} inscritos na newsletter`}
      />
      
      <KpiCard
        title="Candidaturas"
        value={counts?.job_applications.total ?? 0}
        hint={`${counts?.job_applications.last_7d ?? 0} esta semana`}
        icon={<TrendingUp className="h-4 w-4" />}
        isLoading={loading}
        aria-label={`${counts?.job_applications.total ?? 0} candidaturas de trabalho`}
      />
      
      <KpiCard
        title="Sistema"
        value={error ? 0 : 1}
        hint={error ? 'Com problemas' : 'Funcionando'}
        icon={<Users className="h-4 w-4" />}
        isLoading={loading}
        aria-label="Status do sistema"
      />
    </div>
  );
}