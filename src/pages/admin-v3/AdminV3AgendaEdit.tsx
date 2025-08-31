import React from 'react';
import { useParams } from 'react-router-dom';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';

export default function AdminV3AgendaEdit() {
  const { id } = useParams<{ id: string }>();

  const breadcrumbs = [
    { label: 'Dashboard', path: '/admin-v3' },
    { label: 'Agenda', path: '/admin-v3/agenda' },
    { label: 'Editar Evento' }
  ];

  return (
    <AdminPageWrapper
      title="Editar Evento"
      description="Edite as informações do evento"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Formulário de Edição</h3>
          <p className="text-muted-foreground mt-2">
            Esta página será implementada na próxima etapa com o formulário completo de edição de eventos.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Evento ID: {id}
          </p>
        </div>
      </div>
    </AdminPageWrapper>
  );
}