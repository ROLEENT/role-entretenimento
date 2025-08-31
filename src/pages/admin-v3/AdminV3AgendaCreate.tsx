import React from 'react';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';

export default function AdminV3AgendaCreate() {
  const breadcrumbs = [
    { label: 'Dashboard', path: '/admin-v3' },
    { label: 'Agenda', path: '/admin-v3/agenda' },
    { label: 'Criar Evento' }
  ];

  return (
    <AdminPageWrapper
      title="Criar Novo Evento"
      description="Adicione um novo evento à agenda"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Formulário de Criação</h3>
          <p className="text-muted-foreground mt-2">
            Esta página será implementada na próxima etapa com o formulário completo de criação de eventos.
          </p>
        </div>
      </div>
    </AdminPageWrapper>
  );
}