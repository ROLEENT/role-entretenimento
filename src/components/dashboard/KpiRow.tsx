import { KpiCard } from '@/components/ui/KpiCard';
import { Calendar, FileText, TrendingUp, Users } from 'lucide-react';

export function KpiRow() {
  return (
    <div className="dashboard-grid-responsive">
      <KpiCard
        title="Eventos Ativos"
        value={0}
        hint="publicados este mês"
        icon={<Calendar className="h-4 w-4" />}
        isLoading={true}
      />
      
      <KpiCard
        title="Rascunhos"
        value={0}
        hint="aguardando publicação"
        icon={<FileText className="h-4 w-4" />}
        isLoading={true}
      />
      
      <KpiCard
        title="Esta Semana"
        value={0}
        hint="eventos próximos"
        icon={<TrendingUp className="h-4 w-4" />}
        isLoading={true}
      />
      
      <KpiCard
        title="Agentes"
        value={0}
        hint="ativos na plataforma"
        icon={<Users className="h-4 w-4" />}
        isLoading={true}
      />
    </div>
  );
}