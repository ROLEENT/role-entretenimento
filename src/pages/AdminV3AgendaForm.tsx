import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { AgendaForm } from '@/components/admin/agenda/AgendaForm';

const AdminV3AgendaEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin/v3' },
    { label: 'Agenda', href: '/admin/v3/agenda' },
    { label: id ? 'Editar Item' : 'Novo Item', href: '#' },
  ];

  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        
        <main className="container mx-auto px-4 py-6">
          <AdminV3Breadcrumb items={breadcrumbItems} />
          
          <div className="mt-6">
            <AgendaForm 
              agendaId={id}
              onBack={() => navigate('/admin/v3/agenda')}
            />
          </div>
        </main>
      </div>
    </AdminV3Guard>
  );
};

export default AdminV3AgendaEdit;