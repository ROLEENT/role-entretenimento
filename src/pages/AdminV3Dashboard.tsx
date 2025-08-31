import { KpiRow } from '@/components/dashboard/KpiRow';
import { RecentActivityTable } from '@/components/dashboard/RecentActivityTable';
import { HealthCard } from '@/components/dashboard/HealthCard';
import { EventsByCityChart } from '@/components/dashboard/EventsByCityChart';
import { EventsTimelineChart } from '@/components/dashboard/EventsTimelineChart';
import { StatsOverview } from '@/components/dashboard/StatsOverview';

function DashboardContent() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-foreground/70 mt-1">
          Painel administrativo
        </p>
      </div>
      
      {/* Dashboard Grid */}
      <div className="space-y-8">
        {/* KPIs */}
        <section aria-labelledby="kpis-heading">
          <h2 id="kpis-heading" className="text-xl font-semibold mb-2">Visão Geral</h2>
          <p className="text-foreground/70 mb-4">Principais métricas da plataforma</p>
          <KpiRow />
        </section>

        {/* Platform Overview */}
        <section aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="text-xl font-semibold mb-2">Resumo da Plataforma</h2>
          <p className="text-foreground/70 mb-4">Estatísticas gerais do sistema</p>
          <StatsOverview />
        </section>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section aria-labelledby="timeline-heading">
            <h2 id="timeline-heading" className="text-xl font-semibold mb-2">Tendência Temporal</h2>
            <p className="text-foreground/70 mb-4">Eventos cadastrados por período</p>
            <EventsTimelineChart />
          </section>

          <section aria-labelledby="cities-heading">
            <h2 id="cities-heading" className="text-xl font-semibold mb-2">Distribuição por Cidades</h2>
            <p className="text-foreground/70 mb-4">Top cidades com mais eventos</p>
            <EventsByCityChart />
          </section>
        </div>

        {/* System Health */}
        <section aria-labelledby="health-heading">
          <h2 id="health-heading" className="text-xl font-semibold mb-2">Status do Sistema</h2>
          <p className="text-foreground/70 mb-4">Monitoramento da infraestrutura</p>
          <HealthCard />
        </section>

        {/* Recent Activity */}
        <section aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="text-xl font-semibold mb-2">Atividade Recente</h2>
          <p className="text-foreground/70 mb-4">Últimas atualizações no sistema</p>
          <RecentActivityTable />
        </section>
      </div>
    </div>
  );
}

export default function AdminV3Dashboard() {
  return <DashboardContent />;
}