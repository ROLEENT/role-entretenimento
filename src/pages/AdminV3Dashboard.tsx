import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { KpiRow } from '@/components/dashboard/KpiRow';
import { RecentActivityTable } from '@/components/dashboard/RecentActivityTable';

function DashboardContent() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Painel administrativo
        </p>
      </div>
      
      {/* Dashboard Grid */}
      <div className="dashboard-spacing-2xl">
        {/* KPIs */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Visão Geral</h2>
          <p className="text-muted-foreground mb-4">Principais métricas da plataforma</p>
          <KpiRow />
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Atividade Recente</h2>
          <p className="text-muted-foreground mb-4">Últimas atualizações no sistema</p>
          <RecentActivityTable />
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