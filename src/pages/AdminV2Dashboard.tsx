import { Settings } from 'lucide-react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { withAdminAuth } from '@/components/withAdminAuth';

// Dashboard components
import { QuickActions } from '@/components/admin/dashboard/QuickActions';
import { GlobalSearch } from '@/components/admin/dashboard/GlobalSearch';
import { StatusCards } from '@/components/admin/dashboard/StatusCards';
import { RecentItems } from '@/components/admin/dashboard/RecentItems';
import { UpcomingEvents } from '@/components/admin/dashboard/UpcomingEvents';
import { DataQualityAlerts } from '@/components/admin/dashboard/DataQualityAlerts';
import { SystemHealth } from '@/components/admin/dashboard/SystemHealth';
import { SessionInfo } from '@/components/admin/dashboard/SessionInfo';

function AdminV2Dashboard() {
  const { user } = useSecureAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard Admin</h1>
              <p className="text-muted-foreground">
                Bem-vindo, {user?.email} • Sistema administrativo completo
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Ações Rápidas */}
        <QuickActions />

        {/* Pesquisa Global */}
        <GlobalSearch />

        {/* Status Editorial - Contadores */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Status Editorial</h2>
          <StatusCards />
        </div>

        {/* Hoje e Próximos 7 dias */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Agenda</h2>
          <UpcomingEvents />
        </div>

        {/* Layout principal com 3 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Itens Recentes */}
          <RecentItems />

          {/* Qualidade dos Dados */}
          <DataQualityAlerts />

          {/* Saúde do Sistema + Sessão */}
          <div className="space-y-6">
            <SystemHealth />
            <SessionInfo />
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAdminAuth(AdminV2Dashboard, 'admin');