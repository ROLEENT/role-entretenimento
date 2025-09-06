import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LazyEventCreateWizard } from '@/components/events/LazyEventCreateWizard';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { toast } from 'sonner';

export default function AdminV3AgendaCreate() {
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: 'Dashboard', path: '/admin-v3' },
    { label: 'Agenda', path: '/admin-v3/agenda' },
    { label: 'Criar Evento' }
  ];

  const handleSave = (eventData: any) => {
    console.log("Agenda event created:", eventData);
    toast.success("Evento da agenda criado com sucesso!");
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
          <p className="text-muted-foreground">Use o assistente para criar um evento da agenda</p>
        </div>
      </div>
      
      <LazyEventCreateWizard 
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}