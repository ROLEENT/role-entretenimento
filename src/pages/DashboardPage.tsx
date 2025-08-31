import { KpiRow } from '@/components/dashboard/KpiRow';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { EventsWeeklyChart } from '@/components/dashboard/EventsWeeklyChart';
import { RecentActivityTable } from '@/components/dashboard/RecentActivityTable';
import { HealthCard } from '@/components/dashboard/HealthCard';

export default function DashboardPage() {
  return (
    <main className="container mx-auto p-6 space-y-8" role="main">
      {/* Header */}
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Painel administrativo
        </p>
      </header>

      {/* Dashboard Grid */}
      <div className="space-y-8">
        {/* KPIs */}
        <section aria-labelledby="kpi-heading">
          <h2 id="kpi-heading" className="sr-only">
            Indicadores principais
          </h2>
          <KpiRow />
        </section>

        {/* Quick Actions */}
        <section aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="sr-only">
            Ações rápidas
          </h2>
          <QuickActions />
        </section>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section aria-labelledby="chart-heading">
            <h2 id="chart-heading" className="sr-only">
              Gráfico semanal de eventos
            </h2>
            <EventsWeeklyChart />
          </section>

          <section aria-labelledby="activity-heading">
            <h2 id="activity-heading" className="sr-only">
              Atividade recente
            </h2>
            <RecentActivityTable />
          </section>
        </div>

        {/* Health Status */}
        <section aria-labelledby="health-heading">
          <h2 id="health-heading" className="sr-only">
            Status do sistema
          </h2>
          <HealthCard />
        </section>
      </div>
    </main>
  );
}