import AdminEventsList from './List';
import { withAdminAuth } from '@/components/withAdminAuth';

function AdminEventsIndex() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground">
            Gerencie eventos, shows e festivais
          </p>
        </div>
      </div>
      <AdminEventsList />
    </div>
  );
}

export default withAdminAuth(AdminEventsIndex, 'editor');