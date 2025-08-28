import VenuesList from './List';
import { withAdminAuth } from '@/components/withAdminAuth';

function AdminVenuesIndex() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Locais</h1>
          <p className="text-muted-foreground">
            Gerencie bares, casas de show e espaços culturais
          </p>
        </div>
      </div>
      <VenuesList />
    </div>
  );
}

export default withAdminAuth(AdminVenuesIndex, 'editor');