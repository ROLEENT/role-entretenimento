import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { AdminArtistEnhancedForm, ArtistEnhancedFormData } from '@/components/admin/forms/AdminArtistEnhancedForm';
import { useUpsertArtistEnhanced } from '@/hooks/useUpsertArtistEnhanced';

const AdminV3ArtistCreate: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: upsertArtist, isPending } = useUpsertArtistEnhanced();

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Agentes', path: '/admin-v3/agentes' },
    { label: 'Artistas', path: '/admin-v3/agentes/artistas' },
    { label: 'Novo Artista' },
  ];

  const handleSubmit = (data: ArtistEnhancedFormData) => {
    upsertArtist(data, {
      onSuccess: (result) => {
        if (result && result.id) {
          navigate(`/admin-v3/agentes/artistas/${result.id}/edit`);
        } else {
          navigate('/admin-v3/agentes/artistas');
        }
      },
    });
  };

  return (
    <AdminPageWrapper
      title="Novo Artista"
      description="Cadastre um novo artista no sistema"
      breadcrumbs={breadcrumbs}
    >
      <AdminArtistEnhancedForm
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </AdminPageWrapper>
  );
};

export default AdminV3ArtistCreate;