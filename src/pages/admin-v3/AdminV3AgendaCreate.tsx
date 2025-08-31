import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminEventForm from '@/components/admin/agenda/AdminEventForm';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';

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
    <div className="space-y-6">
      <AdminV3Breadcrumb items={breadcrumbs} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criar Novo Evento</h1>
          <p className="text-muted-foreground">Adicione um novo evento à agenda</p>
        </div>
      </div>
      
      <AdminEventForm 
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}