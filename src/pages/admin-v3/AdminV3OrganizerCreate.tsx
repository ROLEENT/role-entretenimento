import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { OrganizerFormV5 } from '@/components/v5/forms/OrganizerFormV5';

export default function AdminV3OrganizerCreate() {
  const navigate = useNavigate();

  const handleSuccess = (data: any) => {
    navigate(`/admin-v3/organizadores/${data.id}`);
  };

  return (
    <AdminV3Guard>
      <AdminV3Header />
      <div className="container mx-auto py-6">
        <AdminV3Breadcrumb
          items={[
            { label: 'Dashboard', path: '/admin-v3' },
            { label: 'Organizadores', path: '/admin-v3/organizadores' },
            { label: 'Novo Organizador' },
          ]}
        />

        <OrganizerFormV5 onSuccess={handleSuccess} backUrl="/admin-v3/organizadores" />
      </div>
    </AdminV3Guard>
  );
}