import { KpiCard } from '@/components/ui/KpiCard';
import { AlertTriangle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { useQualityMetrics } from '@/hooks/useQualityMetrics';

export function QualityKpiRow() {
  const { metrics, loading, error } = useQualityMetrics();

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getQualityStatus = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Boa';
    return 'Precisa Atenção';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Métricas de qualidade editorial">
      <KpiCard
        title="Score de Qualidade"
        value={error ? 0 : Math.round(metrics?.overall.qualityScore || 0)}
        hint={error ? 'Com problemas' : getQualityStatus(metrics?.overall.qualityScore || 0)}
        icon={<TrendingUp className="h-4 w-4" />}
        isLoading={loading}
        className={!loading && !error ? getQualityColor(metrics?.overall.qualityScore || 0) : ''}
        aria-label={`Score de qualidade: ${Math.round(metrics?.overall.qualityScore || 0)}`}
      />
      
      <KpiCard
        title="Taxa de Completude"
        value={error ? '0%' : `${Math.round(metrics?.overall.completenessRate || 0)}%`}
        hint={`${(metrics?.events.complete || 0) + (metrics?.venues.complete || 0)} itens completos`}
        icon={<CheckCircle2 className="h-4 w-4" />}
        isLoading={loading}
        aria-label={`${Math.round(metrics?.overall.completenessRate || 0)}% dos itens estão completos`}
      />
      
      <KpiCard
        title="Aguardam Revisão"
        value={error ? 0 : (metrics?.events.needsReview || 0) + (metrics?.venues.needsReview || 0)}
        hint="Completos mas ainda em draft"
        icon={<Clock className="h-4 w-4" />}
        isLoading={loading}
        className="text-warning"
        aria-label={`${(metrics?.events.needsReview || 0) + (metrics?.venues.needsReview || 0)} itens aguardam revisão`}
      />
      
      <KpiCard
        title="Itens Incompletos"
        value={error ? 0 : (metrics?.events.incomplete || 0) + (metrics?.venues.incomplete || 0)}
        hint="Menos de 60% completos"
        icon={<AlertTriangle className="h-4 w-4" />}
        isLoading={loading}
        className="text-destructive"
        aria-label={`${(metrics?.events.incomplete || 0) + (metrics?.venues.incomplete || 0)} itens estão incompletos`}
      />
    </div>
  );
}