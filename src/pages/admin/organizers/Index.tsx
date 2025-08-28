import React from 'react';
import OrganizersList from './List';
import { withAdminAuth } from '@/components/withAdminAuth';

function AdminOrganizersIndex() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizadores</h1>
          <p className="text-muted-foreground">
            Gerencie organizadores de eventos, produtoras e coletivos
          </p>
        </div>
      </div>
      <OrganizersList />
    </div>
  );
}

export default withAdminAuth(AdminOrganizersIndex, 'editor');