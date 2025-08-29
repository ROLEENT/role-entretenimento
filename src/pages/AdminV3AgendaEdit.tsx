import React from 'react';
import { useParams } from 'react-router-dom';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { AgendaForm } from '@/components/AgendaForm';

export default function AdminV3AgendaEdit() {
  const { id } = useParams();

  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Breadcrumb */}
            <AdminV3Breadcrumb 
              items={[
                { label: 'Agenda', path: '/admin-v3/agenda' },
                { label: 'Editar' }
              ]}
            />
            
            {/* AgendaForm */}
            <AgendaForm mode="edit" />
          </div>
        </div>
      </div>
    </AdminV3Guard>
  );
}