import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { AdminOrganizerEnhancedForm } from '@/components/admin/forms/AdminOrganizerEnhancedForm';
import { OrganizerEnhancedForm } from '@/schemas/entities/organizer-enhanced';
import { useUpsertOrganizer } from '@/hooks/useUpsertAgents';

const AdminV3OrganizerCreate: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: upsertOrganizer, isPending } = useUpsertOrganizer();

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Agentes', path: '/admin-v3/agentes' },
    { label: 'Organizadores', path: '/admin-v3/agentes/organizadores' },
    { label: 'Novo Organizador' },
  ];

  const handleSubmit = (data: OrganizerEnhancedForm) => {
    // Convert to the format expected by the existing hook
    const mappedData = {
      name: data.name,
      type: data.type,
      city: data.city,
      state: data.state,
      country: data.country,
      bio: data.manifesto,
      bio_short: data.bio_short,
      about: data.about,
      email: data.email,
      phone: data.phone,
      whatsapp: data.whatsapp,
      instagram: data.instagram,
      website: data.website,
      avatar_url: data.logo_url,
      avatar_alt: data.logo_alt,
      cover_url: data.cover_url,
      cover_alt: data.cover_alt,
      links: data.links,
      status: 'draft',
      // Map enhanced fields
      contact_email: data.email,
      contact_whatsapp: data.whatsapp,
      booking_email: data.booking_contact?.email,
      booking_whatsapp: data.booking_contact?.whatsapp,
    };

    upsertOrganizer(mappedData, {
      onSuccess: (result) => {
        if (result && result.id) {
          navigate(`/admin-v3/agentes/organizadores/${result.id}/edit`);
        } else {
          navigate('/admin-v3/agentes/organizadores');
        }
      },
    });
  };

  return (
    <AdminPageWrapper
      title="Novo Organizador"
      description="Cadastre um novo organizador no sistema"
      breadcrumbs={breadcrumbs}
    >
      <AdminOrganizerEnhancedForm
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </AdminPageWrapper>
  );
};

export default AdminV3OrganizerCreate;