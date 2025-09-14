import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { ArtistFormV5 } from '@/components/v5/forms/ArtistFormV5';

export default function AdminV3ArtistCreateV5() {
  const navigate = useNavigate();

  const handleSuccess = (data: any) => {
    navigate(`/admin-v3/artistas/${data.id}`);
  };

  return (
    <AdminV3Guard>
      <AdminV3Header />
      <div className="container mx-auto py-6">
        <AdminV3Breadcrumb
          items={[
            { label: "Dashboard", path: "/admin-v3" },
            { label: "Artistas", path: "/admin-v3/artistas" },
            { label: "Novo Artista" },
          ]}
        />

        <ArtistFormV5
          onSuccess={handleSuccess}
          backUrl="/admin-v3/artistas"
        />
      </div>
    </AdminV3Guard>
  );
}