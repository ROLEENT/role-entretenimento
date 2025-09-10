import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { AdminVenueEnhancedForm } from '@/components/admin/forms/AdminVenueEnhancedForm';
import { VenueEnhancedForm } from '@/schemas/entities/venue-enhanced';
import { useUpsertVenue } from '@/hooks/useUpsertAgents';

const AdminV3VenueCreate: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: upsertVenue, isPending } = useUpsertVenue();

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Agentes', path: '/admin-v3/agentes' },
    { label: 'Locais', path: '/admin-v3/agentes/venues' },
    { label: 'Novo Local' },
  ];

  const handleSubmit = (data: VenueEnhancedForm) => {
    // Convert to the format expected by the existing hook
    const mappedData = {
      name: data.name,
      city: data.city,
      state: data.state,
      country: data.country,
      about: data.about,
      email: data.email,
      phone: data.phone,
      whatsapp: data.whatsapp,
      instagram: data.instagram,
      website: data.website,
      logo_url: data.logo_url,
      logo_alt: data.logo_alt,
      cover_url: data.cover_url,
      cover_alt: data.cover_alt,
      status: 'active' as const,
      tags: data.tags || [],
      gallery_urls: [],
      // Map enhanced fields to existing structure
      address_line: data.address_line,
      district: data.district,
      postal_code: data.postal_code,
      bio_short: data.bio_short,
      capacity: data.capacity,
      opening_hours: {
        monday: "",
        tuesday: "",
        wednesday: "",
        thursday: "",
        friday: "",
        saturday: "",
        sunday: "",
      },
      latitude: data.latitude,
      longitude: data.longitude,
    };

    upsertVenue(mappedData, {
      onSuccess: (result) => {
        if (result && result.id) {
          navigate(`/admin-v3/agentes/venues/${result.id}/edit`);
        } else {
          navigate('/admin-v3/agentes/venues');
        }
      },
    });
  };

  return (
    <AdminPageWrapper
      title="Novo Local"
      description="Cadastre um novo espaço cultural, casa de shows, bar ou clube"
      breadcrumbs={breadcrumbs}
    >
      <AdminVenueEnhancedForm
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </AdminPageWrapper>
  );
};

export default AdminV3VenueCreate;