import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';

export default function AdminV3VenueCreate() {
  const navigate = useNavigate();

  return (
    <AdminV3Guard>
      <AdminV3Header />
      <div className="container mx-auto py-6">
        <AdminV3Breadcrumb
          items={[
            { label: "Dashboard", path: "/admin-v3" },
            { label: "Locais", path: "/admin-v3/venues" },
            { label: "Novo Local" },
          ]}
        />
        <div>Formulário de Local V5 em desenvolvimento...</div>
      </div>
    </AdminV3Guard>
  );
}