import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { AdminArtistForm, ArtistFormData } from '@/components/admin/agents/AdminArtistForm';
import { useUpsertArtist } from '@/hooks/useUpsertAgents';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ProfileGenerationButton } from '@/components/admin/agents/ProfileGenerationButton';

const AdminV3ArtistEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mutate: upsertArtist, isPending } = useUpsertArtist();

  const { data: artist, isLoading, error } = useQuery({
    queryKey: ['artist', id],
    queryFn: async () => {
      if (!id) throw new Error('ID do artista não fornecido');
      
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Agentes', path: '/admin-v3/agentes' },
    { label: 'Artistas', path: '/admin-v3/agentes/artistas' },
    { label: artist?.stage_name || 'Editar Artista' },
  ];

  const handleSubmit = (data: ArtistFormData) => {
    if (!id) return;
    
    upsertArtist({ ...data, id }, {
      onSuccess: () => {
        navigate('/admin-v3/agentes/artistas');
      },
    });
  };

  if (isLoading) {
    return (
      <AdminPageWrapper
        title="Carregando..."
        description="Carregando dados do artista"
        breadcrumbs={breadcrumbs}
      >
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </AdminPageWrapper>
    );
  }

  if (error) {
    return (
      <AdminPageWrapper
        title="Erro"
        description="Erro ao carregar artista"
        breadcrumbs={breadcrumbs}
      >
        <div className="text-center py-8">
          <p className="text-destructive">
            Erro ao carregar artista: {error.message}
          </p>
        </div>
      </AdminPageWrapper>
    );
  }

  if (!artist) {
    return (
      <AdminPageWrapper
        title="Artista não encontrado"
        description="O artista solicitado não foi encontrado"
        breadcrumbs={breadcrumbs}
      >
        <div className="text-center py-8">
          <p className="text-muted-foreground">Artista não encontrado.</p>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title={`Editar: ${artist.stage_name}`}
      description="Atualize as informações do artista"
      breadcrumbs={breadcrumbs}
      headerExtra={
        <ProfileGenerationButton
          agentData={{
            id: artist.id,
            name: artist.stage_name || artist.name,
            slug: artist.slug,
            city: artist.city,
            state: artist.state,
            country: artist.country,
            bio_short: artist.bio_short,
            bio: artist.bio_long,
            avatar_url: artist.profile_image_url,
            cover_url: artist.cover_image_url,
            tags: artist.tags,
            instagram: artist.instagram,
            website: artist.website_url,
            stage_name: artist.stage_name,
            booking_email: artist.booking_email,
          }}
          agentType="artista"
        />
      }
    >
      <AdminArtistForm
        artist={artist}
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </AdminPageWrapper>
  );
};

export default AdminV3ArtistEdit;