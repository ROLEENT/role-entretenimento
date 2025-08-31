import { KpiRow } from '@/components/dashboard/KpiRow';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { EventsWeeklyChart } from '@/components/dashboard/EventsWeeklyChart';
import { RecentActivityTable } from '@/components/dashboard/RecentActivityTable';
import { HealthCard } from '@/components/dashboard/HealthCard';
import { Section } from '@/components/dashboard/Section';

export default function DashboardPage() {
  return (
    <main className="container mx-auto p-6 dashboard-spacing-xl" role="main">
      {/* Header */}
      <header className="dashboard-section-header">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Painel administrativo
        </p>
      </header>

      {/* Dashboard Grid */}
      <div className="dashboard-spacing-2xl">
        {/* KPIs */}
        <Section 
          title="Visão Geral"
          description="Principais métricas da plataforma"
        >
          <KpiRow />
        </Section>

        {/* Quick Actions */}
        <QuickActions />

        {/* Charts and Tables */}
        <div className="dashboard-grid-2-col">
          <Section 
            title="Análise Temporal"
            description="Tendências e padrões de eventos"
            headingLevel="h3"
          >
            <EventsWeeklyChart />
          </Section>

          <Section 
            title="Monitoramento"
            description="Atividades e logs recentes"
            headingLevel="h3"
          >
            <RecentActivityTable />
          </Section>
        </div>

        {/* Health Status */}
        <Section 
          title="Sistema"
          description="Status de saúde dos serviços"
          headingLevel="h3"
        >
          <HealthCard />
        </Section>
      </div>
    </main>
  );
}