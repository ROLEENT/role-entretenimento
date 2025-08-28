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
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* 1. Ações Rápidas - linha inteira */}
        <QuickActions />

        {/* 2. Pesquisa Global - linha inteira */}
        <GlobalSearch />

        {/* 3. Status Editorial - linha inteira */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Status Editorial</h2>
          <StatusCards />
        </div>

        {/* 4. Agenda - 2 blocos lado a lado */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Agenda</h2>
          <UpcomingEvents />
        </div>

        {/* 5. Layout principal: Itens Recentes e Qualidade dos Dados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentItems />
          <DataQualityAlerts />
        </div>

        {/* 6. Layout inferior: Sessão e Saúde do Sistema */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SessionInfo />
          <SystemHealth />
        </div>
      </main>
    </div>
  );
}

export default withAdminAuth(AdminV2Dashboard, 'admin');