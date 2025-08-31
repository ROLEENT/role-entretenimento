import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { KpiRow } from '@/components/dashboard/KpiRow';
import { RecentActivityTable } from '@/components/dashboard/RecentActivityTable';
import { HealthCard } from '@/components/dashboard/HealthCard';
import { EventsWeeklyChart } from '@/components/dashboard/EventsWeeklyChart';

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

        {/* System Health */}
        <section aria-labelledby="health-heading">
          <h2 id="health-heading" className="text-xl font-semibold mb-2">Status do Sistema</h2>
          <p className="text-foreground/70 mb-4">Monitoramento da infraestrutura</p>
          <HealthCard />
        </section>

        {/* Weekly Chart */}
        <section aria-labelledby="chart-heading">
          <h2 id="chart-heading" className="text-xl font-semibold mb-2">Tendência de Eventos</h2>
          <p className="text-foreground/70 mb-4">Visualização temporal da atividade</p>
          <EventsWeeklyChart />
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
  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        <main className="pt-16 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <DashboardContent />
          </div>
        </main>
      </div>
    </AdminV3Guard>
  );
}