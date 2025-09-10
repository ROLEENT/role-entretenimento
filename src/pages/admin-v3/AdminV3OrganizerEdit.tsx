import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { AdminOrganizerEnhancedForm } from '@/components/admin/forms/AdminOrganizerEnhancedForm';
import { organizerEnhancedSchema, OrganizerEnhancedForm } from '@/schemas/entities/organizer-enhanced';
import { useUpsertOrganizerEnhanced } from '@/hooks/useUpsertEnhanced';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ProfileGenerationButton } from '@/components/admin/agents/ProfileGenerationButton';

const AdminV3OrganizerEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mutate: upsertOrganizer, isPending } = useUpsertOrganizerEnhanced();

  const { data: organizer, isLoading, error } = useQuery({
    queryKey: ['organizer', id],
    queryFn: async () => {
      if (!id) throw new Error('ID do organizador não fornecido');
      
      const { data, error } = await supabase
        .from('organizers')
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
    { label: 'Organizadores', path: '/admin-v3/agentes/organizadores' },
    { label: organizer?.name || 'Editar Organizador' },
  ];

  const handleSubmit = (data: OrganizerEnhancedForm) => {
    if (!id) return;
    
    upsertOrganizer({ ...data, id }, {
      onSuccess: () => {
        navigate('/admin-v3/agentes/organizadores');
      },
    });
  };

  if (isLoading) {
    return (
      <AdminPageWrapper
        title="Carregando..."
        description="Carregando dados do organizador"
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
        description="Erro ao carregar organizador"
        breadcrumbs={breadcrumbs}
      >
        <div className="text-center py-8">
          <p className="text-destructive">
            Erro ao carregar organizador: {error.message}
          </p>
        </div>
      </AdminPageWrapper>
    );
  }

  if (!organizer) {
    return (
      <AdminPageWrapper
        title="Organizador não encontrado"
        description="O organizador solicitado não foi encontrado"
        breadcrumbs={breadcrumbs}
      >
        <div className="text-center py-8">
          <p className="text-muted-foreground">Organizador não encontrado.</p>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title={`Editar: ${organizer.name}`}
      description="Atualize as informações do organizador"
      breadcrumbs={breadcrumbs}
      headerExtra={
        <ProfileGenerationButton
          agentData={{
            id: organizer.id,
            name: organizer.name,
            slug: organizer.slug,
            city: organizer.city,
            state: organizer.state,
            country: organizer.country,
            bio_short: organizer.bio_short,
            bio: organizer.bio,
            avatar_url: organizer.avatar_url,
            cover_url: organizer.cover_url,
            tags: organizer.tags,
            instagram: organizer.instagram,
            website: organizer.site,
            contact_email: organizer.contact_email,
          }}
          agentType="organizador"
        />
      }
    >
      <AdminOrganizerEnhancedForm
        organizer={organizer}
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </AdminPageWrapper>
  );
};

export default AdminV3OrganizerEdit;