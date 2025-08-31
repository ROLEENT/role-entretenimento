import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import AdminEventForm from '@/components/admin/agenda/AdminEventForm';

export default function AdminV3AgendaCreate() {
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: 'Dashboard', path: '/admin-v3' },
    { label: 'Agenda', path: '/admin-v3/agenda' },
    { label: 'Criar Evento' }
  ];

  const handleSave = () => {
    navigate('/admin-v3/agenda');
  };

  const handleCancel = () => {
    navigate('/admin-v3/agenda');
  };

  return (
    <AdminPageWrapper
      title="Criar Novo Evento"
      description="Adicione um novo evento à agenda"
      breadcrumbs={breadcrumbs}
    >
      <AdminEventForm 
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </AdminPageWrapper>
  );
}